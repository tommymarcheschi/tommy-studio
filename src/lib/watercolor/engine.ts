// ─────────────────────────────────────────────────────────────────────────────
//  Watercolor engine — classical, dependency-free, runs on a <canvas> in-browser.
//
//  This is the "not AI slop" core. Instead of a one-line CSS/blur filter, it
//  layers the physical phenomena that make a real watercolor look hand-painted:
//
//    1. Edge-preserving abstraction   (bilateral-ish smoothing → soft washes)
//    2. Palette reduction into washes (perceptual color quantization)
//    3. Wet-edge pigment pooling      (dark rims where washes meet — "blooms")
//    4. Granulation                   (pigment settling into paper tooth)
//    5. Paper grain + deckle          (cold-press texture, luminous whites)
//    6. Hand wobble                   (slight domain warp so edges aren't CNC-perfect)
//
//  Everything is tunable per photo type (portrait / landscape / cartoon) via
//  presets. When an AI provider key is present the pipeline can run AI first
//  (img2img, likeness-preserving) and then apply layers 3–6 on top — but this
//  module works fully with ZERO keys so the demo is live today.
// ─────────────────────────────────────────────────────────────────────────────

export type PhotoType = 'portrait' | 'landscape' | 'cartoon';

export interface WatercolorParams {
	/** How strongly colors collapse into flat washes (2–16). Fewer = more graphic. */
	washLevels: number;
	/** Edge-preserving smoothing radius in px. Larger = softer, more abstract. */
	smoothRadius: number;
	/** Strength of the dark pigment rim at wash boundaries (0–1). */
	edgeDarkening: number;
	/** Granulation strength — pigment settling into paper tooth (0–1). */
	granulation: number;
	/** Paper texture strength (0–1). */
	paper: number;
	/** Hand-wobble / wet-bleed domain warp in px (0–6). */
	bleed: number;
	/** Overall pigment saturation boost (0.5–1.6). */
	saturation: number;
	/** How much of the white paper shows through in highlights (0–1). */
	whiteBleed: number;
}

export const PRESETS: Record<PhotoType, WatercolorParams> = {
	// Portraits: protect the face. Gentle smoothing, more washes to keep features,
	// soft edges, restrained bleed so eyes/mouth stay readable.
	portrait: {
		washLevels: 10,
		smoothRadius: 3,
		edgeDarkening: 0.45,
		granulation: 0.35,
		paper: 0.5,
		bleed: 2,
		saturation: 1.05,
		whiteBleed: 0.5
	},
	// Landscapes: looser, more atmospheric. Fewer washes, bigger bleed & granulation,
	// stronger edge pooling for that classic en-plein-air feel.
	landscape: {
		washLevels: 7,
		smoothRadius: 5,
		edgeDarkening: 0.6,
		granulation: 0.55,
		paper: 0.6,
		bleed: 4,
		saturation: 1.2,
		whiteBleed: 0.4
	},
	// Cartoons / illustrations: crisp shapes already, so keep washes graphic,
	// light smoothing, strong edge ink, minimal bleed.
	cartoon: {
		washLevels: 12,
		smoothRadius: 2,
		edgeDarkening: 0.7,
		granulation: 0.25,
		paper: 0.45,
		bleed: 1,
		saturation: 1.15,
		whiteBleed: 0.55
	}
};

type RGB = [number, number, number];

