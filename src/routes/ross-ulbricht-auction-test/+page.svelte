<script lang="ts">
	// ── Ross Ulbricht shoes — BMAG donation/purchase checkout (MOCK) ──────────────
	// Half-donation / half-purchase format: a BPI donation UNLOCKS the shoe purchase.
	// Slider sets the total offer (5–50 BTC). Split rule, confirmed with the seller:
	//   • ≤ 10 BTC total → 50/50 (seller = total/2)
	//   • 10 → 50 BTC    → seller rises LINEARLY 5 → 10; BPI takes the remainder
	// Anchors: 5→2.5/2.5, 10→5/5, 30→22.5/7.5, 50→40/10. (No real transactions.)

	const MIN = 5;
	const MAX = 50;
	const STEP = 0.5;

	let total = $state(5);

	function sellerFor(t: number): number {
		if (t <= 10) return t / 2;
		return 5 + (t - 10) * 0.125; // 5 at t=10, 10 at t=50
	}

	const seller = $derived(sellerFor(total));
	const bpi = $derived(total - seller);
	const sellerPct = $derived((seller / total) * 100);
	const bpiPct = $derived((bpi / total) * 100);

	// USD context (illustrative; BTC price is a display assumption, labeled as such).
	const BTC_USD = 122_000;
	const fmtBtc = (n: number) =>
		(Math.round(n * 1000) / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 });
	const fmtUsd = (n: number) =>
		(n * BTC_USD).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

	// ── Payment flow state machine ────────────────────────────────────────────────
	// idle → donateQr → donatePaid(unlocks) → buyQr → buyPaid(done)
	type Phase = 'idle' | 'donateQr' | 'donatePaid' | 'buyQr' | 'complete';
	let phase = $state<Phase>('idle');

	// Throwaway, clearly-fake BTC addresses for the QR mock (never real wallets).
	const BPI_ADDR = 'bc1qbpi0donation0mock0address0do0not0send0funds0xy';
	const SELLER_ADDR = 'bc1qseller0mock0address0do0not0send0real0funds0zk';

	// A tiny on-the-fly QR-ish matrix purely for visual flavor (deterministic from seed).
	function qrCells(seed: string): boolean[] {
		const n = 25 * 25;
		const out: boolean[] = [];
		let h = 0;
		for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
		for (let i = 0; i < n; i++) {
			h = (h * 1103515245 + 12345) >>> 0;
			out.push(((h >> 16) & 1) === 1);
		}
		return out;
	}
	const donateQr = qrCells(BPI_ADDR + total);
	const buyQr = $derived(qrCells(SELLER_ADDR + total));

	function startDonation() {
		phase = 'donateQr';
	}
	function completeDonation() {
		phase = 'donatePaid';
	}
	function startPurchase() {
		phase = 'buyQr';
	}
	function completePurchase() {
		phase = 'complete';
	}
	function reset() {
		phase = 'idle';
	}

	const sliderPct = $derived(((total - MIN) / (MAX - MIN)) * 100);
</script>

<svelte:head>
	<title>Ross Ulbricht × BPI — Donation Checkout (Preview)</title>
	<meta name="robots" content="noindex" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
</svelte:head>

