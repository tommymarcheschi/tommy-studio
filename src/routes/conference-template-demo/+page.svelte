<script lang="ts">
	// ── B27 — "Bitcoin 2019-style" conference website TEMPLATE (demo) ─────────────
	// A standalone one-pager on tommy.studio that recreates the feel of the classic
	// Bitcoin 2019 conference site, built to DEMONSTRATE the signature mechanic:
	//
	//   A  Fullscreen video-bg hero. Centered "B27" logo, nav items float as text
	//      links, social + location info in the corners. (The fold.)
	//   B  ON SCROLL → the nav row (A2) detaches and becomes a STICKY SOLID NAVBAR
	//      pinned to the top (A3 social links ride inside it). The centered content
	//      stays contained so the background video shows on the sides — home sections
	//      feel like they float ON TOP of the bg video.
	//   C  Speakers / sponsors / the "point-you-somewhere" sections — deliberately
	//      NOT a generic expected grid.
	//   D  Final ticket CTA + "BTC Inc" footer.
	//
	// Everything swappable for real content is an isolated const up top. The bg is a
	// self-contained animated canvas (zero external deps); drop a real loop into
	// BG_VIDEO to have a <video> take over — one line.
	import { onMount } from 'svelte';

	// ── Content — populated from the real B27 site (conference.b.tc) ──────────────
	// Copy sourced from the live Bitcoin 2027 conference page; stat/tier values are
	// representative stand-ins where the real figures load dynamically off-page.
	const BRAND = 'B27';
	const EVENT_NAME = 'BITCOIN 2027';
	const TAGLINE = 'Sound Money. Center Stage.';
	const DATE = 'JULY 15–17, 2027';
	const CITY = 'NASHVILLE, TN';
	const VENUE = 'Music City Center';
	const VENUE_ADDR = '201 Rep. John Lewis Way S, Nashville, TN 37203';
	// Drop a real looping mp4 path here (e.g. '/b27/hero-loop.mp4') and the <video>
	// takes over the animated-canvas background automatically.
	const BG_VIDEO = '';

	const NAV = [
		{ label: 'The Story', href: '#history' },
		{ label: 'By the Numbers', href: '#numbers' },
		{ label: 'Sponsors', href: '#sponsors' },
		{ label: 'Nashville', href: '#nashville' },
		{ label: 'Get Involved', href: '#tickets' }
	];

	const SOCIAL = [
		{ label: 'X', href: 'https://x.com/BitcoinConf' },
		{ label: 'IG', href: 'https://instagram.com/bitcoinconference' },
		{ label: 'YT', href: 'https://youtube.com/@BitcoinMagazine' }
	];

	// "The Story" — the real B27 narrative, as a history/key-moments timeline
	const STORY =
		'What started as a reunion for a fragmented ecosystem has become the world’s largest Bitcoin event platform — where builders, institutions, policymakers, and global decision-makers come together every year to shape what’s next.';
	const MOMENTS = [
		{ yr: '2019', note: 'The signal begins. A reunion for a fragmented ecosystem — the show that’s set the industry’s agenda ever since.' },
		{ yr: '2024', note: 'B24: the Reserve Bill is unveiled in Nashville, and the first sitting president addresses the community.' },
		{ yr: '2026', note: 'B26: 200+ companies bring the hall to life, from Moon sponsors to Block supporters.' },
		{ yr: '2027', note: 'Sound Money. Center Stage. “The room where the rest of the decade gets written.”' }
	];

	// Pull-quote from the live site
	const QUOTE = {
		text: 'The room where the rest of the decade gets written.',
		who: 'David Bailey',
		role: 'CEO & Chairman, Nakamoto Inc.'
	};

	// "By the Numbers" — representative stand-ins (real figures load dynamically)
	const NUMBERS = [
		{ val: '35,000+', label: 'Total Avg. Attendees' },
		{ val: '500+', label: 'Speakers' },
		{ val: '120+', label: 'Countries' }
	];

	// Real B26 sponsor-tier language (Moon → Block)
	const SPONSOR_TIERS = ['MOON', 'WHALE', 'GENESIS', 'BLOCK'];
	const SPONSORS = ['200+ COMPANIES', 'MOON SPONSORS', 'WHALE SPONSORS', 'GENESIS SPONSORS', 'BLOCK SUPPORTERS', 'B27 BOOTHS GOING FAST'];

	// Nashville venue facts from the live site
	const VENUE_FACTS = [
		{ k: 'Floor Space', v: '1.2M sq ft' },
		{ k: 'Exhibit Hall', v: '353,000 sq ft' },
		{ k: 'Meeting Rooms', v: '60+' },
		{ k: 'Capacity', v: '35,000+' }
	];

	// Get Involved — ticket/booth tiers (D / B2)
	const TIERS = [
		{ name: 'GENERAL', price: '0.004', usd: '$499', perks: ['All stages & keynotes', '3-day Exhibit Hall', 'Industry mixers'] },
		{ name: 'WHALE PASS', price: '0.018', usd: '$2,250', perks: ['Front-section seating', 'Speaker green room access', 'Collector lounge + merch', 'Priority re-entry'], feature: true },
		{ name: 'SPONSOR / BOOTH', price: '—', usd: 'Contact', perks: ['Moon → Block tiers', 'Exhibit Hall booths', 'Custom activations'] }
	];

	// ── Scroll state: A2 nav detaches into a sticky solid navbar (the mechanic) ───
	let scrolled = $state(false);
	let mobileOpen = $state(false);
	function onScroll() {
		scrolled = (typeof window !== 'undefined' ? window.scrollY : 0) > 120;
	}

	// ── Wireframe mode: ON strips to the structural skeleton (the sketch); OFF is
	//    the real styled page. Persisted so a toggle survives reloads. ────────────
	let wireframe = $state(false);
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.documentElement.classList.toggle('wf', wireframe);
		try {
			localStorage.setItem('b27-wireframe', wireframe ? '1' : '0');
		} catch {}
	});

	// ── Self-contained animated background (stands in for the bg video) ──────────
	let canvas: HTMLCanvasElement;
	onMount(() => {
		onScroll();
		try {
			wireframe = localStorage.getItem('b27-wireframe') === '1';
		} catch {}
		if (BG_VIDEO) return; // real video takes over; skip canvas work
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const c = ctx; // non-null alias for closures below
		let raf = 0;
		let w = 0,
			h = 0;
		const DPR = Math.min(window.devicePixelRatio || 1, 2);
		// Drifting "network" of nodes — Bitcoin-orange over near-black. Subtle, slow.
		const N = 70;
		const pts = Array.from({ length: N }, () => ({
			x: Math.random(),
			y: Math.random(),
			vx: (Math.random() - 0.5) * 0.00018,
			vy: (Math.random() - 0.5) * 0.00018
		}));
		function resize() {
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = w * DPR;
			canvas.height = h * DPR;
			c.setTransform(DPR, 0, 0, DPR, 0, 0);
		}
		resize();
		window.addEventListener('resize', resize);
		function frame() {
			c.clearRect(0, 0, w, h);
			// vignette-ish radial wash
			const g = c.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, Math.max(w, h) * 0.75);
			g.addColorStop(0, 'rgba(32,20,8,0.9)');
			g.addColorStop(1, 'rgba(6,6,8,1)');
			c.fillStyle = g;
			c.fillRect(0, 0, w, h);
			for (const p of pts) {
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0 || p.x > 1) p.vx *= -1;
				if (p.y < 0 || p.y > 1) p.vy *= -1;
			}
			// links
			for (let i = 0; i < N; i++) {
				for (let j = i + 1; j < N; j++) {
					const a = pts[i],
						b = pts[j];
					const dx = (a.x - b.x) * w,
						dy = (a.y - b.y) * h;
					const d = Math.hypot(dx, dy);
					if (d < 150) {
						c.strokeStyle = `rgba(247,147,26,${0.12 * (1 - d / 150)})`;
						c.lineWidth = 1;
						c.beginPath();
						c.moveTo(a.x * w, a.y * h);
						c.lineTo(b.x * w, b.y * h);
						c.stroke();
					}
				}
			}
			// nodes
			for (const p of pts) {
				c.fillStyle = 'rgba(247,147,26,0.55)';
				c.beginPath();
				c.arc(p.x * w, p.y * h, 1.6, 0, Math.PI * 2);
				c.fill();
			}
			raf = requestAnimationFrame(frame);
		}
		frame();
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', resize);
		};
	});

	function goTickets(e: Event) {
		e.preventDefault();
		document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		mobileOpen = false;
	}