/** Deterministic hash → [0,1) PRNG so results are stable for a given image. */
function mulberry32(seed: number) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// sRGB <-> linear helpers for perceptually correct blending.
const srgbToLin = (c: number) => {
	c /= 255;
	return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const linToSrgb = (c: number) => {
	const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
	return Math.max(0, Math.min(255, Math.round(v * 255)));
};

/**
 * Edge-preserving smoothing — a fast separable approximation of a bilateral
 * filter. Smooths flat regions into washes while keeping strong edges (faces,
 * horizons) from smearing. Works in linear light.
 */
function edgePreservingSmooth(
	data: Float32Array,
	w: number,
	h: number,
	radius: number,
	sigmaColor: number
): Float32Array {
	if (radius < 1) return data;
	const out = new Float32Array(data.length);
	const r = Math.round(radius);
	const invColor = 1 / (2 * sigmaColor * sigmaColor);

	// Two passes (horizontal, then vertical) — cheap, visually close to 2D bilateral.
	const pass = (src: Float32Array, dst: Float32Array, horizontal: boolean) => {
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const i = (y * w + x) * 3;
				const cr = src[i];
				const cg = src[i + 1];
				const cb = src[i + 2];
				let ar = 0,
					ag = 0,
					ab = 0,
					wsum = 0;
				for (let k = -r; k <= r; k++) {
					const xx = horizontal ? x + k : x;
					const yy = horizontal ? y : y + k;
					if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
					const j = (yy * w + xx) * 3;
					const dr = src[j] - cr;
					const dg = src[j + 1] - cg;
					const db = src[j + 2] - cb;
					const colorDist = dr * dr + dg * dg + db * db;
					const spatial = Math.exp((-(k * k) / (2 * r * r)) || 0);
					const weight = spatial * Math.exp(-colorDist * invColor);
					ar += src[j] * weight;
					ag += src[j + 1] * weight;
					ab += src[j + 2] * weight;
					wsum += weight;
				}
				dst[i] = ar / wsum;
				dst[i + 1] = ag / wsum;
				dst[i + 2] = ab / wsum;
			}
		}
	};

	const tmp = new Float32Array(data.length);
	pass(data, tmp, true);
	pass(tmp, out, false);
	return out;
}

/**
 * Reduce the image to a small set of color "washes" via a lightweight k-means in
 * linear RGB. This is what gives watercolor its flat, layered-pigment look
 * instead of smooth photographic gradients.
 */
function quantizeToWashes(
	data: Float32Array,
	w: number,
	h: number,
	k: number,
	rand: () => number
): { out: Float32Array; labels: Uint16Array } {
	const n = w * h;
	const centers: RGB[] = [];
	// Seed centers from random pixels.
	for (let c = 0; c < k; c++) {
		const p = Math.floor(rand() * n) * 3;
		centers.push([data[p], data[p + 1], data[p + 2]]);
	}
	const labels = new Uint16Array(n);
	const iters = 6;
	for (let it = 0; it < iters; it++) {
		// Assign
		for (let p = 0; p < n; p++) {
			const i = p * 3;
			let best = 0;
			let bestD = Infinity;
			for (let c = 0; c < k; c++) {
				const dr = data[i] - centers[c][0];
				const dg = data[i + 1] - centers[c][1];
				const db = data[i + 2] - centers[c][2];
				const d = dr * dr + dg * dg + db * db;
				if (d < bestD) {
					bestD = d;
					best = c;
				}
			}
			labels[p] = best;
		}
		// Update
		const sum = Array.from({ length: k }, () => [0, 0, 0, 0] as number[]);
		for (let p = 0; p < n; p++) {
			const i = p * 3;
			const c = labels[p];
			sum[c][0] += data[i];
			sum[c][1] += data[i + 1];
			sum[c][2] += data[i + 2];
			sum[c][3]++;
		}
		for (let c = 0; c < k; c++) {
			if (sum[c][3] > 0) {
				centers[c][0] = sum[c][0] / sum[c][3];
				centers[c][1] = sum[c][1] / sum[c][3];
				centers[c][2] = sum[c][2] / sum[c][3];
			}
		}
	}
	const out = new Float32Array(data.length);
	for (let p = 0; p < n; p++) {
		const c = labels[p];
		const i = p * 3;
		out[i] = centers[c][0];
		out[i + 1] = centers[c][1];
		out[i + 2] = centers[c][2];
	}
	return { out, labels };
}

