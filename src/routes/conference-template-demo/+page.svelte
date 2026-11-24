<script lang="ts">
	// ── B27 — "Bitcoin 2019-style" conference website TEMPLATE (demo) ─────────────
	// A standalone one-pager on tommy.studio that recreates the feel of the CLASSIC
	// Bitcoin 2019 Webflow template (bitcoin-2019-conference.webflow.io) and
	// demonstrates its signature mechanics.
	//
	// The real B19 DNA, studied from the live template:
	//   • Bright Bitcoin-ORANGE body with floating translucent bubbles — playful,
	//     not a dark tech grid.
	//   • A contained WHITE content column centered over the orange, so the orange
	//     shows on the sides — content "floats" on the background (exactly the
	//     sketch's note).
	//   • A sticky WHITE navbar (₿ bitcoin logo · nav · green Register · burger).
	//   • Titillium Web display type; a "YEAR" numeral mark with a ₿ coin nested in.
	//   • A periwinkle top announcement bar for "next year".
	//   • "By the Numbers" stat row, orange pull-quotes, a "₿ bitcoin accepted" badge.
	//
	// The signature MECHANIC to demo (from the sketch + the real site):
	//   A2 nav floats in the hero → on scroll it detaches into the sticky navbar.
	//
	// WIREFRAME toggle: ON strips everything to the structural blueprint (the
	// sketch) with labelled dashed blocks; OFF is the styled B19-style page.
	// All swappable content is isolated consts up top.
	import { onMount } from 'svelte';

	// ── Content — populated from the real B27 site (conference.b.tc) ──────────────
	const BRAND_PRE = 'bitcoin'; // logo: "₿ bitcoin27"
	const BRAND_YR = '27';
	const EVENT_NAME = 'BITCOIN 2027';
	const TAGLINE = 'Sound Money. Center Stage.';
	const HERO_LINE = 'A Peer-to-Peer Conference';
	const DATE = 'July 15–17, 2027';
	const CITY = 'Nashville, TN';
	const VENUE = 'Music City Center';
	const VENUE_ADDR = '201 Rep. John Lewis Way S, Nashville, TN 37203';
	// Next-year announcement (the periwinkle top bar on the real site)
	const NEXT = { label: 'Bitcoin 2028 registration is live!', brand: 'bitcoin28', href: '#tickets' };

	const NAV = [
		{ label: 'The Story', href: '#history' },
		{ label: 'Numbers', href: '#numbers' },
		{ label: 'Sponsors', href: '#sponsors' },
		{ label: 'Nashville', href: '#nashville' },
		{ label: 'Get Involved', href: '#tickets' }
	];

	const SOCIAL = [
		{ label: 'X', href: 'https://x.com/BitcoinConf' },
		{ label: 'IG', href: 'https://instagram.com/bitcoinconference' },
		{ label: 'YT', href: 'https://youtube.com/@BitcoinMagazine' }
	];

	const INTRO =
		'From a white paper, some code and a simple message — “Chancellor on brink of second bailout for banks” — an idea was born so powerful it ignited a revolution.';
	const STORY =
		'Seven years on, the annual reunion of a fragmented ecosystem has become the world’s largest Bitcoin event — where builders, institutions, policymakers, and global decision-makers come together every year to shape what’s next.';
	const MOMENTS = [
		{ yr: '2019', note: 'The signal begins. The return of Bitcoin’s annual conference — the show that’s set the industry’s agenda ever since.' },
		{ yr: '2024', note: 'B24: the Reserve Bill is unveiled in Nashville, and the first sitting president addresses the community.' },
		{ yr: '2026', note: 'B26: 200+ companies bring the hall to life, from Moon sponsors to Block supporters.' },
		{ yr: '2027', note: 'Sound Money. Center Stage. “The room where the rest of the decade gets written.”' }
	];

	const QUOTE = {
		text: 'The room where the rest of the decade gets written.',
		who: 'David Bailey',
		role: 'CEO & Chairman, Nakamoto Inc.'
	};

	// "By the Numbers" — in the shape the real B19 site shows them
	const NUMBERS = [
		{ val: '35,000+', label: 'Attendees' },
		{ val: '500+', label: 'Speakers' },
		{ val: '200+', label: 'Partners & Sponsors' },
		{ val: '120+', label: 'Countries' }
	];

	const SPONSORS = ['MOON', 'WHALE', 'GENESIS', 'BLOCK', '200+ COMPANIES', 'EXHIBIT HALL SOLD OUT'];

	const VENUE_FACTS = [
		{ k: 'Floor Space', v: '1.2M sq ft' },
		{ k: 'Exhibit Hall', v: '353,000 sq ft' },
		{ k: 'Meeting Rooms', v: '60+' },
		{ k: 'Capacity', v: '35,000+' }
	];

	const TIERS = [
		{ name: 'GENERAL', price: '0.004', usd: '$499', perks: ['All stages & keynotes', '3-day Exhibit Hall', 'Industry mixers'] },
		{ name: 'WHALE PASS', price: '0.018', usd: '$2,250', perks: ['Front-section seating', 'Speaker green room access', 'Collector lounge + merch', 'Priority re-entry'], feature: true },
		{ name: 'SPONSOR / BOOTH', price: '—', usd: 'Contact', perks: ['Moon → Block tiers', 'Exhibit Hall booths', 'Custom activations'] }
	];

	// ── Scroll state: A2 float-nav detaches into the sticky navbar (the mechanic) ─
	let scrolled = $state(false);
	let mobileOpen = $state(false);
	function onScroll() {
		scrolled = (typeof window !== 'undefined' ? window.scrollY : 0) > 140;
	}

	// ── Wireframe mode: ON = structural skeleton (the sketch); OFF = styled page ──
	let wireframe = $state(false);
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.classList.toggle('wf', wireframe);
		try {
			localStorage.setItem('b27-wireframe', wireframe ? '1' : '0');
		} catch {}
	});

	onMount(() => {
		onScroll();
		try {
			wireframe = localStorage.getItem('b27-wireframe') === '1';
		} catch {}
	});

	function goTickets(e: Event) {
		e.preventDefault();
		document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		mobileOpen = false;
	}
