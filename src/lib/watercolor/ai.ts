// ─────────────────────────────────────────────────────────────────────────────
//  AI provider seam (server-side only).
//
//  The classical engine (engine.ts) runs fully in the browser with no keys and
//  is what powers the live demo today. This module is the OPTIONAL, dormant
//  upgrade path: when a REPLICATE_API_TOKEN (or OPENAI_API_KEY) is present in the
//  environment, the server can run an AI "repaint" pass FIRST — likeness-
//  preserving img2img — and the client then layers the watercolor physics on top.
//
//  Design rules:
//   • Likeness first. We use low-strength img2img + structural conditioning so
//     the actual faces/poses survive. This is the anti-"AI slop" guardrail.
//   • Zero-key fallback. If no provider is configured, aiRepaint() returns null
//     and the caller just uses the classical engine. Nothing breaks.
//   • No keys in the client. This file is imported only from +server.ts.
// ─────────────────────────────────────────────────────────────────────────────

import { env } from '$env/dynamic/private';

export type Provider = 'replicate' | 'openai' | 'none';

export function activeProvider(): Provider {
	if (env.REPLICATE_API_TOKEN) return 'replicate';
	if (env.OPENAI_API_KEY) return 'openai';
	return 'none';
}

export interface RepaintInput {
	/** Base64 data URL or https URL of the source photo. */
	image: string;
	type: 'portrait' | 'landscape' | 'cartoon';
	/** 0–1. Lower = stays closer to the original (protect likeness). */
	strength?: number;
}

const STYLE_PROMPT: Record<RepaintInput['type'], string> = {
	portrait:
		'delicate watercolor portrait, soft washes, preserved facial features and likeness, loose wet-on-wet background, fine art paper, painted by a skilled watercolorist',
	landscape:
		'atmospheric watercolor landscape, loose expressive washes, wet-on-wet skies, granulating pigment, cold-press paper, plein air fine art',
	cartoon:
		'clean watercolor illustration, crisp ink line, flat luminous washes, storybook fine art'
};

/**
 * Run an AI repaint. Returns a data URL of the repainted image, or null if no
 * provider is configured (caller falls back to the classical engine).
 *
 * NOTE: This is wired but intentionally DORMANT until a key is added. The
 * Replicate model id/version is a placeholder you confirm when you enable it —
 * swap REPLICATE_MODEL to your chosen img2img+ControlNet model.
 */
export async function aiRepaint(input: RepaintInput): Promise<string | null> {
	const provider = activeProvider();
	if (provider === 'none') return null;

	const strength = input.strength ?? 0.35; // low = likeness-preserving
	const prompt = STYLE_PROMPT[input.type];

	if (provider === 'replicate') {
		const model = env.REPLICATE_MODEL; // e.g. "stability-ai/sdxl:<version>"
		if (!model) return null; // not fully configured yet → fall back
		const res = await fetch('https://api.replicate.com/v1/predictions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
				'Content-Type': 'application/json',
				Prefer: 'wait' // block until done (simpler; swap for polling at scale)
			},
			body: JSON.stringify({
				version: model.includes(':') ? model.split(':')[1] : model,
				input: {
					image: input.image,
					prompt,
					prompt_strength: strength, // img2img: how far from source
					negative_prompt: 'deformed face, extra fingers, oversaturated, 3d render, photo',
					num_inference_steps: 30,
					guidance_scale: 6
				}
			})
		});
		if (!res.ok) throw new Error(`Replicate ${res.status}: ${await res.text()}`);
		const json: any = await res.json();
		const out = Array.isArray(json.output) ? json.output[0] : json.output;
		return typeof out === 'string' ? out : null;
	}

	if (provider === 'openai') {
		// gpt-image-1 edit endpoint. Less structural control than Replicate; use
		// only if that's the key you have. Returns a b64 image.
		const form = new FormData();
		// image must be a file; data URL → blob
		const blob = await (await fetch(input.image)).blob();
		form.append('model', 'gpt-image-1');
		form.append('image', blob, 'source.png');
		form.append('prompt', `Repaint this exact image as a ${prompt}. Keep the subject's identity and composition faithful.`);
		form.append('size', '1024x1024');
		const res = await fetch('https://api.openai.com/v1/images/edits', {
			method: 'POST',
			headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
			body: form
		});
		if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
		const json: any = await res.json();
		const b64 = json?.data?.[0]?.b64_json;
		return b64 ? `data:image/png;base64,${b64}` : null;
	}

	return null;
}