/** Sobel edge magnitude from the wash labels → where pigment pools & darkens. */
function washEdges(labels: Uint16Array, w: number, h: number): Float32Array {
	const edge = new Float32Array(w * h);
	for (let y = 1; y < h - 1; y++) {
		for (let x = 1; x < w - 1; x++) {
			const p = y * w + x;
			const l = labels[p];
			// Count differing 4-neighbours → boundary strength.
			let diff = 0;
			if (labels[p - 1] !== l) diff++;
			if (labels[p + 1] !== l) diff++;
			if (labels[p - w] !== l) diff++;
			if (labels[p + w] !== l) diff++;
			edge[p] = diff / 4;
		}
	}
	// Light blur so rims feel wet, not pixelated.
	const blurred = new Float32Array(w * h);
	for (let y = 1; y < h - 1; y++) {
		for (let x = 1; x < w - 1; x++) {
			const p = y * w + x;
			blurred[p] =
				(edge[p] * 4 +
					edge[p - 1] +
					edge[p + 1] +
					edge[p - w] +
					edge[p + w]) /
				8;
		}
	}
	return blurred;
}

/** Value-noise field for paper tooth & granulation (cheap, tileable-ish). */
function noiseField(w: number, h: number, scale: number, rand: () => number): Float32Array {
	const gw = Math.ceil(w / scale) + 2;
	const gh = Math.ceil(h / scale) + 2;
	const grid = new Float32Array(gw * gh);
	for (let i = 0; i < grid.length; i++) grid[i] = rand();
	const out = new Float32Array(w * h);
	const smooth = (t: number) => t * t * (3 - 2 * t);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const gx = x / scale;
			const gy = y / scale;
			const x0 = Math.floor(gx);
			const y0 = Math.floor(gy);
			const fx = smooth(gx - x0);
			const fy = smooth(gy - y0);
			const a = grid[y0 * gw + x0];
			const b = grid[y0 * gw + x0 + 1];
			const c = grid[(y0 + 1) * gw + x0];
			const d = grid[(y0 + 1) * gw + x0 + 1];
			const top = a + (b - a) * fx;
			const bot = c + (d - c) * fx;
			out[y * w + x] = top + (bot - top) * fy;
		}
	}
	return out;
}

export interface RenderResult {
	/** Canvas with the finished painting, ready to toDataURL/toBlob. */
	canvas: HTMLCanvasElement;
}

/**
 * Render a watercolor from a source image onto a fresh canvas.
 * Pure client-side; no network. Returns the canvas so the caller can preview,
 * download, or hand the high-res version to the print/order flow.
 */
