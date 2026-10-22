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
	/** Backrun / bloom ("cauliflower") strength — pale centers ringed by dark drying fronts (0–1). */
	backrun: number;
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
		whiteBleed: 0.6,
		backrun: 0.3
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
		whiteBleed: 0.5,
		backrun: 0.55
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
		whiteBleed: 0.6,
		backrun: 0.15
	}
};

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
 * Guided filter (He, Sun & Tang 2010) — O(n) edge-preserving smoother built from
 * box blurs. This is the watercolor abstraction workhorse: it flattens flat
 * regions (skin, sky) into smooth washes while KEEPING real edges crisp, WITHOUT
 * the hard label regions that k-means produced (which caused every cutout/hole
 * artifact). Self-guided (guide = the image itself), run per channel.
 *
 *   mean_I  = f(I);  mean_II = f(I*I);  var = mean_II - mean_I^2
 *   a = var / (var + eps);  b = mean_I - a*mean_I
 *   q = f(a)*I + f(b)
 *
 * `eps` sets the edge threshold (bigger = more smoothing). `radius` is the box
 * window. Reduces to ~5 box blurs per channel — fast enough at working size.
 */
function guidedFilter(
	data: Float32Array,
	w: number,
	h: number,
	radius: number,
	eps: number,
	iters = 1
): Float32Array {
	const n = w * h;
	let src = data;
	for (let it = 0; it < iters; it++) {
		const out = new Float32Array(src.length);
		for (let c = 0; c < 3; c++) {
			// Pull channel c into scalar buffers.
			const I = new Float32Array(n);
			const II = new Float32Array(n);
			for (let i = 0; i < n; i++) {
				const v = src[i * 3 + c];
				I[i] = v;
				II[i] = v * v;
			}
			const meanI = blurScalar(I, w, h, radius);
			const meanII = blurScalar(II, w, h, radius);
			const a = new Float32Array(n);
			const b = new Float32Array(n);
			for (let i = 0; i < n; i++) {
				const varI = Math.max(0, meanII[i] - meanI[i] * meanI[i]);
				const ai = varI / (varI + eps);
				a[i] = ai;
				b[i] = meanI[i] - ai * meanI[i];
			}
			const meanA = blurScalar(a, w, h, radius);
			const meanB = blurScalar(b, w, h, radius);
			for (let i = 0; i < n; i++) out[i * 3 + c] = meanA[i] * src[i * 3 + c] + meanB[i];
		}
		src = out;
	}
	return src;
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

/**
 * Backrun / bloom field (the "cauliflower" — watercolor's most recognizable tell).
 * When a wetter wash runs into a drying one, water pushes pigment outward, leaving
 * a PALE center ringed by a DARKER, feathered drying front. We scatter a few large
 * blooms and return a SIGNED density field: negative in the center (lighter),
 * positive crest at the rim (darker), soft falloff beyond. Added in optical-density
 * space downstream, gated to mid-wash regions so faces/highlights stay clean.
 *
 * Deliberately SPARSE and LARGE — blooms are occasional events, not texture; that
 * is what keeps them reading as "hand-painted" rather than "noisy".
 */
function bloomField(
	w: number,
	h: number,
	count: number,
	rand: () => number
): Float32Array {
	const field = new Float32Array(w * h);
	const minDim = Math.min(w, h);
	for (let i = 0; i < count; i++) {
		const cx = rand() * w;
		const cy = rand() * h;
		const R = minDim * (0.08 + rand() * 0.14); // large: 8–22% of the short side
		const edgePhase = 0.68 + rand() * 0.12; // where the dark ring sits (fraction of R)
		const irr = 0.6 + rand() * 0.8; // per-bloom crest intensity variation
		const y0 = Math.max(0, Math.floor(cy - R * 1.2));
		const y1 = Math.min(h - 1, Math.ceil(cy + R * 1.2));
		const x0 = Math.max(0, Math.floor(cx - R * 1.2));
		const x1 = Math.min(w - 1, Math.ceil(cx + R * 1.2));
		// Slight anisotropy so blooms aren't perfect circles (water spreads unevenly).
		const ax = 0.8 + rand() * 0.5;
		const ay = 0.8 + rand() * 0.5;
		for (let y = y0; y <= y1; y++) {
			for (let x = x0; x <= x1; x++) {
				const dx = (x - cx) / ax;
				const dy = (y - cy) / ay;
				const d = Math.sqrt(dx * dx + dy * dy) / R;
				if (d > 1.18) continue;
				let v: number;
				if (d < edgePhase) {
					v = -0.5 * (1 - d / edgePhase); // pale, water-pushed center
				} else if (d < 1.0) {
					v = irr * Math.sin(((d - edgePhase) / (1.0 - edgePhase)) * Math.PI); // dark drying crest
				} else {
					v = irr * 0.3 * Math.max(0, 1 - (d - 1.0) / 0.18); // soft outer feather
				}
				field[y * w + x] += v;
			}
		}
	}
	return field;
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

	// 1 - Abstraction via GUIDED FILTER (replaces k-means entirely). Flattens skin/
	//     sky into smooth washes while keeping eye/lip/horizon edges - no label
	//     regions, so none of the boundary artifacts k-means caused. Radius & eps
	//     scale with smoothRadius; two light iterations for a clean painterly base.
	const gfR = Math.max(4, Math.round(p.smoothRadius * 2.5));
	const gfEps = 0.015 + p.smoothRadius * 0.004;
	const base = guidedFilter(lin, w, h, gfR, gfEps, 2);

	// 2 - Feathered luminance washes (SOFT posterize). Band LUMINANCE only (hue stays
	//     continuous -> no color-cell seams) with smoothstep transitions so there are
	//     no hard edges. Keeps chroma from `base`, recombines. Then bleed so washes run.
	const baseLum = new Float32Array(w * h);
	for (let i = 0; i < w * h; i++)
		baseLum[i] = 0.299 * base[i * 3] + 0.587 * base[i * 3 + 1] + 0.114 * base[i * 3 + 2];
	const bands = Math.max(4, Math.min(8, Math.round(p.washLevels * 0.45)));
	const washLum = new Float32Array(w * h);
	for (let i = 0; i < w * h; i++) {
		const L = Math.min(0.999999, Math.max(0, baseLum[i]));
		const s = L * bands;
		const lo = Math.floor(s);
		let f = s - lo;
		const tw = 0.42; // feather: flat band center, smoothstep across the transition
		f = f < tw ? 0 : f > 1 - tw ? 1 : (f - tw) / (1 - 2 * tw);
		const ft = f * f * (3 - 2 * f);
		washLum[i] = (lo + ft) / bands;
	}
	const washed = new Float32Array(w * h * 3);
	for (let i = 0; i < w * h; i++) {
		const ratio = baseLum[i] > 1e-4 ? washLum[i] / baseLum[i] : 1;
		washed[i * 3] = base[i * 3] * ratio;
		washed[i * 3 + 1] = base[i * 3 + 1] * ratio;
		washed[i * 3 + 2] = base[i * 3 + 2] * ratio;
	}
	// Bleed radius scales with the "bleed" param - wet paper spreads pigment.
	const bleedR = 1 + p.bleed * 1.3;
	const bled = blurRGB(washed, w, h, bleedR);

	// 3 - Wet edges from the ABSTRACTED luminance gradient (Curtis/Bousseau edge
	//     darkening on the SMOOTH field). Gated so only strong boundaries pool (kills
	//     near-white paper-hole rings); pooled density is biased one step into the
	//     DARKER side so the rim reads as pigment accumulating inside a drying wash.
	const edgeMag = new Float32Array(w * h);
	const edgeGx = new Float32Array(w * h);
	const edgeGy = new Float32Array(w * h);
	for (let y = 1; y < h - 1; y++) {
		for (let x = 1; x < w - 1; x++) {
			const pi = y * w + x;
			const gx =
				baseLum[pi - w - 1] + 2 * baseLum[pi - 1] + baseLum[pi + w - 1] -
				baseLum[pi - w + 1] - 2 * baseLum[pi + 1] - baseLum[pi + w + 1];
			const gy =
				baseLum[pi - w - 1] + 2 * baseLum[pi - w] + baseLum[pi - w + 1] -
				baseLum[pi + w - 1] - 2 * baseLum[pi + w] - baseLum[pi + w + 1];
			edgeGx[pi] = gx;
			edgeGy[pi] = gy;
			edgeMag[pi] = Math.sqrt(gx * gx + gy * gy);
		}
	}
	const EDGE_GATE = 0.05;
	const pooled = new Float32Array(w * h);
	for (let y = 1; y < h - 1; y++) {
		for (let x = 1; x < w - 1; x++) {
			const pi = y * w + x;
			const m = edgeMag[pi];
			if (m < EDGE_GATE) continue;
			const strength = Math.min(1, (m - EDGE_GATE) * 3.5);
			// Gradient points toward brighter; step the opposite way -> darker side.
			const tx = Math.min(w - 1, Math.max(0, x - Math.sign(edgeGx[pi])));
			const ty = Math.min(h - 1, Math.max(0, y - Math.sign(edgeGy[pi])));
			const ti = ty * w + tx;
			if (strength > pooled[ti]) pooled[ti] = strength;
		}
	}
	const edgeBloom = blurScalar(pooled, w, h, Math.max(1, Math.round(1 + p.bleed * 0.6)));
	// `localDetail` = how textured each region is -> modulate granulation (flat skin ->
	// low detail -> suppress grain; hair/clothing -> grain shows).
	const localDetail = blurScalar(edgeMag, w, h, 3);

	// 4 - Pigment fields. Turbulence = uneven water flow; fine tooth = paper grain;
	//     granulation grid = heavier pigment settling into cold-press valleys.
	const turb = turbulence(w, h, 14, 5, rand); // large organic density variation
	const flow = turbulence(w, h, 40, 3, rand); // low-freq "where the water pooled"
	const tooth = noiseField(w, h, 2.0, rand);
	const gran = noiseField(w, h, 4.5, rand);
	// Backruns/blooms: a few large, sparse "cauliflowers". Count scales with area
	// and the backrun param; a light blur softens the rim so it reads as a wet
	// drying front, not a drawn ring. Signed D-space field: pale center, dark rim.
	const bloomCount = Math.round(((w * h) / 90000) * (1 + p.backrun * 4));
	const blooms =
		p.backrun > 0 && bloomCount > 0
			? blurScalar(bloomField(w, h, bloomCount, rand), w, h, 2)
			: new Float32Array(w * h);

	// Hand-tremor WOBBLE: two LOW-frequency noise octaves offset the final sample
	//   coords (Bousseau UV-offset). Low frequency is the whole secret - high-freq
	//   warp was the old "noisy" look. Same fields for color & edges -> stay registered.
	const warpBig = turbulence(w, h, 80, 2, rand);
	const warpBigY = turbulence(w, h, 80, 2, rand);
	const warpSm = turbulence(w, h, 25, 2, rand);
	const warpSmY = turbulence(w, h, 25, 2, rand);
	const ampBig = p.bleed * 0.9;
	const ampSm = p.bleed * 0.3;

	const result = wctx.createImageData(w, h);
	// Bilinear sampler so the wobble reads as a smooth wiggle, not a stair-step.
	const sampleLin = (buf: Float32Array, x: number, y: number, c: number) => {
		const x0 = Math.min(w - 1, Math.max(0, Math.floor(x)));
		const y0 = Math.min(h - 1, Math.max(0, Math.floor(y)));
		const x1 = Math.min(w - 1, x0 + 1);
		const y1 = Math.min(h - 1, y0 + 1);
		const fx = Math.min(1, Math.max(0, x - x0));
		const fy = Math.min(1, Math.max(0, y - y0));
		const a = buf[(y0 * w + x0) * 3 + c];
		const bb = buf[(y0 * w + x1) * 3 + c];
		const cc = buf[(y1 * w + x0) * 3 + c];
		const d = buf[(y1 * w + x1) * 3 + c];
		return a + (bb - a) * fx + (cc - a) * fy + (a - bb - cc + d) * fx * fy;
	};
	const sampleScalar = (buf: Float32Array, x: number, y: number) => {
		const xi = Math.min(w - 1, Math.max(0, Math.round(x)));
		const yi = Math.min(h - 1, Math.max(0, Math.round(y)));
		return buf[yi * w + xi];
	};

	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const pi = y * w + x;

			// Wobble displacement (two octaves, low freq) applied to the sample coords.
			const wx = x + (warpBig[pi] - 0.5) * 2 * ampBig + (warpSm[pi] - 0.5) * 2 * ampSm;
			const wy = y + (warpBigY[pi] - 0.5) * 2 * ampBig + (warpSmY[pi] - 0.5) * 2 * ampSm;

			// Sample the bled wash (linear reflectance [0,1]).
			let lr = Math.max(1e-4, Math.min(1, sampleLin(bled, wx, wy, 0)));
			let lg = Math.max(1e-4, Math.min(1, sampleLin(bled, wx, wy, 1)));
			let lb = Math.max(1e-4, Math.min(1, sampleLin(bled, wx, wy, 2)));

			// Saturation around linear luma (vivid pigment), staying in linear light.
			const lLuma = 0.299 * lr + 0.587 * lg + 0.114 * lb;
			lr = Math.min(1, Math.max(1e-4, lLuma + (lr - lLuma) * p.saturation));
			lg = Math.min(1, Math.max(1e-4, lLuma + (lg - lLuma) * p.saturation));
			lb = Math.min(1, Math.max(1e-4, lLuma + (lb - lLuma) * p.saturation));

			// -> OPTICAL-DENSITY space (D = -log R). Pigment ADDS density here; this is
			//    why layered washes glow like real pigment instead of a dead multiply.
			let Dr = -Math.log(lr);
			let Dg = -Math.log(lg);
			let Db = -Math.log(lb);
			const loadN = 1 - lLuma; // perceptual 0..1 pigment load for the envelopes
			const detail = Math.min(1, sampleScalar(localDetail, wx, wy) * 2.4);

			// 4a - turbulent wash density: water carries more/less pigment in irregular
			//      fingers. Enveloped toward mid washes, suppressed on flat skin.
			const washEnv = loadN * (1.1 - loadN);
			const densAmt = 0.14 + 0.18 * detail;
			const densMod = ((turb[pi] - 0.5) * densAmt + (flow[pi] - 0.5) * densAmt * 0.6) * washEnv;

			// 4b - edge pooling: pooled density darkens toward pigment color at real
			//      edges. Added in D-space -> glows like wet pigment, not an ink line.
			const bloom = sampleScalar(edgeBloom, wx, wy) * p.edgeDarkening * (0.55 + turb[pi] * 0.45) * 0.55;

			// 4c - granulation: grains settle into tooth. Modulated by BOTH pigment
			//      density (lives in darks, ~absent on light skin) AND local texture.
			//      This is the fix that keeps faces clean & luminous.
			const densMask = Math.min(1, Math.max(0, (loadN - 0.22) / 0.5));
			const granMod = (gran[pi] - 0.5) * p.granulation * 0.45 * densMask * (0.35 + 0.65 * detail);

			// 4d - paper tooth: faint density mottle across the painting.
			const toothMod = (tooth[pi] - 0.5) * p.paper * 0.12 * (0.4 + 0.6 * detail);

			// 4e - backrun/bloom: signed D-space field (pale center, dark rim). Gated to
			//      mid-wash regions via washEnv so faces/highlights never cauliflower, and
			//      scaled by backrun. This is the headline "hand-painted" tell.
			const bloomMod =
				blooms[pi] * p.backrun * 1.35 * (0.5 + washEnv * 1.1) * (0.25 + 0.75 * (1 - detail));

			// Accumulate modulations as a SIGNED density offset (Beer-Lambert: density
			// adds). densMod/toothMod are signed (lighten or darken); bloom/granMod only
			// darken. A gentle exposure lift keeps the result luminous, not a dark photo.
			const lift = 0.2 + 0.5 * loadN; // exposure lift: open shadows toward paper so
			// the painting reads luminous (lifted) rather than a dark reproduction
			const dD = densMod + bloom + granMod + toothMod + bloomMod - lift;
			Dr = Math.max(0, Dr + dD);
			Dg = Math.max(0, Dg + dD);
			Db = Math.max(0, Db + dD);

			// -> back to reflectance, then sRGB.
			let r = linToSrgb(Math.exp(-Dr)) / 255;
			let g = linToSrgb(Math.exp(-Dg)) / 255;
			let b = linToSrgb(Math.exp(-Db)) / 255;

			// 5 - paper glow: warm cream paper shows through the THIN highlight washes,
			//     smoothly (no hard threshold -> no blobby holes).
			const lgt = (r + g + b) / 3;
			const glow = p.whiteBleed * 0.28 * Math.max(0, (lgt - 0.6) / 0.4);
			r = r + (0.99 - r) * glow;
			g = g + (0.985 - g) * glow;
			b = b + (0.96 - b) * glow;

			const o = pi * 4;
			result.data[o] = Math.max(0, Math.min(255, Math.round(r * 255)));
			result.data[o + 1] = Math.max(0, Math.min(255, Math.round(g * 255)));
			result.data[o + 2] = Math.max(0, Math.min(255, Math.round(b * 255)));
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
