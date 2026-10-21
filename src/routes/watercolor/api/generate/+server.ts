import { json, type RequestHandler } from '@sveltejs/kit';
import { aiRepaint, activeProvider } from '$lib/watercolor/ai';

// POST /watercolor/api/generate
// Optional AI "repaint" pass. The client already runs the classical watercolor
// engine for a live, key-free result; this endpoint upgrades that result when an
// AI provider is configured. If no key is set it returns { provider: 'none' }
// and the client simply keeps its classical render.
export const POST: RequestHandler = async ({ request }) => {
	const provider = activeProvider();
	if (provider === 'none') {
		return json({ provider: 'none', image: null });
	}

	try {
		const body = await request.json();
		const { image, type, strength } = body ?? {};
		if (!image || typeof image !== 'string') {
			return json({ error: 'missing image' }, { status: 400 });
		}
		const repainted = await aiRepaint({
			image,
			type: type === 'landscape' || type === 'cartoon' ? type : 'portrait',
			strength: typeof strength === 'number' ? strength : undefined
		});
		return json({ provider, image: repainted });
	} catch (e) {
		console.error('[watercolor] AI repaint failed:', e);
		// Fail soft — client falls back to its classical render.
		return json({ provider, image: null, error: 'ai_failed' }, { status: 200 });
	}
};
