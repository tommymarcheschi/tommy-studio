<script lang="ts">
	// ── Ross Ulbricht shoes — BMAG buy-now via split PSBT (MOCK) ──────────────────
	// Buy-now listing (not an auction). One Partially-Signed Bitcoin Transaction the
	// buyer signs routes funds in a single payment:
	//   • 50% → BPI directly (donation; BMAG never custodies it)
	//   • 50% → BMAG, held in escrow as the seller-side funds until the seller
	//     confirms the shoes have shipped.
	// Settlement with the seller is a SECOND transaction, sent after shipping is
	// confirmed: of the total, the seller receives ~35% and BMAG keeps a ~15% fee.
	// Slider sets the total offer (5–50 BTC); ceiling nods to the 50-BTC block subsidy.
	// (No real transactions — preview only.)

	const MIN = 5;
	const MAX = 50;
	const STEP = 0.5;

	const BMAG_FEE_PCT = 0.15; // of total proceeds (negotiable to 10%)

	let total = $state(5);

	// The buyer's PSBT always splits the TOTAL evenly: half to BPI, half to BMAG escrow.
	const bpi = $derived(total * 0.5); // direct donation to BPI
	const escrow = $derived(total * 0.5); // to BMAG, held until shipping confirmed
	// Second (settlement) transaction, out of the escrowed half:
	const bmagFee = $derived(total * BMAG_FEE_PCT); // ~15% of total
	const seller = $derived(escrow - bmagFee); // ~35% of total to the seller
	const bpiPct = $derived((bpi / total) * 100);
	const escrowPct = $derived((escrow / total) * 100);
	const sellerPct = $derived((seller / total) * 100);
	const bmagPct = $derived((bmagFee / total) * 100);

	// USD context (illustrative; BTC price is a display assumption, labeled as such).
	const BTC_USD = 122_000;
	const fmtBtc = (n: number) =>
		(Math.round(n * 1000) / 1000).toLocaleString('en-US', { maximumFractionDigits: 3 });
	const fmtUsd = (n: number) =>
		(n * BTC_USD).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

	// ── Payment flow state machine ────────────────────────────────────────────────
	// One buyer signature (the split PSBT), then a later seller-side settlement:
	//   idle → signPsbt → broadcast(buyer done) → shipped → settled(complete)
	type Phase = 'idle' | 'signPsbt' | 'broadcast' | 'shipped' | 'complete';
	// Dev-only: ?phase=signPsbt lets us preview a checkout step directly. No effect in prod.
	const initialPhase: Phase = (() => {
		if (!import.meta.env.DEV || typeof window === 'undefined') return 'idle';
		const p = new URLSearchParams(window.location.search).get('phase');
		return (['signPsbt', 'broadcast', 'shipped', 'complete'].includes(p ?? '') ? p : 'idle') as Phase;
	})();
	let phase = $state<Phase>(initialPhase);

	// Throwaway, clearly-fake BTC addresses for the QR mock (never real wallets).
	const BPI_ADDR = 'bc1qbpi0donation0mock0address0do0not0send0funds0xy';
	const BMAG_ADDR = 'bc1qbmag0escrow0mock0address0do0not0send0funds0ab';
	const SELLER_ADDR = 'bc1qseller0mock0address0do0not0send0real0funds0zk';

	// Mock transaction ids for the receipt (illustrative only — real flow fills these in).
	const PSBT_TXID = 'mock0000spl1t0psbt00000000000000000000000000000000000000000000f00d';
	const SETTLE_TXID = 'mock00000settlement00000000000000000000000000000000000000000000beef';

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
	const psbtQr = $derived(qrCells(BPI_ADDR + BMAG_ADDR + total));

	function startCheckout() {
		phase = 'signPsbt';
	}
	function signAndBroadcast() {
		phase = 'broadcast';
	}
	function confirmShipped() {
		phase = 'shipped';
	}
	function settleSeller() {
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
				The shoes Ross Ulbricht wore out of prison as a free man. A significant historic
				artifact to the Bitcoin community.
			</p>

			<div class="shoebox">
				<img src="/ross-ulbricht-nikes.jpg" alt="Ross Ulbricht's prison Nikes, framed in a shadowbox" class="shoeimg" />
				<div class="shoecap">The lot · framed shadowbox presentation</div>
			</div>

			<dl class="facts">
				<div><dt>Format</dt><dd>Buy-now listing (not an auction). ₿5 minimum; the slider tops out at ₿50, a nod to Bitcoin's original block subsidy.</dd></div>
				<div><dt>Provenance</dt><dd>Ross Nike Freedom Shoes acquired by Coin Think Tank at auction during Bitcoin 2025, Las Vegas.</dd></div>
				<div><dt>Donation</dt><dd>Exactly half of your offer goes directly to the Bitcoin Policy Institute (BPI) — a non-profit, 501(c)(3) eligible to receive your tax-deductible contributions directly. BMAG never takes custody of this donation.</dd></div>
				<div><dt>Settlement</dt><dd>The other half settles the purchase: BMAG holds it in escrow until the seller, CoinThinkTank, confirms the shoes have shipped, then releases the seller's share. The seller will pay applicable federal and state taxes on the purchase price.</dd></div>
			</dl>
		</section>

		<!-- RIGHT: the offer builder -->
		<section class="offer">
			{#if phase === 'idle'}
				<!-- ── OFFER BUILDER (slider) ─────────────────────────────── -->
				<div class="eyebrow">Build your offer</div>
				<h2 class="offer-h">Set your total with the slider. One Bitcoin transaction you sign sends half to BPI and half to settle the purchase.</h2>

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
						{#each [5, 10, 20, 30, 40, 50] as t}
							<span style="left:{((t - MIN) / (MAX - MIN)) * 100}%">₿{t}</span>
						{/each}
					</div>
				</div>

				<!-- Split bar: half to BPI, half to the seller side (seller + BMAG fee). -->
				<div class="splitbar" aria-hidden="true">
					<div class="seg seg-bpi" style="width:{bpiPct}%"></div>
					<div class="seg seg-seller" style="width:{sellerPct}%"></div>
					<div class="seg seg-bmag" style="width:{bmagPct}%"></div>
				</div>

				<!-- Breakdown -->
				<div class="breakdown">
					<div class="line">
						<div class="lbl"><span class="dot dot-bpi"></span> Donation to BPI <span class="tag">direct · PSBT</span></div>
						<div class="val">
							<span class="v-btc">₿{fmtBtc(bpi)}</span>
							<span class="v-usd">{fmtUsd(bpi)}</span>
							<span class="v-pct">{bpiPct.toFixed(0)}%</span>
						</div>
					</div>
					<div class="hair"></div>
					<div class="line">
						<div class="lbl"><span class="dot dot-seller"></span> Seller allocation <span class="tag">on delivery</span></div>
						<div class="val">
							<span class="v-btc">₿{fmtBtc(seller)}</span>
							<span class="v-usd">{fmtUsd(seller)}</span>
							<span class="v-pct">{sellerPct.toFixed(0)}%</span>
						</div>
					</div>
					<div class="hair"></div>
					<div class="line">
						<div class="lbl"><span class="dot dot-bmag"></span> BMAG fee <span class="tag">from seller side</span></div>
						<div class="val">
							<span class="v-btc">₿{fmtBtc(bmagFee)}</span>
							<span class="v-usd">{fmtUsd(bmagFee)}</span>
							<span class="v-pct">{bmagPct.toFixed(0)}%</span>
						</div>
					</div>
				</div>

				<!-- Why this matters callout (design-voice hallmark) -->
				<div class="callout">
					<div class="callout-h">How payment works</div>
					<p>
						You sign <strong>one Bitcoin transaction</strong> (a split PSBT). It routes
						<strong>half directly to BPI</strong> — BMAG never touches the donation — and the other half to
						BMAG, held in escrow. Once the seller confirms the shoes have shipped, BMAG releases the
						seller's ₿{fmtBtc(seller)} and keeps a {(BMAG_FEE_PCT * 100).toFixed(0)}% fee.
					</p>
				</div>

				<button class="btn btn-primary" onclick={startCheckout}>
					Review &amp; sign · ₿{fmtBtc(total)}
				</button>
				<p class="paynote">One signature splits ₿{fmtBtc(bpi)} to BPI and ₿{fmtBtc(escrow)} to escrow.</p>

			{:else}
				<!-- ── CHECKOUT (replaces the slider in place) ────────────── -->
				<div class="eyebrow">Checkout</div>

				<!-- Step indicator -->
				<div class="steps">
					<div class="step" class:on={phase === 'signPsbt'} class:done={phase === 'broadcast' || phase === 'shipped' || phase === 'complete'}>
						<span class="num">1</span> Sign the PSBT
					</div>
					<div class="steparrow">→</div>
					<div class="step" class:locked={phase === 'signPsbt'} class:on={phase === 'broadcast' || phase === 'shipped'} class:done={phase === 'complete'}>
						<span class="num">2</span> Ship &amp; settle
					</div>
				</div>

				{#if phase === 'signPsbt'}
					<div class="qrcard">
						<div class="qrhead">Sign one transaction — ₿{fmtBtc(total)}</div>
						<div class="qr">
							{#each psbtQr as on, i}<span class="cell" class:on={on} style="--i:{i}"></span>{/each}
						</div>
						<!-- The single PSBT has two outputs; show both so the buyer sees exactly
						     where every satoshi goes before they sign. -->
						<div class="psbt-outs">
							<div class="psbt-out">
								<div class="po-top"><span class="dot dot-bpi"></span> ₿{fmtBtc(bpi)} → BPI <span class="po-tag">donation</span></div>
								<div class="addr">{BPI_ADDR}</div>
							</div>
							<div class="psbt-out">
								<div class="po-top"><span class="dot dot-seller"></span> ₿{fmtBtc(escrow)} → BMAG escrow <span class="po-tag">held until shipped</span></div>
								<div class="addr">{BMAG_ADDR}</div>
							</div>
						</div>
						<div class="await">Awaiting your signature…</div>
						<button class="btn btn-primary" onclick={signAndBroadcast}>Sign &amp; broadcast (simulate)</button>
						<button class="btn btn-ghost" onclick={reset}>← Back to offer</button>
					</div>

				{:else if phase === 'broadcast'}
					<div class="paid">
						<div class="check">✓</div>
						<div class="paid-h">Payment broadcast — ₿{fmtBtc(total)}</div>
						<div class="paid-sub">
							₿{fmtBtc(bpi)} is on its way to BPI. ₿{fmtBtc(escrow)} is held in BMAG escrow
							until the seller confirms the shoes have shipped.
						</div>
						<button class="btn btn-primary" onclick={confirmShipped}>Seller confirms shipped (simulate)</button>
					</div>

				{:else if phase === 'shipped'}
					<div class="paid">
						<div class="check">✓</div>
						<div class="paid-h">Shipping confirmed</div>
						<div class="paid-sub">
							BMAG now releases the seller's ₿{fmtBtc(seller)} and retains its
							{(BMAG_FEE_PCT * 100).toFixed(0)}% fee (₿{fmtBtc(bmagFee)}) — a second settlement transaction.
						</div>
						<button class="btn btn-primary" onclick={settleSeller}>Release settlement (simulate)</button>
					</div>

				{:else if phase === 'complete'}
					<!-- Final receipt. Bold-bordered cards separate the three parties so this
					     page reads as a receipt for everyone (buyer, seller, BPI, BMAG).
					     The donation + escrow are one TXID (the split PSBT); the seller
					     settlement is the second TXID. -->
					<div class="done">
						<div class="check big">✓</div>
						<div class="done-h">Sale complete</div>

						<!-- Donation receipt card (output of the split PSBT) -->
						<div class="receipt">
							<div class="receipt-top">
								<span class="dl">Donated to BPI</span>
								<span class="dv">₿{fmtBtc(bpi)}</span>
							</div>
							<dl class="receipt-meta">
								<div><dt>Transaction ID</dt><dd>{PSBT_TXID}</dd></div>
								<div><dt>BTC address</dt><dd>{BPI_ADDR}</dd></div>
							</dl>
							<p class="receipt-fine">
								Paid directly by the buyer's split PSBT. The Bitcoin Policy Institute (BPI) is a
								non-profit, 501(c)(3) and is eligible to receive your tax-deductible contributions
								directly; BMAG never takes custody of this donation.
							</p>
						</div>

						<!-- Seller settlement receipt card (second transaction) -->
						<div class="receipt">
							<div class="receipt-top">
								<span class="dl">Settled to seller</span>
								<span class="dv">₿{fmtBtc(seller)}</span>
							</div>
							<dl class="receipt-meta">
								<div><dt>Transaction ID</dt><dd>{SETTLE_TXID}</dd></div>
								<div><dt>BTC address</dt><dd>{SELLER_ADDR}</dd></div>
								<div><dt>BMAG fee</dt><dd>₿{fmtBtc(bmagFee)} ({(BMAG_FEE_PCT * 100).toFixed(0)}%)</dd></div>
							</dl>
							<p class="receipt-fine">
								Released from BMAG escrow after the seller confirmed shipment. The seller,
								CoinThinkTank, will pay applicable federal and state taxes on the purchase price
								of the shoes.
							</p>
						</div>

						<button class="btn btn-ghost" onclick={reset}>Return to home page</button>
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

	<div class="legal">
		<p>
			Payment is made as a single Partially-Signed Bitcoin Transaction (PSBT) signed by the buyer:
			50% is routed directly to BPI and 50% to BMAG, held in escrow. The donation relationship is
			directly between the buyer and BPI.
		</p>
		<p>
			The Bitcoin Policy Institute (BPI) is a non-profit, 501(c)(3) and is eligible to receive your
			tax-deductible contributions directly. BMAG does not take custody of the BPI donation.
		</p>
		<p>
			BMAG releases the seller-side funds from escrow as a second transaction once the seller
			confirms shipment, retaining its fee. The seller, CoinThinkTank, will pay applicable federal
			and state taxes on the purchase price of the shoes.
		</p>
	</div>
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
	/* Labels are positioned at their TRUE linear position on the track (not evenly
	   spaced), so each tick lines up with the slider thumb at that value. */
	.ticks { position: relative; height: 16px; margin-top: 10px; font-size: 11px; color: var(--muted); letter-spacing: 0.5px; }
	.ticks span { position: absolute; transform: translateX(-50%); white-space: nowrap; }
	.ticks span:first-child { transform: none; }
	.ticks span:last-child { transform: translateX(-100%); }

	.splitbar { display: flex; height: 10px; border-radius: 2px; overflow: hidden; margin: 6px 0 22px; }
	.seg-bpi { background: var(--accent); }
	.seg-seller { background: var(--ink); }
	.seg-bmag { background: #b9b9bf; }
	.seg { transition: width 0.15s ease; }

	.breakdown { margin-bottom: 22px; }
	.line { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; gap: 12px; }
	.lbl { font-size: 13px; display: flex; align-items: center; gap: 9px; }
	.dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
	.dot-bpi { background: var(--accent); }
	.dot-seller { background: var(--ink); }
	.dot-bmag { background: #b9b9bf; }
	.tag { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); border-radius: 2px; padding: 2px 5px; margin-left: 2px; }
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

	/* The two outputs of the single split PSBT, shown before the buyer signs. */
	.psbt-outs { display: grid; gap: 10px; margin-bottom: 16px; text-align: left; }
	.psbt-out { border: 1px solid var(--line); border-radius: 3px; padding: 10px 12px; }
	.po-top { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
	.psbt-out .addr { margin-bottom: 0; }
	.po-tag { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); border-radius: 2px; padding: 2px 5px; font-weight: 500; }

	.check { color: var(--accent); font-size: 34px; line-height: 1; margin-bottom: 10px; }
	.check.big { font-size: 48px; }
	.paid-h, .done-h { font-family: var(--serif); font-size: 22px; font-weight: 600; margin-bottom: 6px; }
	.paid-sub { font-size: 13px; color: var(--muted); margin-bottom: 18px; }
	/* Receipt cards: bold borders separate the donation from the purchase. */
	.receipt { border: 2px solid var(--ink); border-radius: 3px; padding: 16px 18px; margin: 16px 0; text-align: left; }
	.receipt-top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
	.dl { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }
	.dv { font-family: var(--serif); font-size: 20px; font-weight: 600; white-space: nowrap; }
	.receipt-meta { margin: 12px 0 0; display: grid; gap: 8px; border-top: 1px solid var(--line); padding-top: 12px; }
	.receipt-meta > div { display: grid; grid-template-columns: 110px 1fr; gap: 10px; align-items: baseline; }
	.receipt-meta dt { margin: 0; font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); }
	.receipt-meta dd { margin: 0; font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 10.5px; color: #3a3a3d; word-break: break-all; }
	.receipt-fine { margin: 12px 0 0; font-size: 11px; line-height: 1.5; color: #8a8a90; }
	@media (max-width: 560px) {
		.receipt-meta > div { grid-template-columns: 1fr; gap: 2px; }
	}

	.foot { display: flex; justify-content: space-between; padding: 18px 0 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); flex-wrap: wrap; gap: 8px; }

	.legal { margin-top: 18px; display: grid; gap: 7px; }
	.legal p { margin: 0; font-size: 11px; line-height: 1.5; color: #8a8a90; max-width: 70ch; }

	/* ── Mobile polish ─────────────────────────────────────────────── */
	@media (max-width: 560px) {
		.grid { padding: 28px 0; gap: 32px; }
		.masthead { padding: 22px 0 16px; }
		.wordmark { height: 22px; }
		.kicker { font-size: 10px; letter-spacing: 1.5px; }
		.lede { font-size: 15px; }
		.totalbtc { font-size: 38px; }
		/* bigger touch target on the slider thumb */
		input[type='range']::-webkit-slider-thumb { width: 26px; height: 26px; }
		input[type='range']::-moz-range-thumb { width: 26px; height: 26px; }
		.ticks { font-size: 10px; }
		/* let the breakdown numbers stack under the label instead of cramping */
		.line { flex-direction: column; align-items: flex-start; gap: 6px; padding: 13px 0; }
		.val { gap: 10px; }
		.v-usd { min-width: 0; text-align: left; }
		.facts > div { grid-template-columns: 96px 1fr; gap: 12px; }
		.btn { padding: 16px 18px; font-size: 13px; }
		.qr { width: 160px; height: 160px; }
	}
	@media (max-width: 380px) {
		.totalrow { flex-direction: column; gap: 4px; }
		.facts > div { grid-template-columns: 1fr; gap: 3px; }
		.facts dd { font-size: 13px; }
	}
</style>
