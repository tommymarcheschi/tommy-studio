import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { sizeById, frameById, orderTotal } from '$lib/watercolor/print';

// POST /watercolor/api/order
// v1 fulfillment: you (Tommy) receive the order + the print-ready image, then
// order the print locally and hand-frame/ship. This is the PAYMENT SEAM:
//
//   ┌──────────────────────────────────────────────────────────────────────┐
//   │  TODO(stripe): when your personal Stripe account is live, create a      │
//   │  Checkout Session here (reuse the BMAG-Auction pattern) and return its  │
//   │  url instead of { ok: true }. The client already handles a `checkoutUrl`│
//   │  in the response and will redirect to it. Nothing else needs to change. │
//   └──────────────────────────────────────────────────────────────────────┘
//
// Until then this endpoint:
//   • validates the order,
//   • stores the print-ready image to Supabase Storage if configured (so you
//     get a clean high-res file, not a giant email), and
//   • notifies you (email via Resend if configured, else returns the summary so
//     the client can mailto:/show it). Everything fails soft.

interface OrderBody {
	image?: string; // data URL of the finished painting (print-ready)
	sizeId?: string;
	frameId?: string;
	qty?: number;
	type?: string;
	customer?: { name?: string; email?: string; address?: string; note?: string };
}

export const POST: RequestHandler = async ({ request }) => {
	let body: OrderBody;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'bad_json' }, { status: 400 });
	}

	const size = sizeById(body.sizeId ?? '');
	const frame = frameById(body.frameId ?? '');
	const qty = Math.max(1, Math.min(10, body.qty ?? 1));
	if (!size || !frame) return json({ error: 'invalid_options' }, { status: 400 });
	if (!body.image) return json({ error: 'missing_image' }, { status: 400 });
	if (!body.customer?.email) return json({ error: 'missing_email' }, { status: 400 });

	const total = orderTotal(size.id, frame.id, qty);
	const orderId = `wc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

	// 1 — Persist the print-ready image (optional; soft-fails to inline).
	let imageUrl: string | null = null;
	try {
		if (env.SUPABASE_SERVICE_URL && env.SUPABASE_SERVICE_KEY) {
			const b64 = body.image.split(',')[1] ?? '';
			const bytes = Buffer.from(b64, 'base64');
			const path = `watercolor-orders/${orderId}.png`;
			const up = await fetch(
				`${env.SUPABASE_SERVICE_URL}/storage/v1/object/${path}`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
						'Content-Type': 'image/png',
						'x-upsert': 'true'
					},
					body: bytes
				}
			);
			if (up.ok) {
				imageUrl = `${env.SUPABASE_SERVICE_URL}/storage/v1/object/public/${path}`;
			}
		}
	} catch (e) {
		console.error('[watercolor] image store failed:', e);
	}

	const summary = {
		orderId,
		size: size.label,
		frame: frame.label,
		qty,
		total,
		type: body.type ?? 'portrait',
		customer: body.customer,
		imageUrl
	};

	// 2 — Notify Tommy (optional; soft-fails to client-side mailto).
	let notified = false;
	try {
		const to = env.ORDER_NOTIFY_EMAIL;
		if (env.RESEND_API_KEY && to) {
			const res = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${env.RESEND_API_KEY}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from: 'Watercolor Studio <orders@tommy.studio>',
					to,
					subject: `🎨 New watercolor print order — ${size.label} ($${total})`,
					html: `
						<h2>New order ${orderId}</h2>
						<p><b>Size:</b> ${size.label} &nbsp; <b>Frame:</b> ${frame.label} &nbsp; <b>Qty:</b> ${qty}</p>
						<p><b>Total:</b> $${total}</p>
						<p><b>Customer:</b> ${body.customer?.name ?? ''} &lt;${body.customer?.email}&gt;</p>
						<p><b>Ship to:</b><br>${(body.customer?.address ?? '').replace(/\n/g, '<br>')}</p>
						<p><b>Note:</b> ${body.customer?.note ?? '—'}</p>
						${imageUrl ? `<p><a href="${imageUrl}">Download print-ready file</a></p>` : '<p>(image attached inline from client)</p>'}
					`
				})
			});
			notified = res.ok;
		}
	} catch (e) {
		console.error('[watercolor] notify failed:', e);
	}

	return json({
		ok: true,
		orderId,
		total,
		notified,
		imageStored: !!imageUrl,
		// checkoutUrl: null  ← Stripe goes here later; client redirects if present.
		summary
	});
};