<div class="page">
	<!-- MOCK banner -->
	<div class="mockbar">Preview / mock checkout — no real transactions are processed</div>

	<!-- Masthead -->
	<header class="masthead">
		<div class="brand">
			<img src="/bmag-wordmark.svg" alt="BMAG" class="wordmark" />
		</div>
		<div class="kicker">Benefiting the Bitcoin Policy Institute</div>
	</header>

	<div class="rule"></div>

	<main class="grid">
		<!-- LEFT: the object -->
		<section class="object">
			<div class="eyebrow">The Lot</div>
			<h1 class="title">Ross Ulbricht's Prison Nikes</h1>
			<p class="lede">
				The shoes Ross Ulbricht wore in federal prison — a single artifact at the intersection
				of a movement and its most-cited sentence.
			</p>

			<div class="shoebox">
				<img src="/ross-ulbricht-nikes.jpg" alt="Ross Ulbricht's prison Nikes, framed in a shadowbox" class="shoeimg" />
				<div class="shoecap">The lot · framed shadowbox presentation</div>
			</div>

			<dl class="facts">
				<div><dt>Provenance</dt><dd>Owned by Michael Grant · acquired Bitcoin 2025, Las Vegas</dd></div>
				<div><dt>Format</dt><dd>Donation-unlocked purchase · BPI first, seller second</dd></div>
				<div><dt>Settlement</dt><dd>Two sequential on-chain Bitcoin payments</dd></div>
			</dl>
		</section>

		<!-- RIGHT: the offer builder -->
		<section class="offer">
			{#if phase === 'idle'}
				<!-- ── OFFER BUILDER (slider) ─────────────────────────────── -->
				<div class="eyebrow">Build your offer</div>
				<h2 class="offer-h">Set your total. A donation to BPI unlocks the purchase.</h2>

				<!-- Total headline -->
				<div class="totalrow">
					<div class="totalbtc">₿{fmtBtc(total)}</div>
					<div class="totalusd">≈ {fmtUsd(total)} <span class="assume">at ${BTC_USD.toLocaleString()}/₿</span></div>
				</div>

				<!-- Slider -->
				<div class="sliderwrap" style="--pct:{sliderPct}%">
					<input
						type="range"
						min={MIN}
						max={MAX}
						step={STEP}
						bind:value={total}
						aria-label="Total offer in Bitcoin"
					/>
					<div class="ticks">
						<span>₿5</span><span>₿10</span><span>₿20</span><span>₿30</span><span>₿40</span><span>₿50</span>
					</div>
				</div>

				<!-- Split bar -->
				<div class="splitbar" aria-hidden="true">
					<div class="seg seg-bpi" style="width:{bpiPct}%"></div>
					<div class="seg seg-seller" style="width:{sellerPct}%"></div>
				</div>

				<!-- Breakdown -->
				<div class="breakdown">
					<div class="line">
						<div class="lbl"><span class="dot dot-bpi"></span> Donation to BPI</div>
						<div class="val">
							<span class="v-btc">₿{fmtBtc(bpi)}</span>
							<span class="v-usd">{fmtUsd(bpi)}</span>
							<span class="v-pct">{bpiPct.toFixed(0)}%</span>
						</div>
					</div>
					<div class="hair"></div>
					<div class="line">
						<div class="lbl"><span class="dot dot-seller"></span> Purchase · to seller</div>
						<div class="val">
							<span class="v-btc">₿{fmtBtc(seller)}</span>
							<span class="v-usd">{fmtUsd(seller)}</span>
							<span class="v-pct">{sellerPct.toFixed(0)}%</span>
						</div>
					</div>
				</div>

				<!-- Why this matters callout (design-voice hallmark) -->
				<div class="callout">
					<div class="callout-h">How the split works</div>
					<p>
						Up to ₿10, the donation and the purchase are even. Past ₿10, the seller's share rises
						gradually to a ₿10 cap at ₿50 — so <strong>every coin you add above ₿10 weighs toward BPI</strong>.
						Pull to ₿50 and you donate ₿40 to the Bitcoin Policy Institute.
					</p>
				</div>

				<button class="btn btn-primary" onclick={startDonation}>
					Pay now · ₿{fmtBtc(total)}
				</button>
				<p class="paynote">Step 1 sends your ₿{fmtBtc(bpi)} donation to BPI. That unlocks step 2.</p>

			{:else}
				<!-- ── CHECKOUT (replaces the slider in place) ────────────── -->
				<div class="eyebrow">Checkout · ₿{fmtBtc(total)} total</div>

				<!-- Step indicator -->
				<div class="steps">
					<div class="step" class:on={phase === 'donateQr'} class:done={phase === 'donatePaid' || phase === 'buyQr' || phase === 'complete'}>
						<span class="num">1</span> Donate to BPI
					</div>
					<div class="steparrow">→</div>
					<div class="step" class:locked={phase === 'donateQr'} class:on={phase === 'buyQr'} class:done={phase === 'complete'}>
						<span class="num">2</span> Purchase the shoes
					</div>
				</div>

				{#if phase === 'donateQr'}
					<div class="qrcard">
						<div class="qrhead">Step 1 — Donate ₿{fmtBtc(bpi)} to BPI</div>
						<div class="qr">
							{#each donateQr as on, i}<span class="cell" class:on={on} style="--i:{i}"></span>{/each}
						</div>
						<div class="addr">{BPI_ADDR}</div>
						<div class="await">Awaiting confirmation…</div>
						<button class="btn btn-primary" onclick={completeDonation}>Complete payment (simulate)</button>
						<button class="btn btn-ghost" onclick={reset}>← Back to offer</button>
					</div>

				{:else if phase === 'donatePaid'}
					<div class="paid">
						<div class="check">✓</div>
						<div class="paid-h">Donation confirmed — ₿{fmtBtc(bpi)} to BPI</div>
						<div class="paid-sub">The shoe purchase is now unlocked.</div>
						<button class="btn btn-primary" onclick={startPurchase}>Continue to purchase · ₿{fmtBtc(seller)}</button>
					</div>

				{:else if phase === 'buyQr'}
					<div class="qrcard">
						<div class="qrhead">Step 2 — Purchase for ₿{fmtBtc(seller)}</div>
						<div class="qr">
							{#each buyQr as on, i}<span class="cell" class:on={on} style="--i:{i}"></span>{/each}
						</div>
						<div class="addr">{SELLER_ADDR}</div>
						<div class="await">Awaiting confirmation…</div>
						<button class="btn btn-primary" onclick={completePurchase}>Complete payment (simulate)</button>
					</div>

				{:else if phase === 'complete'}
					<div class="done">
						<div class="check big">✓</div>
						<div class="done-h">Offer complete</div>
						<div class="done-grid">
							<div><span class="dl">Donated to BPI</span><span class="dv">₿{fmtBtc(bpi)}</span></div>
							<div><span class="dl">Paid to seller</span><span class="dv">₿{fmtBtc(seller)}</span></div>
							<div><span class="dl">Total</span><span class="dv">₿{fmtBtc(total)}</span></div>
						</div>
						<p class="done-note">The shoes are yours, and ₿{fmtBtc(bpi)} ({fmtUsd(bpi)}) now supports the Bitcoin Policy Institute.</p>
						<button class="btn btn-ghost" onclick={reset}>Start over</button>
					</div>
				{/if}
			{/if}
		</section>
	</main>

	<div class="rule"></div>
	<footer class="foot">
		<span>BMAG × BPI</span>
		<span>Preview for seller review · not a live sale</span>
	</footer>
</div>

<style>
	:global(body) { margin: 0; }
	.page {
		--ink: #0b0b0c;
		--paper: #ffffff;
		--muted: #6b6b70;
		--line: #e3e3e6;
		--accent: #ff5a1f;
		--serif: Georgia, 'Times New Roman', serif;
		--sans: -apple-system, 'Helvetica Neue', Arial, sans-serif;
		background: var(--paper);
		color: var(--ink);
		font-family: var(--sans);
		min-height: 100vh;
		padding: 0 clamp(20px, 5vw, 64px) 48px;
		max-width: 1180px;
		margin: 0 auto;
		box-sizing: border-box;
	}
	.mockbar {
		background: var(--ink);
		color: #fff;
		font-size: 11px;
		letter-spacing: 1.8px;
		text-transform: uppercase;
		text-align: center;
		padding: 7px 10px;
		margin: 0 calc(-1 * clamp(20px, 5vw, 64px));
	}
	.masthead {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		padding: 28px 0 18px;
		flex-wrap: wrap;
	}
	.wordmark { height: 26px; width: auto; display: block; }
	.kicker {
		font-size: 11px;
		letter-spacing: 2px;
		text-transform: uppercase;
		color: var(--muted);
	}
	.rule { height: 2px; background: var(--ink); width: 100%; }
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(28px, 5vw, 64px);
		padding: 40px 0;
	}
	@media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }

	.eyebrow {
		font-size: 11px;
		letter-spacing: 2.2px;
		text-transform: uppercase;
		color: var(--accent);
		font-weight: 600;
		margin-bottom: 14px;
	}
	.title {
		font-family: var(--serif);
		font-size: clamp(30px, 4.4vw, 46px);
		line-height: 1.08;
		margin: 0 0 16px;
		font-weight: 600;
	}
	.lede { color: #2a2a2d; font-size: 15px; line-height: 1.6; max-width: 46ch; margin: 0 0 24px; }

	.shoebox { margin: 8px 0 24px; }
	.shoeimg { display: block; width: 100%; height: auto; border-radius: 2px; }
	.shoecap { margin-top: 10px; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }

	.facts { margin: 0; display: grid; gap: 0; }
	.facts > div { display: grid; grid-template-columns: 120px 1fr; gap: 16px; padding: 12px 0; border-top: 1px solid var(--line); }
	.facts > div:last-child { border-bottom: 1px solid var(--line); }
	.facts dt { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin: 0; }
	.facts dd { margin: 0; font-size: 13.5px; }

	.offer-h { font-family: var(--serif); font-size: clamp(19px, 2.4vw, 24px); line-height: 1.2; margin: 0 0 24px; font-weight: 600; }

	.totalrow { display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; margin-bottom: 18px; }
	.totalbtc { font-family: var(--serif); font-size: 44px; font-weight: 600; letter-spacing: -0.5px; }
	.totalusd { font-size: 14px; color: var(--muted); }
	.assume { font-size: 11px; color: #a3a3a9; }

	.sliderwrap { margin: 8px 0 22px; }
	input[type='range'] {
		-webkit-appearance: none; appearance: none;
		width: 100%; height: 3px; border-radius: 0; outline: none;
		background: linear-gradient(to right, var(--accent) 0%, var(--accent) var(--pct), var(--line) var(--pct), var(--line) 100%);
		cursor: pointer;
	}
	input[type='range']:disabled { opacity: 0.5; cursor: default; }
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none; appearance: none;
		width: 20px; height: 20px; border-radius: 50%;
		background: var(--ink); border: 3px solid var(--accent); cursor: pointer; margin-top: 0;
	}
	input[type='range']::-moz-range-thumb {
		width: 20px; height: 20px; border-radius: 50%;
		background: var(--ink); border: 3px solid var(--accent); cursor: pointer;
	}
	.ticks { display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; color: var(--muted); letter-spacing: 0.5px; }

	.splitbar { display: flex; height: 10px; border-radius: 2px; overflow: hidden; margin: 6px 0 22px; }
	.seg-bpi { background: var(--accent); }
	.seg-seller { background: var(--ink); }
	.seg { transition: width 0.15s ease; }

	.breakdown { margin-bottom: 22px; }
	.line { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; gap: 12px; }
	.lbl { font-size: 13px; display: flex; align-items: center; gap: 9px; }
	.dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
	.dot-bpi { background: var(--accent); }
	.dot-seller { background: var(--ink); }
	.hair { height: 1px; background: var(--line); }
	.val { display: flex; align-items: baseline; gap: 12px; }
	.v-btc { font-family: var(--serif); font-size: 18px; font-weight: 600; }
	.v-usd { font-size: 12px; color: var(--muted); min-width: 84px; text-align: right; }
	.v-pct { font-size: 11px; color: #fff; background: var(--ink); padding: 2px 7px; border-radius: 2px; letter-spacing: 0.5px; min-width: 34px; text-align: center; }

	.callout { background: #fff6f1; border-left: 3px solid var(--accent); padding: 14px 16px; margin-bottom: 26px; }
	.callout-h { font-size: 11px; letter-spacing: 1.8px; text-transform: uppercase; color: var(--accent); font-weight: 700; margin-bottom: 6px; }
	.callout p { margin: 0; font-size: 13px; line-height: 1.55; color: #3a3a3d; }

	.steps { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; font-size: 12px; letter-spacing: 0.4px; }
	.step { display: flex; align-items: center; gap: 7px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; font-size: 11px; }
	.step .num { width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--line); display: grid; place-items: center; font-size: 11px; }
	.step.on { color: var(--ink); font-weight: 700; }
	.step.on .num { border-color: var(--accent); background: var(--accent); color: #fff; }
	.step.done { color: var(--ink); }
	.step.done .num { border-color: var(--ink); background: var(--ink); color: #fff; }
	.step.locked { opacity: 0.4; }
	.steparrow { color: var(--line); }

	.btn { font-family: var(--sans); font-size: 14px; letter-spacing: 1px; text-transform: uppercase; font-weight: 700; padding: 15px 20px; border: none; border-radius: 2px; cursor: pointer; width: 100%; transition: transform 0.05s ease, background 0.15s ease; }
	.btn:active { transform: translateY(1px); }
	.btn-primary { background: var(--accent); color: #fff; }
	.btn-primary:hover { background: #e94d14; }
	.btn-ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
	.paynote { font-size: 12px; color: var(--muted); margin: 12px 0 0; text-align: center; }

	.qrcard, .paid, .done { border: 1px solid var(--line); border-radius: 3px; padding: 22px; text-align: center; }
	.qrcard .btn + .btn, .paid .btn + .btn, .done .btn + .btn { margin-top: 10px; }
	.qrhead { font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }
	.qr { width: 180px; height: 180px; margin: 0 auto 14px; display: grid; grid-template-columns: repeat(25, 1fr); grid-template-rows: repeat(25, 1fr); border: 8px solid #fff; box-shadow: 0 0 0 1px var(--line); background: #fff; }
	.cell { background: #fff; }
	.cell.on { background: var(--ink); }
	.addr { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 10.5px; color: var(--muted); word-break: break-all; margin-bottom: 14px; }
	.await { font-size: 12px; color: var(--accent); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 18px; }

	.check { color: var(--accent); font-size: 34px; line-height: 1; margin-bottom: 10px; }
	.check.big { font-size: 48px; }
	.paid-h, .done-h { font-family: var(--serif); font-size: 22px; font-weight: 600; margin-bottom: 6px; }
	.paid-sub { font-size: 13px; color: var(--muted); margin-bottom: 18px; }
	.done-grid { display: grid; gap: 0; margin: 18px 0; text-align: left; }
	.done-grid > div { display: flex; justify-content: space-between; padding: 11px 0; border-top: 1px solid var(--line); }
	.done-grid > div:last-child { border-bottom: 1px solid var(--line); }
	.dl { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }
	.dv { font-family: var(--serif); font-size: 18px; font-weight: 600; }
	.done-note { font-size: 13px; line-height: 1.55; color: #3a3a3d; margin: 14px 0 20px; }

	.foot { display: flex; justify-content: space-between; padding: 18px 0 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); flex-wrap: wrap; gap: 8px; }
</style>
