<script lang="ts">
	import { renderWatercolor, PRESETS, type PhotoType, type WatercolorParams } from '$lib/watercolor/engine';
	import { PRINT_SIZES, FRAME_OPTIONS, orderTotal } from '$lib/watercolor/print';

	// ── Flow state ──────────────────────────────────────────────────────────────
	type Step = 'upload' | 'studio' | 'order' | 'done';
	let step = $state<Step>('upload');
	let guided = $state(false); // "walk me through it" overlay for Calli

	let photoType = $state<PhotoType>('portrait');
	let sourceImg: HTMLImageElement | null = $state(null);
	let sourceUrl = $state('');
	let fileName = $state('');

	let rendering = $state(false);
	let resultUrl = $state('');
	let aiStatus = $state<'idle' | 'running' | 'applied' | 'none'>('idle');

	// Live-tunable params (seeded from the preset for the chosen type).
	let params = $state<WatercolorParams>({ ...PRESETS.portrait });

	// ── Order state ───────────────────────────────────────────────────────────────
	let sizeId = $state('8x10');
	let frameId = $state('black');
	let qty = $state(1);
	let cust = $state({ name: '', email: '', address: '', note: '' });
	let placing = $state(false);
	let orderResult = $state<any>(null);
	let orderError = $state('');

	const total = $derived(orderTotal(sizeId, frameId, qty));

	let fileInput: HTMLInputElement | undefined = $state();

	function onPickType(t: PhotoType) {
		photoType = t;
		params = { ...PRESETS[t] };
		if (sourceImg) rerender();
	}

	function handleFile(file: File) {
		if (!file.type.startsWith('image/')) return;
		fileName = file.name;
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			sourceImg = img;
			sourceUrl = url;
			step = 'studio';
			// Auto-guess type by aspect ratio as a gentle default.
			const ar = img.naturalWidth / img.naturalHeight;
			if (ar > 1.25) onPickType('landscape');
			else onPickType('portrait');
			rerender();
		};
		img.src = url;
	}

	function onInputChange(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0];
		if (f) handleFile(f);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		const f = e.dataTransfer?.files?.[0];
		if (f) handleFile(f);
	}

	async function rerender() {
		if (!sourceImg) return;
		rendering = true;
		// Let the UI paint the "rendering" state before the heavy sync work.
		await new Promise((r) => setTimeout(r, 10));
		try {
			const { canvas } = renderWatercolor(sourceImg, photoType, params, 1200);
			resultUrl = canvas.toDataURL('image/png');
		} finally {
			rendering = false;
		}
	}

	// Optional AI upgrade pass (dormant until a key is set server-side).
	async function tryAiUpgrade() {
		if (!resultUrl) return;
		aiStatus = 'running';
		try {
			const res = await fetch('/watercolor/api/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ image: sourceUrl ? await toDataUrl(sourceImg!) : null, type: photoType })
			});
			const data = await res.json();
			if (data.provider === 'none') {
				aiStatus = 'none';
				return;
			}
			if (data.image) {
				// Re-run classical physics ON TOP of the AI repaint for the hybrid look.
				const aiImg = new Image();
				aiImg.crossOrigin = 'anonymous';
				await new Promise((res2, rej) => {
					aiImg.onload = res2;
					aiImg.onerror = rej;
					aiImg.src = data.image;
				});
				const { canvas } = renderWatercolor(aiImg, photoType, params, 1200);
				resultUrl = canvas.toDataURL('image/png');
				aiStatus = 'applied';
			} else {
				aiStatus = 'none';
			}
		} catch {
			aiStatus = 'none';
		}
	}

	function toDataUrl(img: HTMLImageElement): Promise<string> {
		const c = document.createElement('canvas');
		c.width = img.naturalWidth;
		c.height = img.naturalHeight;
		c.getContext('2d')!.drawImage(img, 0, 0);
		return Promise.resolve(c.toDataURL('image/png'));
	}

	function download() {
		const a = document.createElement('a');
		a.href = resultUrl;
		a.download = (fileName.replace(/\.[^.]+$/, '') || 'watercolor') + '-watercolor.png';
		a.click();
	}

	// Render at full print resolution just before ordering (crisper file for you).
	function highResDataUrl(): string {
		if (!sourceImg) return resultUrl;
		const { canvas } = renderWatercolor(sourceImg, photoType, params, 4200);
		return canvas.toDataURL('image/png');
	}

	async function placeOrder() {
		orderError = '';
		if (!cust.email || !cust.address) {
			orderError = 'Please add an email and shipping address.';
			return;
		}
		placing = true;
		try {
			const image = highResDataUrl();
			const res = await fetch('/watercolor/api/order', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ image, sizeId, frameId, qty, type: photoType, customer: cust })
			});
			const data = await res.json();
			if (data.checkoutUrl) {
				window.location.href = data.checkoutUrl; // Stripe (later)
				return;
			}
			if (!data.ok) throw new Error(data.error || 'order_failed');
			orderResult = data;
			step = 'done';
		} catch (e: any) {
			orderError = e?.message || 'Something went wrong placing the order.';
		} finally {
			placing = false;
		}
	}

	function reset() {
		step = 'upload';
		sourceImg = null;
		resultUrl = '';
		orderResult = null;
		aiStatus = 'idle';
	}

	// Debounced rerender while sliding tuners.
	let tuneTimer: ReturnType<typeof setTimeout>;
	function onTune() {
		clearTimeout(tuneTimer);
		tuneTimer = setTimeout(rerender, 120);
	}