</script>

<svelte:head>
	<title>{EVENT_NAME} · {BRAND}</title>
	<meta name="robots" content="noindex" />
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
			WIREFRAME MODE · structural skeleton (the sketch) · toggle off for the real B27 content
		{:else}
			TEMPLATE DEMO · “{EVENT_NAME}-style” one-pager · content from conference.b.tc · toggle wireframe to see the structure
		{/if}
	</div>

	<!-- ── Background: video OR animated canvas, behind everything ──────────────── -->
	<div class="bg" aria-hidden="true">
		{#if BG_VIDEO}
			<!-- svelte-ignore a11y_media_has_caption -->
			<video src={BG_VIDEO} autoplay muted loop playsinline></video>
		{:else}
			<canvas bind:this={canvas}></canvas>
		{/if}
		<div class="bg-grain"></div>
	</div>

	<!-- ── B: sticky solid navbar — appears once A2 detaches on scroll ──────────── -->
	<header class="stickynav" class:show={scrolled} data-wf="A2* · STICKY NAVBAR (on scroll)">
		<a class="snav-brand" href="#top">{BRAND}</a>
		<nav class="snav-links" aria-label="Sections">
			{#each NAV as n}
				<a href={n.href}>{n.label}</a>
			{/each}
		</nav>
		<div class="snav-right">
			<!-- A3 social rides inside the sticky bar -->
			<div class="snav-social">
				{#each SOCIAL as s}<a href={s.href}>{s.label}</a>{/each}
			</div>
			<a class="snav-cta" href="#tickets" onclick={goTickets}>Get Tickets</a>
		</div>
		<button class="snav-burger" aria-label="Menu" onclick={() => (mobileOpen = !mobileOpen)}>☰</button>
	</header>

	{#if mobileOpen}
		<div class="mobile-menu">
			{#each NAV as n}<a href={n.href} onclick={() => (mobileOpen = false)}>{n.label}</a>{/each}
			<a class="mm-cta" href="#tickets" onclick={goTickets}>Get Tickets</a>
		</div>
	{/if}

	<!-- ════════════════════════════════════════════════════════════════════════
	     A · HERO — fullscreen, centered, floats over the bg video
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="hero" id="top" data-wf="A · HERO (video bg, fullscreen)">
		<!-- A3 · corners: social (left) + location (right) -->
		<div class="corner tl" data-wf="A3 · social">
			{#each SOCIAL as s}<a href={s.href}>{s.label}</a>{/each}
		</div>
		<div class="corner tr" data-wf="A3 · location">
			<span>{CITY}</span>
			<span class="muted">{VENUE}</span>
		</div>

		<!-- contained centered column — bg shows on the sides -->
		<div class="hero-inner">
			<!-- A1 · hero logo -->
			<div class="mark" data-wf="A1 · logo">{BRAND}</div>
			<h1 class="evt">{EVENT_NAME}</h1>
			<p class="tag">{TAGLINE}</p>
			<div class="meta">
				<span>{DATE}</span><span class="dot">·</span><span>{CITY}</span>
			</div>

			<!-- A2 · nav items float as text links. On scroll these hand off to the
			     sticky bar above (which fades in as this fades out). -->
			<nav class="float-nav" class:lift={scrolled} aria-label="Primary" data-wf="A2 · nav (floats → sticky)">
				{#each NAV as n}
					<a href={n.href}>{n.label}</a>
				{/each}
			</nav>

			<a class="hero-cta" href="#tickets" onclick={goTickets}>Get Involved →</a>
		</div>

		<div class="fold-label">↑ ABOVE THE FOLD</div>
		<a class="scrollcue" href="#history" aria-label="Scroll"><span>Scroll</span><span class="chev">⌄</span></a>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════
	     B · contained "mid section" — history / key moments + ticket CTA
	     Centered content, bg video still visible on the flanks.
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="band" id="history" data-wf="B1 · THE STORY / history + key moments">
		<div class="contain">
			<div class="eyebrow">The Story</div>
			<h2 class="band-h">Setting the signal since 2019.</h2>
			<p class="lede">{STORY}</p>

			<ol class="timeline">
				{#each MOMENTS as m, i}
					<li class:now={i === MOMENTS.length - 1}>
						<span class="t-yr">{m.yr}</span>
						<span class="t-note">{m.note}</span>
					</li>
				{/each}
			</ol>

			<!-- pull-quote from the live site -->
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
	     C · BY THE NUMBERS — deliberately NOT a generic grid. Oversized stat rows.
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="speakers" id="numbers" data-wf="C · BY THE NUMBERS">
		<div class="contain">
			<div class="sec-head">
				<div class="eyebrow light">By the Numbers</div>
				<h2>The scale speaks first.</h2>
				<p class="sub">What a reunion for a fragmented ecosystem became.</p>
			</div>

			<ul class="spk-list">
				{#each NUMBERS as n, i}
					<li class="spk num" style="--off:{i % 2 === 0 ? '0' : '1'}">
						<span class="spk-idx">{String(i + 1).padStart(2, '0')}</span>
						<span class="num-val">{n.val}</span>
						<span class="spk-body">
							<span class="spk-name">{n.label}</span>
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- Nashville / venue strip (C — "points you somewhere") -->
	<section class="agenda" id="nashville" data-wf="C · NASHVILLE / VENUE">
		<div class="contain">
			<div class="eyebrow light">Nashville</div>
			<h2 class="nash-h">Home turf.</h2>
			<p class="sub nash-sub">
				BTC Inc. is headquartered in Nashville — we built the Bitcoin Museum here. B24 was where
				the Reserve Bill was unveiled and the first sitting president addressed this community.
			</p>
		</div>
		<div class="contain agenda-grid venue-grid">
			{#each VENUE_FACTS as f}
				<div class="ag-col">
					<div class="ag-day">{f.k}</div>
					<div class="ag-theme">{f.v}</div>
				</div>
			{/each}
		</div>
		<div class="contain venue-addr">{VENUE} · {VENUE_ADDR}</div>
	</section>

	<!-- SPONSORS (C) — marquee, not a logo soup grid -->
	<section class="sponsors" id="sponsors" data-wf="C · SPONSORS (Moon → Block)">
		<div class="contain">
			<div class="eyebrow light center">Past Sponsors · B26 — 200+ companies, Moon → Block</div>
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
		<div class="contain">
			<div class="sec-head center">
				<div class="eyebrow">Get Involved</div>
				<h2>Be in the room.</h2>
				<p class="sub">Priced in sats. {DATE} · {CITY}.</p>
			</div>
			<div class="tiers">
				{#each TIERS as t}
					<div class="tier" class:feature={t.feature}>
						{#if t.feature}<div class="tier-flag">MOST POPULAR</div>{/if}
						<div class="tier-name">{t.name}</div>
						<div class="tier-price">
							<span class="btc">₿{t.price}</span>
							<span class="usd">{t.usd}</span>
						</div>
						<ul class="tier-perks">
							{#each t.perks as p}<li>{p}</li>{/each}
						</ul>
						<a class="tier-cta" href="#tickets" onclick={(e) => e.preventDefault()}>
							{t.feature ? 'Get the Whale Pass' : 'Select'}
						</a>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<footer class="foot" data-wf="D · FOOTER (BTC Inc)">
		<div class="contain foot-in">
			<div class="foot-brand">{BRAND}</div>
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
				<span class="muted">A “{EVENT_NAME}-style” template · content from conference.b.tc · built on tommy.studio</span>
			</div>
		</div>
	</footer>
</div>

<style>
	/* scoped palette */
	.b27 {
		--orange: #f7931a;
		--ink: #f5f2ea;
		--bg0: #080808;
		--mut: #8a8378;
		background: var(--bg0);
		color: var(--ink);
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
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

	.ribbon {
		position: relative;
		z-index: 60;
		background: var(--orange);
		color: #140c02;
		font-size: 11px;
		letter-spacing: 0.06em;
		font-weight: 700;
		text-align: center;
		padding: 7px 14px;
		text-transform: uppercase;
	}

	/* ── background layer ───────────────────────────────────────────────────── */
	.bg {
		position: fixed;
		inset: 0;
		z-index: 0;
	}
	.bg video,
	.bg canvas {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.bg-grain {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image: radial-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px);
		background-size: 3px 3px;
		mix-blend-mode: overlay;
	}
	/* everything above the bg */
	.hero,
	.band,
	.speakers,
	.agenda,
	.sponsors,
	.tickets,
	.foot,
	.stickynav,
	.mobile-menu {
		position: relative;
		z-index: 10;
	}

	.contain {
		max-width: 980px;
		margin: 0 auto;
		padding: 0 24px;
	}

	/* ── B: sticky navbar (hidden until scrolled) ───────────────────────────── */
	.stickynav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 12px 24px;
		background: rgba(10, 9, 8, 0.82);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(247, 147, 26, 0.18);
		transform: translateY(-110%);
		opacity: 0;
		transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s;
	}
	.stickynav.show {
		transform: translateY(0);
		opacity: 1;
	}
	.snav-brand {
		font-weight: 900;
		letter-spacing: 0.04em;
		font-size: 20px;
		color: var(--orange);
	}
	.snav-links {
		display: flex;
		gap: 22px;
		margin-left: 8px;
		font-size: 13px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.snav-links a:hover {
		color: var(--orange);
	}
	.snav-right {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.snav-social {
		display: flex;
		gap: 12px;
		font-size: 11px;
		letter-spacing: 0.08em;
		color: var(--mut);
	}
	.snav-social a:hover {
		color: var(--ink);
	}
	.snav-cta {
		background: var(--orange);
		color: #140c02;
		font-weight: 800;
		font-size: 12px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 9px 16px;
		border-radius: 2px;
	}
	.snav-cta:hover {
		filter: brightness(1.08);
	}
	.snav-burger {
		display: none;
		background: none;
		border: 0;
		color: var(--ink);
		font-size: 20px;
		margin-left: auto;
		cursor: pointer;
	}

	.mobile-menu {
		position: fixed;
		top: 48px;
		left: 0;
		right: 0;
		z-index: 49;
		background: rgba(10, 9, 8, 0.96);
		backdrop-filter: blur(12px);
		padding: 16px 24px 24px;
		display: none;
		flex-direction: column;
		gap: 14px;
		font-size: 16px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border-bottom: 1px solid rgba(247, 147, 26, 0.18);
	}
	.mm-cta {
		color: var(--orange);
		font-weight: 800;
	}

	/* ── A: HERO ─────────────────────────────────────────────────────────────── */
	.hero {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 80px 24px 60px;
	}
	.corner {
		position: absolute;
		top: 24px;
		display: flex;
		gap: 16px;
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.corner.tl {
		left: 28px;
	}
	.corner.tl a {
		color: var(--mut);
	}
	.corner.tl a:hover {
		color: var(--orange);
	}
	.corner.tr {
		right: 28px;
		flex-direction: column;
		text-align: right;
		gap: 4px;
	}
	.corner.tr span:first-child {
		color: var(--ink);
		font-weight: 700;
	}

	.hero-inner {
		max-width: 760px;
	}
	.mark {
		width: 112px;
		height: 112px;
		margin: 0 auto 26px;
		border: 2px solid var(--orange);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 900;
		font-size: 38px;
		letter-spacing: 0.02em;
		color: var(--orange);
		box-shadow: 0 0 60px rgba(247, 147, 26, 0.25);
	}
	.evt {
		font-size: clamp(42px, 8vw, 92px);
		line-height: 0.92;
		font-weight: 900;
		letter-spacing: -0.02em;
		margin: 0 0 18px;
	}
	.tag {
		font-size: clamp(15px, 2.2vw, 20px);
		color: #d8d2c6;
		max-width: 520px;
		margin: 0 auto 18px;
	}
	.meta {
		font-size: 13px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--orange);
		display: flex;
		gap: 12px;
		justify-content: center;
		margin-bottom: 30px;
	}
	.meta .dot {
		color: var(--mut);
	}

	/* A2 float-nav — lifts & fades as the sticky bar takes over */
	.float-nav {
		display: flex;
		gap: 30px;
		justify-content: center;
		flex-wrap: wrap;
		font-size: 14px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-bottom: 34px;
		transition: opacity 0.3s, transform 0.4s;
	}
	.float-nav a {
		position: relative;
		padding-bottom: 4px;
	}
	.float-nav a::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0;
		width: 0;
		height: 1px;
		background: var(--orange);
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
		background: var(--orange);
		color: #140c02;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 15px 30px;
		border-radius: 2px;
		font-size: 14px;
	}
	.hero-cta:hover {
		filter: brightness(1.08);
		transform: translateY(-1px);
	}

	.fold-label {
		position: absolute;
		bottom: 70px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 10px;
		letter-spacing: 0.3em;
		color: rgba(138, 131, 120, 0.5);
	}
	.scrollcue {
		position: absolute;
		bottom: 22px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 11px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--mut);
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
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(4px);
		}
	}

	/* ── shared section bits ─────────────────────────────────────────────────── */
	.eyebrow {
		font-size: 12px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--orange);
		font-weight: 700;
		margin-bottom: 14px;
	}
	.eyebrow.light {
		color: var(--mut);
	}
	.eyebrow.center,
	.sec-head.center {
		text-align: center;
	}
	.sec-head {
		margin-bottom: 40px;
	}
	.sec-head.center {
		margin-left: auto;
		margin-right: auto;
	}
	h2 {
		font-size: clamp(28px, 5vw, 52px);
		font-weight: 900;
		letter-spacing: -0.02em;
		margin: 0 0 12px;
		line-height: 1;
	}
	.sub,
	.lede {
		color: #cfc9bd;
		font-size: 16px;
		max-width: 560px;
	}
	.sec-head.center .sub {
		margin: 0 auto;
	}

	/* ── B band: history, floats on bg ───────────────────────────────────────── */
	.band {
		padding: 120px 0;
		background: linear-gradient(180deg, transparent, rgba(8, 8, 8, 0.72) 18%, rgba(8, 8, 8, 0.72) 82%, transparent);
	}
	.timeline {
		list-style: none;
		margin: 34px 0 40px;
		padding: 0;
		border-left: 1px solid rgba(247, 147, 26, 0.3);
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
		left: -5px;
		top: 6px;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--mut);
	}
	.timeline li.now::before {
		background: var(--orange);
		box-shadow: 0 0 14px var(--orange);
	}
	.t-yr {
		font-weight: 900;
		font-size: 22px;
		color: var(--orange);
	}
	.t-note {
		color: #cfc9bd;
		font-size: 15px;
		line-height: 1.5;
	}
	.timeline li.now .t-note {
		color: var(--ink);
	}

	.inline-cta {
		display: inline-flex;
		align-items: center;
		gap: 14px;
		border: 1px solid var(--orange);
		padding: 16px 24px;
		border-radius: 2px;
		font-weight: 700;
		letter-spacing: 0.03em;
		transition: background 0.2s, color 0.2s;
	}
	.inline-cta:hover {
		background: var(--orange);
		color: #140c02;
	}
	.ic-arrow {
		transition: transform 0.2s;
	}
	.inline-cta:hover .ic-arrow {
		transform: translateX(4px);
	}

	/* ── C speakers: offset editorial list (not a generic grid) ──────────────── */
	.speakers {
		padding: 110px 0;
		background: rgba(8, 8, 8, 0.72);
	}
	.spk-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.spk {
		display: grid;
		grid-template-columns: 54px 72px 1fr;
		gap: 22px;
		align-items: center;
		padding: 22px 0;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		margin-left: calc(var(--off) * 7%);
		transition: margin-left 0.3s, background 0.2s;
	}
	.spk:hover {
		margin-left: 0;
	}
	.spk.feature {
		border-top-color: var(--orange);
	}
	.spk-idx {
		font-size: 13px;
		color: var(--mut);
		font-variant-numeric: tabular-nums;
	}
	.spk-face {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 800;
		font-size: 22px;
		background: #1a1712;
		border: 1px solid rgba(247, 147, 26, 0.35);
		color: var(--orange);
	}
	.spk-body {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.spk-tag {
		font-size: 10px;
		letter-spacing: 0.18em;
		color: var(--orange);
		font-weight: 800;
		margin-bottom: 2px;
	}
	.spk-name {
		font-size: clamp(20px, 3vw, 30px);
		font-weight: 800;
		line-height: 1;
	}
	.spk-role {
		color: var(--mut);
		font-size: 14px;
	}

	/* agenda strip */
	.agenda {
		padding: 70px 0;
		background: rgba(8, 8, 8, 0.72);
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}
	.agenda-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
	}
	.ag-col {
		border-left: 2px solid var(--orange);
		padding-left: 18px;
	}
	.ag-day {
		font-size: 12px;
		letter-spacing: 0.2em;
		color: var(--orange);
		font-weight: 800;
	}
	.ag-theme {
		font-size: 22px;
		font-weight: 800;
		margin: 6px 0 6px;
	}
	.ag-sub {
		color: var(--mut);
		font-size: 14px;
		line-height: 1.5;
	}

	/* sponsors marquee */
	.sponsors {
		padding: 80px 0;
		background: rgba(8, 8, 8, 0.72);
	}
	.marquee {
		margin-top: 26px;
		overflow: hidden;
		-webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
		mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
	}
	.track {
		display: flex;
		gap: 56px;
		width: max-content;
		animation: slide 32s linear infinite;
	}
	.track .logo {
		font-weight: 800;
		font-size: 22px;
		letter-spacing: 0.06em;
		color: #6a655c;
		white-space: nowrap;
		transition: color 0.2s;
	}
	.track .logo:hover {
		color: var(--ink);
	}
	@keyframes slide {
		to {
			transform: translateX(-50%);
		}
	}

	/* ── D tickets + footer ──────────────────────────────────────────────────── */
	.tickets {
		padding: 120px 0;
		background: linear-gradient(180deg, transparent, rgba(8, 8, 8, 0.85) 20%);
	}
	.tiers {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
		margin-top: 20px;
	}
	.tier {
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 4px;
		padding: 30px 24px;
		display: flex;
		flex-direction: column;
		background: rgba(16, 14, 11, 0.6);
		position: relative;
	}
	.tier.feature {
		border-color: var(--orange);
		background: rgba(26, 18, 8, 0.72);
		box-shadow: 0 0 50px rgba(247, 147, 26, 0.14);
	}
	.tier-flag {
		position: absolute;
		top: -11px;
		left: 24px;
		background: var(--orange);
		color: #140c02;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.1em;
		padding: 4px 10px;
		border-radius: 2px;
	}
	.tier-name {
		font-weight: 800;
		letter-spacing: 0.1em;
		font-size: 14px;
		color: var(--mut);
		margin-bottom: 14px;
	}
	.tier-price {
		display: flex;
		align-items: baseline;
		gap: 10px;
		margin-bottom: 20px;
	}
	.tier-price .btc {
		font-size: 34px;
		font-weight: 900;
		color: var(--orange);
	}
	.tier-price .usd {
		color: var(--mut);
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
		color: #cfc9bd;
		padding-left: 20px;
		position: relative;
	}
	.tier-perks li::before {
		content: '✦';
		position: absolute;
		left: 0;
		color: var(--orange);
		font-size: 11px;
		top: 2px;
	}
	.tier-cta {
		text-align: center;
		border: 1px solid var(--orange);
		color: var(--orange);
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-size: 13px;
		padding: 12px;
		border-radius: 2px;
		transition: background 0.2s, color 0.2s;
	}
	.tier.feature .tier-cta {
		background: var(--orange);
		color: #140c02;
	}
	.tier-cta:hover {
		background: var(--orange);
		color: #140c02;
	}

	.foot {
		background: #050505;
		border-top: 1px solid rgba(247, 147, 26, 0.18);
		padding: 60px 0 40px;
	}
	.foot-brand {
		font-size: 40px;
		font-weight: 900;
		color: var(--orange);
		letter-spacing: 0.02em;
		margin-bottom: 30px;
	}
	.foot-cols {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
		margin-bottom: 40px;
	}
	.foot-cols > div {
		display: flex;
		flex-direction: column;
		gap: 9px;
		font-size: 14px;
	}
	.foot-cols a,
	.foot-cols span {
		color: var(--mut);
	}
	.foot-cols a:hover {
		color: var(--ink);
	}
	.fc-h {
		color: var(--ink) !important;
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
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		font-size: 12px;
		color: var(--mut);
	}

	/* ── By the Numbers: oversized stat value in place of the avatar ─────────── */
	.spk.num {
		grid-template-columns: 54px auto 1fr;
	}
	.num-val {
		font-size: clamp(34px, 7vw, 68px);
		font-weight: 900;
		letter-spacing: -0.02em;
		color: var(--orange);
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	/* ── pull-quote ──────────────────────────────────────────────────────────── */
	.pullquote {
		margin: 8px 0 40px;
		border-left: 3px solid var(--orange);
		padding: 6px 0 6px 24px;
	}
	.pullquote blockquote {
		margin: 0;
		font-size: clamp(20px, 3.2vw, 30px);
		font-weight: 700;
		line-height: 1.25;
		letter-spacing: -0.01em;
	}
	.pullquote figcaption {
		margin-top: 12px;
		font-size: 14px;
		letter-spacing: 0.02em;
	}

	/* ── nashville / venue ───────────────────────────────────────────────────── */
	.nash-h {
		margin-top: 4px;
	}
	.nash-sub {
		max-width: 620px;
		margin-bottom: 8px;
	}
	.venue-grid {
		margin-top: 30px;
	}
	.venue-addr {
		margin-top: 26px;
		font-size: 13px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--mut);
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
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
		transition: background 0.2s, color 0.2s, border-color 0.2s;
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
	@media (max-width: 760px) {
		.snav-links,
		.snav-social,
		.snav-cta {
			display: none;
		}
		.snav-burger {
			display: block;
		}
		.mobile-menu {
			display: flex;
		}
		.corner {
			font-size: 10px;
		}
		.agenda-grid,
		.tiers,
		.foot-cols {
			grid-template-columns: 1fr;
		}
		.spk {
			grid-template-columns: 36px 56px 1fr;
			gap: 14px;
			margin-left: 0 !important;
		}
		.spk-face {
			width: 56px;
			height: 56px;
			font-size: 18px;
		}
		.fold-label {
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
	/* kill the background video/canvas + texture */
	:global(html.wf) .bg,
	:global(html.wf) .bg-grain {
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
	:global(html.wf) .ribbon {
		background: #111 !important;
		color: #fff !important;
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
	/* the sticky navbar label shouldn't overlap the brand — nudge it */
	:global(html.wf) .stickynav[data-wf]::before {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	/* generic placeholder look for key hero elements */
	:global(html.wf) .mark {
		border: 1.5px dashed #999 !important;
		box-shadow: none !important;
	}
	:global(html.wf) .snav-cta,
	:global(html.wf) .hero-cta,
	:global(html.wf) .tier-cta,
	:global(html.wf) .inline-cta,
	:global(html.wf) .wf-toggle {
		border: 1.5px solid #111 !important;
	}
	/* stop the sponsor marquee from scrolling in blueprint mode */
	:global(html.wf) .track {
		animation: none !important;
	}
	/* flatten rounded corners so blocks read as boxes */
	:global(html.wf) .tier,
	:global(html.wf) .spk-face,
	:global(html.wf) .snav-cta {
		border-radius: 2px !important;
	}
	/* dim the drifting network cue lines that no longer exist */
	:global(html.wf) .scrollcue .chev {
		animation: none !important;
	}
</style>
