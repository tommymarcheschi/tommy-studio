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
		washLevels: 14,
		smoothRadius: 4,
		edgeDarkening: 0.5,
		granulation: 0.4,
		paper: 0.55,
		bleed: 2.5,
		saturation: 1.1,
		whiteBleed: 0.6
	},
	// Landscapes: looser, more atmospheric. Fewer washes, bigger bleed & granulation,
	// stronger edge pooling for that classic en-plein-air feel.
	landscape: {
		washLevels: 10,
		smoothRadius: 6,
		edgeDarkening: 0.65,
		granulation: 0.6,
		paper: 0.65,
		bleed: 4.5,
		saturation: 1.25,
		whiteBleed: 0.5
	},
	// Cartoons / illustrations: crisp shapes already, so keep washes graphic,
	// light smoothing, strong edge ink, minimal bleed.
	cartoon: {
		washLevels: 14,
		smoothRadius: 3,
		edgeDarkening: 0.75,
		granulation: 0.3,
		paper: 0.5,
		bleed: 1.8,
		saturation: 1.2,
		whiteBleed: 0.6
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

/**
 * Multi-octave turbulence (fractal noise). This is what gives watercolor its
 * organic, never-flat pigment density — water carries pigment in irregular
 * fingers and pools. Sums several noiseField octaves at halving amplitude.
 * Returned values are normalized to ~[0,1].
 */
function turbulence(
	w: number,
	h: number,
	baseScale: number,
	octaves: number,
	rand: () => number
): Float32Array {
	const out = new Float32Array(w * h);
	let amp = 1;
	let totalAmp = 0;
	let scale = baseScale;
	for (let o = 0; o < octaves; o++) {
		const layer = noiseField(w, h, scale, rand);
		for (let i = 0; i < out.length; i++) out[i] += layer[i] * amp;
		totalAmp += amp;
		amp *= 0.5;
		scale = Math.max(1.5, scale * 0.5);
	}
	for (let i = 0; i < out.length; i++) out[i] /= totalAmp;
	return out;
}

/** Separable box blur (fast Gaussian approx) over an RGB linear buffer, radius px. */
function blurRGB(src: Float32Array, w: number, h: number, radius: number): Float32Array {
	if (radius < 1) return src.slice();
	const r = Math.round(radius);
	const tmp = new Float32Array(src.length);
	const out = new Float32Array(src.length);
	const norm = 1 / (2 * r + 1);
	// Horizontal
	for (let y = 0; y < h; y++) {
		for (let c = 0; c < 3; c++) {
			let acc = 0;
			for (let k = -r; k <= r; k++) {
				const xx = Math.min(w - 1, Math.max(0, k));
				acc += src[(y * w + xx) * 3 + c];
			}
			for (let x = 0; x < w; x++) {
				tmp[(y * w + x) * 3 + c] = acc * norm;
				const xAdd = Math.min(w - 1, x + r + 1);
				const xSub = Math.max(0, x - r);
				acc += src[(y * w + xAdd) * 3 + c] - src[(y * w + xSub) * 3 + c];
			}
		}
	}
	// Vertical
	for (let x = 0; x < w; x++) {
		for (let c = 0; c < 3; c++) {
			let acc = 0;
			for (let k = -r; k <= r; k++) {
				const yy = Math.min(h - 1, Math.max(0, k));
				acc += tmp[(yy * w + x) * 3 + c];
			}
			for (let y = 0; y < h; y++) {
				out[(y * w + x) * 3 + c] = acc * norm;
				const yAdd = Math.min(h - 1, y + r + 1);
				const ySub = Math.max(0, y - r);
				acc += tmp[(yAdd * w + x) * 3 + c] - tmp[(ySub * w + x) * 3 + c];
			}
		}
	}
	return out;
}

/** Blur a single-channel scalar field, radius px (separable box). */
function blurScalar(src: Float32Array, w: number, h: number, radius: number): Float32Array {
	if (radius < 1) return src.slice();
	const r = Math.round(radius);
	const tmp = new Float32Array(src.length);
	const out = new Float32Array(src.length);
	const norm = 1 / (2 * r + 1);
	for (let y = 0; y < h; y++) {
		let acc = 0;
		for (let k = -r; k <= r; k++) acc += src[y * w + Math.min(w - 1, Math.max(0, k))];
		for (let x = 0; x < w; x++) {
			tmp[y * w + x] = acc * norm;
			acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)];
		}
	}
	for (let x = 0; x < w; x++) {
		let acc = 0;
		for (let k = -r; k <= r; k++) acc += tmp[Math.min(h - 1, Math.max(0, k)) * w + x];
		for (let y = 0; y < h; y++) {
			out[y * w + x] = acc * norm;
			acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
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

	// ── Watercolor model ────────────────────────────────────────────────────────
	// The look comes from TRANSLUCENT pigment over white paper, not opaque fills.
	// We work in "pigment density" space: 0 = bare paper (white), 1 = full pigment.
	// Light always comes from the paper beneath, so everything stays luminous.

	// 1 — Edge-preserving abstraction → simplified shapes (the artist's "drawing").
	const smoothed = edgePreservingSmooth(lin, w, h, p.smoothRadius, 0.12);

	// 2 — Soft washes. Quantize for structure, then BLEND back toward the smoothed
	//     image and blur the boundaries so washes bleed into each other instead of
	//     snapping (this kills the posterized/cutout look).
	const { out: washed, labels } = quantizeToWashes(smoothed, w, h, p.washLevels, rand);
	const softWash = new Float32Array(washed.length);
	for (let i = 0; i < washed.length; i++) softWash[i] = washed[i] * 0.55 + smoothed[i] * 0.45;
	// Bleed radius scales with the "bleed" param — wet paper spreads pigment.
	const bleedR = 1 + p.bleed * 1.6;
	const bled = blurRGB(softWash, w, h, bleedR);

	// 3 — Wet edges, softened into irregular blooms (not thin uniform lines).
	const rawEdges = washEdges(labels, w, h);
	const edgeBloom = blurScalar(rawEdges, w, h, 1 + p.bleed);

	// 4 — Pigment fields. Turbulence = uneven water flow; fine tooth = paper grain;
	//     granulation grid = heavier pigment settling into cold-press valleys.
	const turb = turbulence(w, h, 14, 5, rand); // large organic density variation
	const flow = turbulence(w, h, 40, 3, rand); // low-freq "where the water pooled"
	const tooth = noiseField(w, h, 2.0, rand);
	const gran = noiseField(w, h, 4.5, rand);

	// Pigment warp: displace the bleed sampling along the flow gradient so color
	// runs off its edges like wet paint. Precompute a displacement from flow.
	const result = wctx.createImageData(w, h);
	const sample = (buf: Float32Array, x: number, y: number, c: number) => {
		const xi = Math.min(w - 1, Math.max(0, Math.round(x)));
		const yi = Math.min(h - 1, Math.max(0, Math.round(y)));
		return buf[(yi * w + xi) * 3 + c];
	};

	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const pi = y * w + x;
			const i3 = pi * 3;

			// Wet displacement — pigment wanders. Strength scales with bleed. Kept
			// modest so boundaries soften rather than shredding into noisy fingers.
			const warp = (flow[pi] - 0.5) * p.bleed * 1.4;
			const wx = x + warp;
			const wy = y + (turb[pi] - 0.5) * p.bleed * 1.4;

			// Sample the bled wash (linear) and move to PERCEPTUAL sRGB [0,1]. All the
			// watercolor shaping below happens in sRGB so the photo's tonal range is
			// preserved and lights stay light (linear-space density crushed everything).
			let r = linToSrgb(sample(bled, wx, wy, 0)) / 255;
			let g = linToSrgb(sample(bled, wx, wy, 1)) / 255;
			let b = linToSrgb(sample(bled, wx, wy, 2)) / 255;

			// Saturation around perceptual luma (watercolor pigments are vivid).
			const luma0 = 0.299 * r + 0.587 * g + 0.114 * b;
			r = Math.min(1, Math.max(0, luma0 + (r - luma0) * p.saturation));
			g = Math.min(1, Math.max(0, luma0 + (g - luma0) * p.saturation));
			b = Math.min(1, Math.max(0, luma0 + (b - luma0) * p.saturation));

			// Pigment "load" = how far from bare paper this wash sits (0 = paper, 1 = dark).
			let load = 1 - luma0;

			// 5 — paper breathes through FIRST: pull the light end toward bare paper so
			//     highlights read as untouched luminous sheet, not grey. This lifts the
			//     white point; the effect fades out as the wash gets darker.
			const lift = p.whiteBleed;
			const lightLift = lift * (1 - load) * (1 - load); // strong only in lights
			r = r + (1 - r) * lightLift;
			g = g + (1 - g) * lightLift;
			b = b + (1 - b) * lightLift;
			load = Math.max(0, load - lift * (1 - load) * (1 - load));

			// 4a — turbulent wash density: water carries more/less pigment in irregular
			//      fingers. Multiplies the pigment load, enveloped toward the mid/dark
			//      washes (bare paper and solid darks stay put — variation there is mud).
			const washEnv = load * (1.1 - load);
			const densMod = ((turb[pi] - 0.5) * 0.28 + (flow[pi] - 0.5) * 0.18) * washEnv;

			// 4b — edge blooms: pigment pools and DARKENS at wet boundaries, irregularly.
			const bloom = edgeBloom[pi] * p.edgeDarkening * (0.5 + turb[pi] * 0.7) * 0.5;

			// 4c — granulation: grains settle into tooth, visible only in MID washes.
			const midEnv = 4 * load * (1 - load);
			const granMod = (gran[pi] - 0.5) * p.granulation * 0.35 * midEnv;

			// 4d — paper tooth: faint mottle where the wash is THIN (lights only).
			const toothMod = (tooth[pi] - 0.5) * p.paper * 0.08 * (1 - load);

			// Combine wash-shaping into a single per-pixel darken/lighten of the load,
			// then re-apply to the color as a multiplicative pigment layer over paper.
			const shaped = Math.min(1, Math.max(0, load * (1 + densMod) + bloom + granMod + toothMod));
			// Pigment multiplies the light passing through to paper: darker where shaped
			// is high. Keep hue by scaling each channel toward its wash color.
			const k = load > 1e-4 ? shaped / load : 1;
			let dr = 1 - Math.min(1, (1 - r) * k);
			let dg = 1 - Math.min(1, (1 - g) * k);
			let db = 1 - Math.min(1, (1 - b) * k);

			// dr/dg/db are final sRGB colors. Tint the lightest areas toward warm cream
			// paper (real watercolor paper isn't pure #fff) — only where near-white.
			const lightness = (dr + dg + db) / 3;
			const paperMix = Math.max(0, lightness - 0.8) / 0.2; // 0 below 0.8, 1 at white
			const or = dr * (1 - paperMix) + 0.988 * paperMix * dr + paperMix * 0.004;
			const og = dg * (1 - paperMix) + 0.980 * paperMix * dg + paperMix * 0.0;
			const ob = db * (1 - paperMix) + 0.958 * paperMix * db - paperMix * 0.004;

			const o = pi * 4;
			result.data[o] = Math.max(0, Math.min(255, Math.round(or * 255)));
			result.data[o + 1] = Math.max(0, Math.min(255, Math.round(og * 255)));
			result.data[o + 2] = Math.max(0, Math.min(255, Math.round(ob * 255)));
			result.data[o + 3] = 255;
		}
	}

	const out = document.createElement('canvas');
	out.width = w;
	out.height = h;
	const octx = out.getContext('2d')!;
	octx.putImageData(result, 0, 0);

	// 6 — Cold-press paper tooth as a final, GENTLE multiply. Values sit near white
	//     (242–255) so multiply only whispers a texture over the painting instead of
	//     dropping grey static across the darks. Low alpha keeps it tactile, not dirty.
	const grainCanvas = document.createElement('canvas');
	grainCanvas.width = w;
	grainCanvas.height = h;
	const gctx = grainCanvas.getContext('2d')!;
	const grainImg = gctx.createImageData(w, h);
	for (let pi = 0; pi < w * h; pi++) {
		const v = 242 + Math.round((tooth[pi] * 0.7 + turb[pi] * 0.3) * 13);
		const o = pi * 4;
		grainImg.data[o] = v;
		grainImg.data[o + 1] = v;
		grainImg.data[o + 2] = v - 3;
		grainImg.data[o + 3] = 255;
	}
	gctx.putImageData(grainImg, 0, 0);
	octx.globalCompositeOperation = 'multiply';
	octx.globalAlpha = Math.min(0.35, p.paper * 0.45);
	octx.drawImage(grainCanvas, 0, 0);
	octx.globalCompositeOperation = 'source-over';
	octx.globalAlpha = 1;

	return { canvas: out };
}