</script>

<svelte:head>
	<title>Watercolor Studio — Tommy Marcheschi</title>
	<meta name="description" content="Turn any photo into a hand-painted watercolor, printed and framed." />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="wc">
	<!-- Masthead -->
	<header class="mast">
		<div class="mast-inner">
			<div class="brand">
				<span class="brand-mark">◟</span>
				<div>
					<h1>Watercolor Studio</h1>
					<p>Any photo, hand-painted. Printed &amp; framed, shipped to your door.</p>
				</div>
			</div>
			<button class="ghost" onclick={() => (guided = !guided)}>
				{guided ? 'Hide guide' : 'Show me how'}
			</button>
		</div>
	</header>

	{#if guided}
		<div class="guide">
			<strong>How it works</strong>
			<ol>
				<li><b>Upload</b> a photo — a grandkid, a pet, a landscape, anything.</li>
				<li><b>Pick the look</b> (portrait / landscape / illustration) and fine-tune if you like.</li>
				<li><b>Order a framed print</b> — I print it locally, frame it, and ship it to you.</li>
			</ol>
			<p class="guide-note">Tip: portraits look best with a clear, well-lit face. Bigger photos print sharper.</p>
		</div>
	{/if}

	<!-- STEP: Upload -->
	{#if step === 'upload'}
		<section class="stage">
			<div
				class="drop"
				role="button"
				tabindex="0"
				ondragover={(e) => e.preventDefault()}
				ondrop={onDrop}
				onclick={() => fileInput?.click()}
				onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
			>
				<div class="drop-icon">🎨</div>
				<p class="drop-title">Drop a photo here, or click to choose</p>
				<p class="drop-sub">JPG or PNG · the higher-res the better</p>
				<input bind:this={fileInput} type="file" accept="image/*" onchange={onInputChange} hidden />
			</div>
			<div class="samples-hint">Portraits · Landscapes · Pets · Cartoons — it all works.</div>
		</section>
	{/if}

	<!-- STEP: Studio (preview + tune) -->
	{#if step === 'studio' && sourceImg}
		<section class="studio">
			<div class="compare">
				<figure>
					<figcaption>Your photo</figcaption>
					<img src={sourceUrl} alt="source" />
				</figure>
				<figure class="result">
					<figcaption>Watercolor {rendering ? '· painting…' : ''}</figcaption>
					{#if resultUrl}
						<img src={resultUrl} alt="watercolor result" class:dim={rendering} />
					{:else}
						<div class="placeholder">Painting…</div>
					{/if}
				</figure>
			</div>

			<div class="controls">
				<div class="type-row">
					{#each ['portrait', 'landscape', 'cartoon'] as const as t}
						<button class="chip" class:active={photoType === t} onclick={() => onPickType(t)}>
							{t[0].toUpperCase() + t.slice(1)}
						</button>
					{/each}
				</div>

				<details class="tuners">
					<summary>Fine-tune the painting</summary>
					<label>Wash detail <input type="range" min="2" max="16" bind:value={params.washLevels} oninput={onTune} /></label>
					<label>Softness <input type="range" min="0" max="8" step="0.5" bind:value={params.smoothRadius} oninput={onTune} /></label>
					<label>Edge pooling <input type="range" min="0" max="1" step="0.05" bind:value={params.edgeDarkening} oninput={onTune} /></label>
					<label>Granulation <input type="range" min="0" max="1" step="0.05" bind:value={params.granulation} oninput={onTune} /></label>
					<label>Paper texture <input type="range" min="0" max="1" step="0.05" bind:value={params.paper} oninput={onTune} /></label>
					<label>Wet bleed <input type="range" min="0" max="6" step="0.5" bind:value={params.bleed} oninput={onTune} /></label>
					<label>Blooms <input type="range" min="0" max="1" step="0.05" bind:value={params.backrun} oninput={onTune} /></label>
					<label>Saturation <input type="range" min="0.5" max="1.6" step="0.05" bind:value={params.saturation} oninput={onTune} /></label>
				</details>

				<div class="actions">
					<button class="ghost sm" onclick={download} disabled={!resultUrl || rendering}>Download</button>
					{#if aiStatus === 'idle'}
						<button class="ghost sm" onclick={tryAiUpgrade} disabled={!resultUrl || rendering}>Enhance (AI)</button>
					{:else if aiStatus === 'running'}
						<span class="muted sm">Enhancing…</span>
					{:else if aiStatus === 'applied'}
						<span class="muted sm">✓ AI-enhanced</span>
					{:else if aiStatus === 'none'}
						<span class="muted sm">AI not configured</span>
					{/if}
					<button class="primary" onclick={() => (step = 'order')} disabled={!resultUrl || rendering}>
						Order a framed print →
					</button>
				</div>
				<button class="link sm" onclick={reset}>← start over with a different photo</button>
			</div>
		</section>
	{/if}

	<!-- STEP: Order -->
	{#if step === 'order'}
		<section class="order">
			<div class="order-grid">
				<div class="order-preview">
					<img src={resultUrl} alt="watercolor" />
				</div>
				<div class="order-form">
					<h2>Request your framed print</h2>

					<div class="field">
						<span class="label">Size</span>
						<div class="opts">
							{#each PRINT_SIZES as s}
								<button class="opt" class:active={sizeId === s.id} onclick={() => (sizeId = s.id)}>
									<b>{s.label}</b><em>${s.price}</em>
								</button>
							{/each}
						</div>
					</div>

					<div class="field">
						<span class="label">Frame</span>
						<div class="opts">
							{#each FRAME_OPTIONS as f}
								<button class="opt" class:active={frameId === f.id} onclick={() => (frameId = f.id)}>
									<b>{f.label}</b><em>{f.price ? `+$${f.price}` : 'incl.'}</em>
								</button>
							{/each}
						</div>
					</div>

					<div class="field qty">
						<span class="label">Quantity</span>
						<div class="stepper">
							<button onclick={() => (qty = Math.max(1, qty - 1))}>–</button>
							<span>{qty}</span>
							<button onclick={() => (qty = Math.min(10, qty + 1))}>+</button>
						</div>
					</div>

					<div class="field">
						<input class="in" placeholder="Your name" bind:value={cust.name} />
						<input class="in" placeholder="Email" type="email" bind:value={cust.email} />
						<textarea class="in" rows="3" placeholder="Shipping address" bind:value={cust.address}></textarea>
						<input class="in" placeholder="Note (optional)" bind:value={cust.note} />
					</div>

					{#if orderError}<p class="err">{orderError}</p>{/if}

					<div class="total-row">
						<span>Total</span>
						<strong>${total}</strong>
					</div>
					<p class="pay-note">
						Submitting sends your print request to Tommy, who’ll personally confirm the
						details and arrange payment &amp; shipping with you.
					</p>

					<div class="actions">
						<button class="ghost" onclick={() => (step = 'studio')}>← Back</button>
						<button class="primary" onclick={placeOrder} disabled={placing}>
							{placing ? 'Sending…' : 'Request print'}
						</button>
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- STEP: Done -->
	{#if step === 'done' && orderResult}
		<section class="done">
			<div class="done-card">
				<div class="done-icon">✓</div>
				<h2>Request sent</h2>
				<p>Request <code>{orderResult.orderId}</code> · ${orderResult.total} estimate</p>
				<p class="muted">
					{orderResult.notified
						? 'Tommy has been notified and will reach out to confirm the details, payment & shipping.'
						: 'Your request is saved. Tommy will reach out to confirm the details, payment & shipping.'}
				</p>
				<button class="primary" onclick={reset}>Make another</button>
			</div>
		</section>
	{/if}

	<footer class="wc-foot">
		Painted in-browser · <a href="/">tommy.studio</a>
	</footer>
</div>

<style>
	.wc {
		min-height: 100vh;
		background: #faf8f2;
		color: #2a2824;
		font-family: 'Montserrat', system-ui, sans-serif;
		padding-bottom: 4rem;
	}
	:global(.dark) .wc { background: #17150f; color: #ece8df; }

	.mast { border-bottom: 1px solid rgba(0,0,0,0.08); }
	:global(.dark) .mast { border-color: rgba(255,255,255,0.08); }
	.mast-inner {
		max-width: 1100px; margin: 0 auto; padding: 1.5rem 1.25rem;
		display: flex; align-items: center; justify-content: space-between; gap: 1rem;
	}
	.brand { display: flex; align-items: center; gap: 0.9rem; }
	.brand-mark { font-size: 2rem; color: #ff9900; line-height: 1; }
	.brand h1 { font-family: 'EB Garamond', Georgia, serif; font-size: 1.6rem; margin: 0; letter-spacing: 0.01em; }
	.brand p { margin: 0.15rem 0 0; font-size: 0.82rem; opacity: 0.65; }

	.guide {
		max-width: 1100px; margin: 1rem auto 0; padding: 1rem 1.25rem;
		background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px;
	}
	:global(.dark) .guide { background: #201d16; border-color: rgba(255,255,255,0.08); }
	.guide ol { margin: 0.5rem 0; padding-left: 1.2rem; font-size: 0.9rem; line-height: 1.7; }
	.guide-note { font-size: 0.8rem; opacity: 0.6; margin: 0.25rem 0 0; }

	.stage { max-width: 760px; margin: 3rem auto; padding: 0 1.25rem; }
	.drop {
		border: 2px dashed rgba(0,0,0,0.18); border-radius: 18px; padding: 3.5rem 2rem;
		text-align: center; cursor: pointer; transition: all 0.2s; background: #fff;
	}
	:global(.dark) .drop { background: #201d16; border-color: rgba(255,255,255,0.18); }
	.drop:hover { border-color: #ff9900; transform: translateY(-2px); }
	.drop-icon { font-size: 2.5rem; }
	.drop-title { font-size: 1.05rem; margin: 0.75rem 0 0.25rem; font-weight: 600; }
	.drop-sub { font-size: 0.82rem; opacity: 0.6; margin: 0; }
	.samples-hint { text-align: center; margin-top: 1rem; font-size: 0.8rem; opacity: 0.55; }

	.studio { max-width: 1100px; margin: 2rem auto; padding: 0 1.25rem; }
	.compare { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
	@media (max-width: 720px) { .compare { grid-template-columns: 1fr; } }
	figure { margin: 0; }
	figcaption { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.55; margin-bottom: 0.4rem; }
	.compare img, .placeholder {
		width: 100%; border-radius: 12px; display: block; background: #fff;
		box-shadow: 0 8px 30px rgba(0,0,0,0.08);
	}
	.result img { box-shadow: 0 12px 40px rgba(0,0,0,0.14); }
	.placeholder { aspect-ratio: 1; display: grid; place-items: center; opacity: 0.4; }
	.dim { opacity: 0.6; transition: opacity 0.2s; }

	.controls { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }
	.type-row { display: flex; gap: 0.5rem; }
	.chip {
		padding: 0.5rem 1rem; border-radius: 999px; border: 1px solid rgba(0,0,0,0.15);
		background: #fff; cursor: pointer; font-size: 0.85rem; transition: all 0.15s;
	}
	:global(.dark) .chip { background: #201d16; border-color: rgba(255,255,255,0.15); color: inherit; }
	.chip.active { background: #ff9900; border-color: #ff9900; color: #1a1300; font-weight: 600; }

	.tuners { width: 100%; max-width: 520px; background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 0.75rem 1rem; }
	:global(.dark) .tuners { background: #201d16; border-color: rgba(255,255,255,0.08); }
	.tuners summary { cursor: pointer; font-size: 0.85rem; font-weight: 600; }
	.tuners label { display: grid; grid-template-columns: 130px 1fr; align-items: center; gap: 0.75rem; font-size: 0.8rem; margin-top: 0.6rem; }
	.tuners input[type='range'] { accent-color: #ff9900; }

	.actions { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
	.primary {
		background: #ff9900; color: #1a1300; border: none; padding: 0.7rem 1.3rem;
		border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.9rem; transition: transform 0.1s;
	}
	.primary:hover { transform: translateY(-1px); }
	.primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
	.ghost {
		background: transparent; border: 1px solid rgba(0,0,0,0.2); padding: 0.7rem 1.1rem;
		border-radius: 10px; cursor: pointer; font-size: 0.85rem; color: inherit;
	}
	:global(.dark) .ghost { border-color: rgba(255,255,255,0.2); }
	.ghost.sm { padding: 0.45rem 0.9rem; font-size: 0.8rem; }
	.link { background: none; border: none; color: inherit; opacity: 0.6; cursor: pointer; text-decoration: underline; font-size: 0.8rem; padding: 0; }
	.muted { opacity: 0.6; }
	.sm { font-size: 0.8rem; }

	.order { max-width: 1000px; margin: 2rem auto; padding: 0 1.25rem; }
	.order-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 2rem; }
	@media (max-width: 760px) { .order-grid { grid-template-columns: 1fr; } }
	.order-preview img { width: 100%; border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.14); }
	.order-form h2 { font-family: 'EB Garamond', Georgia, serif; font-size: 1.5rem; margin: 0 0 1rem; }
	.field { margin-bottom: 1.1rem; }
	.field .label { display: block; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.55; margin-bottom: 0.4rem; }
	.opts { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.opt {
		display: flex; flex-direction: column; align-items: flex-start; gap: 0.1rem;
		padding: 0.5rem 0.8rem; border: 1px solid rgba(0,0,0,0.15); border-radius: 10px;
		background: #fff; cursor: pointer; min-width: 92px; color: inherit;
	}
	:global(.dark) .opt { background: #201d16; border-color: rgba(255,255,255,0.15); }
	.opt.active { border-color: #ff9900; box-shadow: inset 0 0 0 1px #ff9900; }
	.opt b { font-size: 0.85rem; }
	.opt em { font-style: normal; font-size: 0.75rem; opacity: 0.6; }
	.stepper { display: inline-flex; align-items: center; gap: 0.75rem; }
	.stepper button { width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); background: #fff; cursor: pointer; font-size: 1.1rem; color: inherit; }
	:global(.dark) .stepper button { background: #201d16; border-color: rgba(255,255,255,0.2); }
	.in {
		width: 100%; padding: 0.65rem 0.8rem; margin-bottom: 0.5rem; border-radius: 9px;
		border: 1px solid rgba(0,0,0,0.15); background: #fff; color: inherit; font: inherit; font-size: 0.85rem;
	}
	:global(.dark) .in { background: #201d16; border-color: rgba(255,255,255,0.15); }
	.total-row { display: flex; justify-content: space-between; align-items: baseline; margin: 1rem 0 0.5rem; font-size: 1.1rem; }
	.total-row strong { font-size: 1.4rem; }
	.pay-note { font-size: 0.75rem; opacity: 0.6; margin: 0 0 1rem; line-height: 1.5; }
	.err { color: #c0392b; font-size: 0.82rem; }

	.done { max-width: 520px; margin: 4rem auto; padding: 0 1.25rem; }
	.done-card { background: #fff; border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; padding: 2.5rem; text-align: center; }
	:global(.dark) .done-card { background: #201d16; border-color: rgba(255,255,255,0.08); }
	.done-icon { width: 54px; height: 54px; margin: 0 auto 1rem; border-radius: 50%; background: #ff9900; color: #1a1300; display: grid; place-items: center; font-size: 1.6rem; font-weight: 800; }
	.done-card h2 { font-family: 'EB Garamond', Georgia, serif; margin: 0 0 0.5rem; }
	.done-card code { background: rgba(0,0,0,0.06); padding: 0.1rem 0.4rem; border-radius: 5px; font-size: 0.85rem; }

	.wc-foot { text-align: center; margin-top: 3rem; font-size: 0.78rem; opacity: 0.5; }
	.wc-foot a { color: inherit; }
</style>