export function renderWatercolor(
	source: HTMLImageElement | HTMLCanvasElement,
	type: PhotoType,
	overrides: Partial<WatercolorParams> = {},
	maxDim = 1400
): RenderResult {
	const p: WatercolorParams = { ...PRESETS[type], ...overrides };

	// Scale to a working size (keeps k-means fast; print path re-runs at full res).
	const sw = (source as HTMLImageElement).naturalWidth || source.width;
	const sh = (source as HTMLImageElement).naturalHeight || source.height;
	const scale = Math.min(1, maxDim / Math.max(sw, sh));
	const w = Math.max(1, Math.round(sw * scale));
	const h = Math.max(1, Math.round(sh * scale));

	const work = document.createElement('canvas');
	work.width = w;
	work.height = h;
	const wctx = work.getContext('2d', { willReadFrequently: true })!;
	wctx.drawImage(source, 0, 0, w, h);
	const img = wctx.getImageData(0, 0, w, h);

	// Seed PRNG from a sparse pixel digest so the same photo renders the same.
	let seed = w * 73856093 + h * 19349663;
	for (let i = 0; i < img.data.length; i += 4099) seed = (seed + img.data[i]) | 0;
	const rand = mulberry32(seed);

	// → linear RGB
	const lin = new Float32Array(w * h * 3);
	for (let p2 = 0; p2 < w * h; p2++) {
		lin[p2 * 3] = srgbToLin(img.data[p2 * 4]);
		lin[p2 * 3 + 1] = srgbToLin(img.data[p2 * 4 + 1]);
		lin[p2 * 3 + 2] = srgbToLin(img.data[p2 * 4 + 2]);
	}

	// 1 — Edge-preserving abstraction
	const smoothed = edgePreservingSmooth(lin, w, h, p.smoothRadius, 0.12);

	// 2 — Collapse into washes
	const { out: washed, labels } = quantizeToWashes(smoothed, w, h, p.washLevels, rand);

	// 3 — Wet-edge map
	const edges = washEdges(labels, w, h);

	// 4/5 — Paper tooth (fine) + granulation (coarse) noise
	const tooth = noiseField(w, h, 2.2, rand);
	const gran = noiseField(w, h, 5.5, rand);

	// Compose: start from washed pigment, then physically modulate.
	const result = wctx.createImageData(w, h);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const pi = y * w + x;
			const i3 = pi * 3;
			let r = washed[i3];
			let g = washed[i3 + 1];
			let b = washed[i3 + 2];

			// Saturation in linear light around luma.
			const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
			r = luma + (r - luma) * p.saturation;
			g = luma + (g - luma) * p.saturation;
			b = luma + (b - luma) * p.saturation;

			// 3 — pigment pooling: darken toward wash edges (multiplicative).
			const rim = edges[pi] * p.edgeDarkening;
			const rimMul = 1 - rim * 0.7;
			r *= rimMul;
			g *= rimMul;
			b *= rimMul;

			// 4 — granulation: pigment settles unevenly in paper valleys (darker)
			//     and lifts on peaks (lighter) — strongest in mid/dark washes.
			const grainPixel = (gran[pi] - 0.5) * p.granulation * 0.35 * (1 - luma * 0.5);
			r *= 1 - grainPixel;
			g *= 1 - grainPixel;
			b *= 1 - grainPixel;

			// 5 — paper: in the lightest areas let the white of the paper bleed
			//     through (watercolor can't make a true opaque white).
			const paperWhite = tooth[pi];
			const highlight = Math.max(0, luma - (1 - p.whiteBleed)) / Math.max(0.0001, p.whiteBleed);
			const toWhite = highlight * p.whiteBleed * (0.6 + paperWhite * 0.4);
			r = r + (1 - r) * toWhite;
			g = g + (1 - g) * toWhite;
			b = b + (1 - b) * toWhite;

			// 5b — paper tooth very subtly textures everything (cold-press grain).
			const toothMod = 1 + (tooth[pi] - 0.5) * p.paper * 0.08;
			r *= toothMod;
			g *= toothMod;
			b *= toothMod;

			const o = pi * 4;
			result.data[o] = linToSrgb(r);
			result.data[o + 1] = linToSrgb(g);
			result.data[o + 2] = linToSrgb(b);
			result.data[o + 3] = 255;
		}
	}
	wctx.putImageData(result, 0, 0);

	// 6 — Hand wobble / wet bleed: a tiny domain warp + feathered edge, drawn onto
	//     a paper-tinted base so the border looks like paint on a sheet, not a crop.
	const out = document.createElement('canvas');
	out.width = w;
	out.height = h;
	const octx = out.getContext('2d')!;
	// Warm paper base
	octx.fillStyle = '#fdfcf7';
	octx.fillRect(0, 0, w, h);

	if (p.bleed > 0.5) {
		// Draw the painting in a few slightly offset, low-alpha passes → wet bleed.
		const passes = 3;
		for (let s = 0; s < passes; s++) {
			const dx = (rand() - 0.5) * p.bleed;
			const dy = (rand() - 0.5) * p.bleed;
			octx.globalAlpha = s === 0 ? 1 : 0.4;
			octx.drawImage(work, dx, dy);
		}
		octx.globalAlpha = 1;
	} else {
		octx.drawImage(work, 0, 0);
	}

	// Multiply a faint paper grain over the whole thing for cohesion.
	const grainCanvas = document.createElement('canvas');
	grainCanvas.width = w;
	grainCanvas.height = h;
	const gctx = grainCanvas.getContext('2d')!;
	const grainImg = gctx.createImageData(w, h);
	for (let pi = 0; pi < w * h; pi++) {
		const v = 235 + Math.round(tooth[pi] * 20);
		const o = pi * 4;
		grainImg.data[o] = v;
		grainImg.data[o + 1] = v;
		grainImg.data[o + 2] = v - 4;
		grainImg.data[o + 3] = 255;
	}
	gctx.putImageData(grainImg, 0, 0);
	octx.globalCompositeOperation = 'multiply';
	octx.globalAlpha = p.paper * 0.5;
	octx.drawImage(grainCanvas, 0, 0);
	octx.globalCompositeOperation = 'source-over';
	octx.globalAlpha = 1;

	return { canvas: out };
}