</script>

<svelte:head>
	<title>{EVENT_NAME} · {DATE}</title>
	<meta name="robots" content="noindex" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;600;700;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<svelte:window on:scroll={onScroll} />

<!-- ── Wireframe toggle: ON = structural skeleton (the sketch) · OFF = styled ── -->
<button
	class="wf-toggle"
	class:on={wireframe}
	onclick={() => (wireframe = !wireframe)}
	aria-pressed={wireframe}
	title="Toggle wireframe mode"
>
	<span class="wf-dot"></span>
	Wireframe {wireframe ? 'ON' : 'OFF'}
</button>

<div class="b27" class:scrolled>
	<!-- demo ribbon -->
	<div class="ribbon">
		{#if wireframe}
			WIREFRAME MODE · structural skeleton (the sketch) · toggle off for the styled B19-style page
		{:else}
			TEMPLATE DEMO · a “Bitcoin 2019-style” one-pager · content from conference.b.tc · toggle wireframe to see the structure
		{/if}
	</div>

	<!-- bubbly orange background + the contained-white-column vibe lives in CSS -->
	<div class="bubbles" aria-hidden="true">
		{#each Array(14) as _, i}<span class="bub b{i}"></span>{/each}
	</div>

	<!-- ── periwinkle top announcement bar (real B19 has one for next year) ─────── -->
	<div class="topbar" data-wf="A0 · next-year announcement bar">
		<div class="tb-left">
			<span class="pin">◉</span> {EVENT_NAME.replace('BITCOIN ', 'Bitcoin ')} — {CITY}
			<span class="tb-cal">▦ {DATE}</span>
		</div>
		<div class="tb-mid">
			<strong>{NEXT.label}</strong>
			<a class="tb-brand" href={NEXT.href} onclick={goTickets}>
				<span class="coin sm">₿</span><em>{NEXT.brand}</em>
			</a>
		</div>
		<a class="tb-social" href={SOCIAL[0].href} target="_blank" rel="noopener">𝕏 @BitcoinConf</a>
	</div>

	<!-- ── B: sticky white navbar — appears once A2 detaches on scroll ──────────── -->
	<header class="stickynav" class:show={scrolled} data-wf="A2* · STICKY NAVBAR (on scroll)">
		<a class="snav-brand" href="#top">
			<span class="coin">₿</span><strong>{BRAND_PRE}</strong><span class="yr">{BRAND_YR}</span>
		</a>
		<nav class="snav-links" aria-label="Sections">
			{#each NAV as n}<a href={n.href}>{n.label}</a>{/each}
		</nav>
		<a class="snav-cta" href="#tickets" onclick={goTickets}>Register</a>
		<button class="snav-burger" aria-label="Menu" onclick={() => (mobileOpen = !mobileOpen)}>☰</button>
	</header>

	{#if mobileOpen}
		<div class="mobile-menu">
			{#each NAV as n}<a href={n.href} onclick={() => (mobileOpen = false)}>{n.label}</a>{/each}
			<a class="mm-cta" href="#tickets" onclick={goTickets}>Register</a>
		</div>
	{/if}

	<!-- ════════════════════════════════════════════════════════════════════════
	     A · HERO — orange field, floating bubbles, centered mark + float-nav
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="hero" id="top" data-wf="A · HERO (orange field + bubbles)">
		<!-- A3 · corners: social (left) + location (right) -->
		<div class="corner tl" data-wf="A3 · social">
			{#each SOCIAL as s}<a href={s.href} target="_blank" rel="noopener">{s.label}</a>{/each}
		</div>
		<div class="corner tr" data-wf="A3 · location">
			<span>{CITY}</span>
			<span class="muted">{VENUE}</span>
		</div>

		<div class="hero-inner">
			<!-- A1 · the "YEAR + ₿ coin" numeral mark (white on orange) -->
			<div class="yearmark" data-wf="A1 · logo (year + ₿)">
				<span class="ym-top">20</span>
				<span class="ym-coin">₿</span>
				<span class="ym-bot">{BRAND_YR}</span>
			</div>

			<h1 class="hero-line">{HERO_LINE}</h1>
			<p class="tag">{TAGLINE}</p>
			<div class="meta"><span>{DATE}</span><span class="dot">·</span><span>{VENUE}, {CITY}</span></div>

			<!-- A2 · nav items float here; on scroll they hand off to the sticky bar -->
			<nav class="float-nav" class:lift={scrolled} aria-label="Primary" data-wf="A2 · nav (floats → sticky)">
				{#each NAV as n}<a href={n.href}>{n.label}</a>{/each}
			</nav>

			<a class="hero-cta" href="#tickets" onclick={goTickets}>View Video Recap</a>
		</div>

		<div class="fold-label">↑ above the fold</div>
		<a class="scrollcue" href="#history" aria-label="Scroll"><span>scroll</span><span class="chev">⌄</span></a>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════
	     B · THE STORY — contained white column, orange shows on the sides
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="band" id="history" data-wf="B1 · THE STORY / history + key moments">
		<div class="sheet">
			<div class="eyebrow">An Annual Event for the Bitcoin Community</div>
			<h2 class="band-h">Setting the signal since 2019.</h2>
			<p class="lede orange">{INTRO}</p>
			<p class="lede">{STORY}</p>

			<ol class="timeline">
				{#each MOMENTS as m, i}
					<li class:now={i === MOMENTS.length - 1}>
						<span class="t-yr">{m.yr}</span>
						<span class="t-note">{m.note}</span>
					</li>
				{/each}
			</ol>

			<figure class="pullquote">
				<blockquote>“{QUOTE.text}”</blockquote>
				<figcaption>— {QUOTE.who}, <span class="muted">{QUOTE.role}</span></figcaption>
			</figure>

			<!-- B2 · ticket CTA inline -->
			<a class="inline-cta" href="#tickets" onclick={goTickets} data-wf="B2 · ticket CTA">
				<span>B27 booths are going fast — get involved</span>
				<span class="ic-arrow">→</span>
			</a>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════
	     C · BY THE NUMBERS — the real B19 stat row, on a white sheet
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="numbers" id="numbers" data-wf="C · BY THE NUMBERS">
		<div class="sheet">
			<div class="eyebrow center">Bitcoin 2027 by the Numbers</div>
			<div class="num-row">
				{#each NUMBERS as n}
					<div class="num-cell">
						<div class="num-val">{n.val}</div>
						<div class="num-label">{n.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Nashville / venue strip (C — "points you somewhere") -->
	<section class="nashville" id="nashville" data-wf="C · NASHVILLE / VENUE">
		<div class="sheet">
			<div class="eyebrow">Nashville</div>
			<h2 class="nash-h">Home turf.</h2>
			<p class="sub nash-sub">
				BTC Inc. is headquartered in Nashville — we built the Bitcoin Museum here. B24 was where the
				Reserve Bill was unveiled and the first sitting president addressed this community.
			</p>
			<div class="venue-grid">
				{#each VENUE_FACTS as f}
					<div class="ag-col"><div class="ag-day">{f.k}</div><div class="ag-theme">{f.v}</div></div>
				{/each}
			</div>
			<div class="venue-addr">{VENUE} · {VENUE_ADDR}</div>
		</div>
	</section>

	<!-- SPONSORS (C) — marquee, Moon → Block -->
	<section class="sponsors" id="sponsors" data-wf="C · SPONSORS (Moon → Block)">
		<div class="sheet">
			<div class="eyebrow center">Past Sponsors · B26 — 200+ companies, Moon → Block</div>
		</div>
		<div class="marquee" aria-label="Sponsors">
			<div class="track">
				{#each [...SPONSORS, ...SPONSORS] as s}<span class="logo">{s}</span>{/each}
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════
	     D · FINAL CTA — tickets + "BTC Inc" footer
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="tickets" id="tickets" data-wf="D · GET INVOLVED / final CTA">
		<div class="sheet">
			<div class="sec-head center">
				<div class="eyebrow">Get Involved</div>
				<h2>Be in the room.</h2>
				<p class="sub">Priced in sats. {DATE} · {VENUE}, {CITY}.</p>
			</div>
			<div class="tiers">
				{#each TIERS as t}
					<div class="tier" class:feature={t.feature}>
						{#if t.feature}<div class="tier-flag">MOST POPULAR</div>{/if}
						<div class="tier-name">{t.name}</div>
						<div class="tier-price"><span class="btc">₿{t.price}</span><span class="usd">{t.usd}</span></div>
						<ul class="tier-perks">
							{#each t.perks as p}<li>{p}</li>{/each}
						</ul>
						<a class="tier-cta" href="#tickets" onclick={(e) => e.preventDefault()}>
							{t.feature ? 'Get the Whale Pass' : 'Register'}
						</a>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<footer class="foot" data-wf="D · FOOTER (BTC Inc)">
		<div class="sheet foot-in">
			<div class="foot-brand">
				<span class="coin">₿</span><strong>{BRAND_PRE}</strong><span class="yr">{BRAND_YR}</span>
			</div>
			<div class="foot-cols">
				<div>
					<div class="fc-h">Event</div>
					{#each NAV as n}<a href={n.href}>{n.label}</a>{/each}
				</div>
				<div>
					<div class="fc-h">Follow</div>
					{#each SOCIAL as s}<a href={s.href} target="_blank" rel="noopener">{s.label}</a>{/each}
				</div>
				<div>
					<div class="fc-h">When &amp; where</div>
					<span>{DATE}</span><span>{VENUE}</span><span>{VENUE_ADDR}</span>
				</div>
			</div>
			<div class="foot-bottom">
				<span>Bitcoin Conference is published by BTC Inc. — a subsidiary of Nakamoto Inc. (NASDAQ: NAKA).</span>
				<span class="muted">A “Bitcoin 2019-style” template · content from conference.b.tc · built on tommy.studio</span>
			</div>
		</div>
	</footer>

	<!-- the classic "₿ bitcoin accepted" sticky corner badge -->
	<div class="accepted" aria-hidden="true"><span class="coin">₿</span> bitcoin<small>ACCEPTED</small></div>
</div>

<style>
	/* ── palette: the REAL Bitcoin 2019 orange template ──────────────────────── */
	.b27 {
		--orange: #ff9500; /* accent / coin */
		--field: #ffaa33; /* bright body orange */
		--field-2: #ff9d1c;
		--ink: #333333;
		--paper: #ffffff;
		--sheet-bg: #f3f6f8; /* the off-white content column */
		--peri: #6a6cb3; /* announcement bar */
		--green: #5bb85b; /* register button */
		--mut: #8a8a8a;
		background: var(--field);
		color: var(--ink);
		font-family: 'Titillium Web', system-ui, -apple-system, sans-serif;
		min-height: 100vh;
		position: relative;
		overflow-x: hidden;
	}
	.b27 :global(a) {
		color: inherit;
		text-decoration: none;
	}
	.muted {
		color: var(--mut);
	}
	.coin {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.05em;
		height: 1.05em;
		border-radius: 50%;
		background: var(--orange);
		color: #fff;
		font-weight: 900;
		font-style: normal;
		transform: translateY(-0.03em);
	}
	.coin.sm {
		font-size: 0.9em;
	}

	.ribbon {
		position: relative;
		z-index: 60;
		background: #222;
		color: #fff;
		font-size: 11px;
		letter-spacing: 0.05em;
		font-weight: 700;
		text-align: center;
		padding: 7px 14px;
		text-transform: uppercase;
	}

	/* ── bubbly orange background (fixed, behind the contained columns) ───────── */
	.bubbles {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		background: radial-gradient(120% 90% at 50% 0%, var(--field) 0%, var(--field-2) 60%, #f38f12 100%);
	}
	.bub {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.11);
	}
	/* a scattered, varied field of translucent circles like the real site */
	.b0 { width: 420px; height: 420px; left: -90px; top: 8%; background: rgba(255, 255, 255, 0.08); }
	.b1 { width: 150px; height: 150px; left: 12%; top: 30%; }
	.b2 { width: 70px; height: 70px; left: 24%; top: 12%; background: rgba(255, 150, 0, 0.3); }
	.b3 { width: 300px; height: 300px; right: -60px; top: 20%; background: rgba(255, 255, 255, 0.07); }
	.b4 { width: 46px; height: 46px; right: 18%; top: 9%; background: rgba(255, 150, 0, 0.35); }
	.b5 { width: 110px; height: 110px; right: 10%; top: 42%; }
	.b6 { width: 220px; height: 220px; left: 6%; top: 60%; background: rgba(255, 255, 255, 0.06); }
	.b7 { width: 60px; height: 60px; left: 40%; top: 72%; background: rgba(255, 150, 0, 0.28); }
	.b8 { width: 180px; height: 180px; right: 20%; top: 66%; }
	.b9 { width: 34px; height: 34px; left: 55%; top: 24%; background: rgba(255, 150, 0, 0.4); }
	.b10 { width: 90px; height: 90px; right: 34%; top: 85%; }
	.b11 { width: 260px; height: 260px; left: 30%; top: 88%; background: rgba(255, 255, 255, 0.05); }
	.b12 { width: 54px; height: 54px; left: 8%; top: 46%; background: rgba(255, 150, 0, 0.3); }
	.b13 { width: 120px; height: 120px; right: 4%; top: 92%; }

	/* everything above the background */
	.topbar,
	.hero,
	.band,
	.numbers,
	.nashville,
	.sponsors,
	.tickets,
	.foot,
	.stickynav,
	.mobile-menu {
		position: relative;
		z-index: 10;
	}

	/* the contained content column — orange shows on the sides */
	.sheet {
		max-width: 1040px;
		margin: 0 auto;
		padding: 0 40px;
	}

	/* ── periwinkle top announcement bar ─────────────────────────────────────── */
	.topbar {
		z-index: 55;
		background: #6a6cb3;
		color: #fff;
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 9px 22px;
		font-size: 13px;
		flex-wrap: wrap;
		justify-content: space-between;
	}
	.topbar .pin {
		color: #fff;
		opacity: 0.85;
	}
	.tb-left {
		display: flex;
		align-items: center;
		gap: 16px;
		font-weight: 600;
		opacity: 0.95;
	}
	.tb-cal {
		opacity: 0.8;
	}
	.tb-mid {
		display: flex;
		align-items: center;
		gap: 12px;
		font-weight: 700;
	}
	.tb-brand {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		font-weight: 900;
	}
	.tb-brand em {
		font-style: italic;
		color: var(--orange);
	}
	.tb-social {
		font-weight: 700;
		opacity: 0.95;
	}

	/* ── B: sticky white navbar (hidden until scrolled) ──────────────────────── */
	.stickynav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 14px 32px;
		background: #fff;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
		transform: translateY(-110%);
		opacity: 0;
		transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s;
	}
	.stickynav.show {
		transform: translateY(0);
		opacity: 1;
	}
	.snav-brand {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 26px;
		font-weight: 700;
		font-style: italic;
		color: var(--ink);
	}
	.snav-brand .coin {
		font-style: normal;
		font-size: 22px;
		margin-right: 2px;
	}
	.snav-brand .yr {
		color: var(--orange);
		font-weight: 900;
	}
	.snav-links {
		display: flex;
		gap: 26px;
		margin-left: 24px;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink);
	}
	.snav-links a:hover {
		color: var(--orange);
	}
	.snav-cta {
		margin-left: auto;
		background: var(--green);
		color: #fff;
		font-weight: 700;
		font-size: 15px;
		padding: 11px 22px;
		border-radius: 3px;
	}
	.snav-cta:hover {
		filter: brightness(1.06);
	}
	.snav-burger {
		display: none;
		background: none;
		border: 0;
		color: var(--ink);
		font-size: 24px;
		cursor: pointer;
	}

	.mobile-menu {
		position: fixed;
		top: 60px;
		left: 0;
		right: 0;
		z-index: 49;
		background: #fff;
		padding: 16px 32px 24px;
		display: none;
		flex-direction: column;
		gap: 14px;
		font-size: 16px;
		font-weight: 700;
		text-transform: uppercase;
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
	}
	.mm-cta {
		color: var(--green);
	}

	/* ── A: HERO (orange field) ──────────────────────────────────────────────── */
	.hero {
		min-height: 94vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 70px 24px 80px;
		color: #fff;
	}
	.corner {
		position: absolute;
		top: 20px;
		display: flex;
		gap: 16px;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #fff;
	}
	.corner.tl {
		left: 30px;
	}
	.corner.tl a:hover {
		color: #333;
	}
	.corner.tr {
		right: 30px;
		flex-direction: column;
		text-align: right;
		gap: 3px;
	}
	.corner.tr .muted {
		color: rgba(255, 255, 255, 0.7);
	}

	.hero-inner {
		max-width: 780px;
	}
	/* the "YEAR + ₿ coin" numeral mark */
	.yearmark {
		position: relative;
		display: inline-grid;
		justify-items: center;
		line-height: 0.72;
		margin: 0 auto 22px;
		color: #fff;
		font-weight: 900;
		letter-spacing: -0.03em;
	}
	.ym-top,
	.ym-bot {
		font-size: clamp(64px, 13vw, 128px);
	}
	.ym-bot {
		margin-left: 0.5em;
	}
	.ym-coin {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: clamp(52px, 10vw, 98px);
		height: clamp(52px, 10vw, 98px);
		border-radius: 50%;
		background: var(--orange);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: clamp(30px, 6vw, 58px);
		box-shadow: 0 10px 30px rgba(180, 100, 0, 0.35);
	}
	.hero-line {
		font-size: clamp(30px, 5.4vw, 58px);
		line-height: 1.02;
		font-weight: 700;
		margin: 0 0 14px;
	}
	.tag {
		font-size: clamp(15px, 2.2vw, 21px);
		font-weight: 600;
		color: rgba(255, 255, 255, 0.92);
		margin: 0 auto 14px;
	}
	.meta {
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #fff;
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-bottom: 28px;
	}
	.meta .dot {
		opacity: 0.6;
	}

	/* A2 float-nav — lifts & fades as the sticky bar takes over */
	.float-nav {
		display: flex;
		gap: 30px;
		justify-content: center;
		flex-wrap: wrap;
		font-size: 15px;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		margin-bottom: 30px;
		transition: opacity 0.3s, transform 0.4s;
	}
	.float-nav a {
		position: relative;
		padding-bottom: 4px;
		color: #fff;
	}
	.float-nav a::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0;
		width: 0;
		height: 2px;
		background: #fff;
		transition: width 0.25s;
	}
	.float-nav a:hover::after {
		width: 100%;
	}
	.float-nav.lift {
		opacity: 0;
		transform: translateY(-10px);
		pointer-events: none;
	}

	.hero-cta {
		display: inline-block;
		border: 2px solid #fff;
		color: #fff;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 14px 30px;
		border-radius: 3px;
		font-size: 14px;
	}
	.hero-cta:hover {
		background: #fff;
		color: var(--orange);
	}

	.fold-label {
		position: absolute;
		bottom: 64px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.55);
	}
	.scrollcue {
		position: absolute;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.85);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}
	.scrollcue .chev {
		font-size: 16px;
		animation: bob 1.6s ease-in-out infinite;
	}
	@keyframes bob {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(4px); }
	}

	/* ── shared section bits ─────────────────────────────────────────────────── */
	.eyebrow {
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--orange);
		margin-bottom: 14px;
	}
	.eyebrow.center {
		text-align: center;
	}
	.sec-head {
		margin-bottom: 36px;
	}
	.sec-head.center {
		text-align: center;
	}
	h2 {
		font-size: clamp(30px, 5vw, 50px);
		font-weight: 700;
		margin: 0 0 14px;
		line-height: 1.02;
		color: var(--ink);
	}
	.sub,
	.lede {
		color: #4a4a4a;
		font-size: 17px;
		line-height: 1.55;
		max-width: 620px;
	}
	.lede.orange {
		color: var(--orange);
		font-weight: 700;
		font-size: 19px;
	}
	.sec-head.center .sub {
		margin: 0 auto;
	}

	/* ── the white content sheets that float over the orange ─────────────────── */
	.band,
	.numbers,
	.nashville,
	.sponsors,
	.tickets {
		padding: 0;
	}
	.band .sheet,
	.numbers .sheet,
	.nashville .sheet,
	.tickets .sheet {
		background: var(--paper);
		border-radius: 4px;
		box-shadow: 0 20px 60px rgba(120, 70, 0, 0.14);
		padding: 72px 64px;
		max-width: 1040px;
	}
	.band {
		padding-top: 70px;
	}
	.numbers,
	.nashville,
	.tickets {
		padding-top: 40px;
	}
	.sponsors {
		padding: 56px 0 40px;
	}
	.foot {
		margin-top: 48px;
	}

	.timeline {
		list-style: none;
		margin: 32px 0 38px;
		padding: 0;
		border-left: 2px solid rgba(255, 149, 0, 0.35);
	}
	.timeline li {
		position: relative;
		padding: 0 0 26px 28px;
		display: grid;
		grid-template-columns: 70px 1fr;
		gap: 18px;
		align-items: baseline;
	}
	.timeline li::before {
		content: '';
		position: absolute;
		left: -6px;
		top: 6px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #cfcfcf;
	}
	.timeline li.now::before {
		background: var(--orange);
		box-shadow: 0 0 0 4px rgba(255, 149, 0, 0.18);
	}
	.t-yr {
		font-weight: 900;
		font-size: 24px;
		color: var(--orange);
	}
	.t-note {
		color: #4a4a4a;
		font-size: 15px;
		line-height: 1.5;
	}
	.timeline li.now .t-note {
		color: var(--ink);
		font-weight: 600;
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: 14px;
		background: var(--orange);
		color: #fff;
		padding: 16px 26px;
		border-radius: 3px;
		font-weight: 700;
		letter-spacing: 0.02em;
		transition: filter 0.2s, transform 0.2s;
	}
	.inline-cta:hover {
		filter: brightness(1.06);
		transform: translateY(-1px);
	}
	.ic-arrow {
		transition: transform 0.2s;
	}
	.inline-cta:hover .ic-arrow {
		transform: translateX(4px);
	}

	.pullquote {
		margin: 8px 0 38px;
		border-left: 4px solid var(--orange);
		padding: 6px 0 6px 24px;
	}
	.pullquote blockquote {
		margin: 0;
		font-size: clamp(21px, 3.2vw, 30px);
		font-weight: 700;
		line-height: 1.25;
		color: var(--ink);
	}
	.pullquote figcaption {
		margin-top: 12px;
		font-size: 14px;
	}

	/* ── C · by the numbers ──────────────────────────────────────────────────── */
	.num-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-top: 30px;
		text-align: center;
	}
	.num-val {
		font-size: clamp(38px, 6vw, 68px);
		font-weight: 900;
		color: var(--orange);
		line-height: 1;
		letter-spacing: -0.02em;
	}
	.num-label {
		margin-top: 8px;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #666;
	}

	/* ── nashville / venue ───────────────────────────────────────────────────── */
	.nash-h {
		margin-top: 4px;
	}
	.nash-sub {
		max-width: 640px;
		margin-bottom: 10px;
	}
	.venue-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-top: 30px;
	}
	.ag-col {
		border-left: 3px solid var(--orange);
		padding-left: 16px;
	}
	.ag-day {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #888;
	}
	.ag-theme {
		font-size: 24px;
		font-weight: 900;
		margin-top: 4px;
		color: var(--ink);
	}
	.venue-addr {
		margin-top: 26px;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #888;
	}

	/* ── sponsors marquee (white pills on orange) ────────────────────────────── */
	.marquee {
		margin-top: 24px;
		overflow: hidden;
		-webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
		mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
	}
	.track {
		display: flex;
		gap: 24px;
		width: max-content;
		animation: slide 30s linear infinite;
	}
	.track .logo {
		font-weight: 900;
		font-size: 18px;
		letter-spacing: 0.06em;
		color: var(--ink);
		white-space: nowrap;
		background: #fff;
		padding: 14px 26px;
		border-radius: 999px;
		box-shadow: 0 8px 22px rgba(120, 70, 0, 0.16);
	}
	@keyframes slide {
		to {
			transform: translateX(-50%);
		}
	}

	/* ── D · tickets + footer ────────────────────────────────────────────────── */
	.tiers {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
		margin-top: 24px;
	}
	.tier {
		border: 1px solid #e4e4e4;
		border-radius: 6px;
		padding: 30px 26px;
		display: flex;
		flex-direction: column;
		background: #fff;
		position: relative;
	}
	.tier.feature {
		border-color: var(--orange);
		box-shadow: 0 14px 40px rgba(255, 149, 0, 0.22);
	}
	.tier-flag {
		position: absolute;
		top: -11px;
		left: 24px;
		background: var(--orange);
		color: #fff;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.1em;
		padding: 4px 10px;
		border-radius: 2px;
	}
	.tier-name {
		font-weight: 800;
		letter-spacing: 0.08em;
		font-size: 14px;
		color: #777;
		margin-bottom: 14px;
	}
	.tier-price {
		display: flex;
		align-items: baseline;
		gap: 10px;
		margin-bottom: 20px;
	}
	.tier-price .btc {
		font-size: 36px;
		font-weight: 900;
		color: var(--orange);
	}
	.tier-price .usd {
		color: #999;
		font-size: 15px;
	}
	.tier-perks {
		list-style: none;
		margin: 0 0 24px;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
		flex: 1;
	}
	.tier-perks li {
		font-size: 14px;
		color: #555;
		padding-left: 22px;
		position: relative;
	}
	.tier-perks li::before {
		content: '₿';
		position: absolute;
		left: 0;
		color: var(--orange);
		font-size: 12px;
		top: 1px;
		font-weight: 900;
	}
	.tier-cta {
		text-align: center;
		border: 2px solid var(--orange);
		color: var(--orange);
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-size: 13px;
		padding: 12px;
		border-radius: 3px;
		transition: background 0.2s, color 0.2s;
	}
	.tier.feature .tier-cta {
		background: var(--orange);
		color: #fff;
	}
	.tier-cta:hover {
		background: var(--orange);
		color: #fff;
	}

	.foot {
		background: #2a2a2a;
		color: #cfcfcf;
		padding: 56px 0 40px;
		position: relative;
		z-index: 10;
	}
	.foot .sheet {
		background: transparent;
		box-shadow: none;
	}
	.foot-brand {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 34px;
		font-weight: 700;
		font-style: italic;
		color: #fff;
		margin-bottom: 28px;
	}
	.foot-brand .coin {
		font-style: normal;
		font-size: 28px;
	}
	.foot-brand .yr {
		color: var(--orange);
		font-weight: 900;
	}
	.foot-cols {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
		margin-bottom: 38px;
	}
	.foot-cols > div {
		display: flex;
		flex-direction: column;
		gap: 9px;
		font-size: 14px;
	}
	.foot-cols a,
	.foot-cols span {
		color: #b5b5b5;
	}
	.foot-cols a:hover {
		color: #fff;
	}
	.fc-h {
		color: #fff !important;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-size: 12px;
		margin-bottom: 4px;
	}
	.foot-bottom {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 10px;
		padding-top: 24px;
		border-top: 1px solid rgba(255, 255, 255, 0.12);
		font-size: 12px;
		color: #9a9a9a;
	}

	/* ── "₿ bitcoin accepted" sticky corner badge ────────────────────────────── */
	.accepted {
		position: fixed;
		left: 0;
		bottom: 18px;
		z-index: 40;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: rgba(255, 255, 255, 0.16);
		color: #fff;
		font-weight: 700;
		font-style: italic;
		font-size: 16px;
		padding: 8px 14px 8px 12px;
		border-radius: 0 4px 4px 0;
		backdrop-filter: blur(2px);
	}
	.accepted small {
		font-style: normal;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.1em;
		opacity: 0.85;
	}
	.accepted .coin {
		font-size: 14px;
	}

	/* ── wireframe toggle button (fixed, always on top) ──────────────────────── */
	.wf-toggle {
		position: fixed;
		right: 18px;
		bottom: 18px;
		z-index: 200;
		display: inline-flex;
		align-items: center;
		gap: 9px;
		background: #111;
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 999px;
		padding: 10px 16px;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
		transition: background 0.2s, color 0.2s, border-color 0.2s;
		font-family: 'Titillium Web', system-ui, sans-serif;
	}
	.wf-toggle:hover {
		border-color: var(--orange);
	}
	.wf-toggle.on {
		background: #fff;
		color: #111;
		border-color: #111;
	}
	.wf-dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: #555;
		transition: background 0.2s;
	}
	.wf-toggle.on .wf-dot {
		background: var(--orange);
	}

	/* ── responsive ──────────────────────────────────────────────────────────── */
	@media (max-width: 820px) {
		.snav-links {
			display: none;
		}
		.snav-cta {
			display: none;
		}
		.snav-burger {
			display: block;
			margin-left: auto;
		}
		.mobile-menu {
			display: flex;
		}
		.topbar {
			font-size: 11px;
			gap: 8px;
		}
		.tb-left {
			display: none;
		}
		.sheet {
			padding: 0 20px;
		}
		.band .sheet,
		.numbers .sheet,
		.nashville .sheet,
		.tickets .sheet {
			padding: 48px 24px;
		}
		.num-row,
		.venue-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.tiers,
		.foot-cols {
			grid-template-columns: 1fr;
		}
		.fold-label {
			display: none;
		}
		.accepted {
			display: none;
		}
	}

	/* ════════════════════════════════════════════════════════════════════════
	   WIREFRAME MODE — html.wf strips the page to its structural skeleton (the
	   sketch): white blueprint, dashed block outlines, labels revealed, color &
	   imagery removed. Driven by the Wireframe toggle.
	   ════════════════════════════════════════════════════════════════════════ */
	:global(html.wf) .b27 {
		--orange: #111;
		--ink: #111;
		--mut: #888;
		background: #f4f4f2;
		color: #111;
	}
	/* kill the orange bubble field + the coin fill + badges */
	:global(html.wf) .bubbles,
	:global(html.wf) .accepted {
		display: none !important;
	}
	/* flatten every decorated surface to plain paper */
	:global(html.wf) .b27 :global(*) {
		background: transparent !important;
		box-shadow: none !important;
		text-shadow: none !important;
		backdrop-filter: none !important;
		color: #111 !important;
		border-color: #bbb !important;
	}
	:global(html.wf) .ribbon,
	:global(html.wf) .topbar {
		background: #111 !important;
		color: #fff !important;
	}
	:global(html.wf) .topbar :global(*) {
		color: #fff !important;
	}
	:global(html.wf) .coin {
		border: 1.5px dashed #999 !important;
		color: #111 !important;
	}
	/* outline the labelled structural blocks + print their label */
	:global(html.wf) [data-wf] {
		position: relative;
		outline: 1.5px dashed #999;
		outline-offset: -1px;
	}
	:global(html.wf) [data-wf]::before {
		content: attr(data-wf);
		position: absolute;
		top: 6px;
		left: 6px;
		z-index: 5;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.08em;
		background: #111 !important;
		color: #fff !important;
		padding: 3px 7px;
		border-radius: 2px;
		pointer-events: none;
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
	}
	/* the sticky navbar label shouldn't overlap the brand — center it */
	:global(html.wf) .stickynav[data-wf]::before,
	:global(html.wf) .topbar[data-wf]::before {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	/* placeholder look for the hero mark + buttons */
	:global(html.wf) .ym-coin {
		border: 1.5px dashed #999 !important;
	}
	:global(html.wf) .snav-cta,
	:global(html.wf) .hero-cta,
	:global(html.wf) .tier-cta,
	:global(html.wf) .inline-cta,
	:global(html.wf) .track .logo {
		border: 1.5px solid #111 !important;
		border-radius: 2px !important;
	}
	/* stop the sponsor marquee + hero chevron animating in blueprint mode */
	:global(html.wf) .track,
	:global(html.wf) .scrollcue .chev {
		animation: none !important;
	}
	/* the hero text is white-on-orange normally; force it readable on paper */
	:global(html.wf) .hero,
	:global(html.wf) .corner,
	:global(html.wf) .float-nav a,
	:global(html.wf) .fold-label,
	:global(html.wf) .scrollcue {
		color: #111 !important;
	}
	/* drop the floating white sheets' elevation so blocks read flat */
	:global(html.wf) .band .sheet,
	:global(html.wf) .numbers .sheet,
	:global(html.wf) .nashville .sheet,
	:global(html.wf) .tickets .sheet {
		border-radius: 2px !important;
	}
</style>
