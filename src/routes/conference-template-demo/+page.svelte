<script lang="ts">
	// ── B27 — a "Bitcoin conference" website TEMPLATE (demo) ──────────────────────
	// A standalone one-pager on tommy.studio that brings the layout + vibe of the
	// classic Bitcoin 2019 / 2021 / 2022 Webflow sites to a B27 (Bitcoin 2027) page.
	//
	// Studied from the real templates (b19/b21/b22-conference.webflow.io), the
	// shared design DNA I'm channeling:
	//   • A bold full-bleed hero FIELD (B22 cosmic photo-energy, B21 pixel-dither
	//     texture, B19 orange glow) with a contained content column floating on
	//     top — the background shows on the sides (exactly the sketch's note).
	//   • The iconic CIRCULAR ORANGE GLYPH badge: "2 ₿ 7" with the coin as the
	//     middle digit.
	//   • A sticky WHITE navbar: location block left · centered "₿ bitcoin27"
	//     wordmark · green TICKETS button right · nav row.
	//   • Titillium Web, huge / 900 / UPPERCASE / tight tracking for headers.
	//   • Chunky green + orange PILL buttons. Orange-capped experience cards.
	//   • A countdown + announcement bar, a "Run the Numbers" stat row, and the
	//     "₿ bitcoin accepted" corner badge.
	//
	// The signature MECHANIC to demo (sketch + real sites): the hero nav floats,
	// then on scroll it detaches into the sticky navbar.
	//
	// WIREFRAME toggle: ON strips everything to the labelled structural blueprint
	// (the sketch); OFF is the styled page. All content is isolated consts up top.
	import { onMount } from 'svelte';

	// ── Real B27 brand assets (self-hosted from conference.b.tc) ──────────────────
	const LOGO_DARK = '/b27/b27-nav.svg'; // white "bitcoin" wordmark — for the dark hero
	const LOGO_LIGHT = '/b27/b27-nav-light.svg'; // black wordmark — for the white sticky bar
	const GLYPH = '/b27/icon.svg'; // the official orange "2₿7" circular glyph
	const HERO_IMG = '/b27/hero-poster.webp'; // real B24 Nashville crowd photo

	// ── Content — populated from the real B27 site (conference.b.tc) ──────────────
	const BRAND_PRE = 'bitcoin'; // logo wordmark: "₿ bitcoin27"
	const BRAND_YR = '27';
	const EVENT_NAME = 'BITCOIN 2027';
	const TAGLINE = 'Sound Money. Center Stage.';
	const DATE = 'July 15–17, 2027';
	const CITY = 'Nashville, FL'.replace('FL', 'TN');
	const VENUE = 'Music City Center';
	const VENUE_ADDR = '201 Rep. John Lewis Way S, Nashville, TN 37203';
	// Countdown target (local time). Change freely.
	const TARGET = '2027-07-15T09:00:00';

	const NAV = [
		{ label: 'The Story', href: '#history' },
		{ label: 'Experience', href: '#experience' },
		{ label: 'Numbers', href: '#numbers' },
		{ label: 'Sponsors', href: '#sponsors' },
		{ label: 'Nashville', href: '#nashville' },
		{ label: 'Tickets', href: '#tickets' }
	];

	const SOCIAL = [
		{ label: 'X', href: 'https://x.com/BitcoinConf' },
		{ label: 'IG', href: 'https://instagram.com/bitcoinconference' },
		{ label: 'YT', href: 'https://youtube.com/@BitcoinMagazine' }
	];

	const INTRO =
		'From a white paper, some code and a simple message — “Chancellor on brink of second bailout for banks” — an idea was born so powerful it ignited a revolution.';
	const STORY =
		'Seven years on, the annual reunion of a fragmented ecosystem has become the world’s largest Bitcoin event — where builders, institutions, policymakers, and global decision-makers come together to shape what’s next.';
	const MOMENTS = [
		{ yr: '2019', note: 'The signal begins. The return of Bitcoin’s annual conference — the show that’s set the industry’s agenda ever since.' },
		{ yr: '2021', note: 'Miami. The largest Bitcoin event in history, where a nation-state first announced legal tender.' },
		{ yr: '2024', note: 'B24: the Reserve Bill is unveiled in Nashville, and the first sitting president addresses the community.' },
		{ yr: '2027', note: 'Sound Money. Center Stage. “The room where the rest of the decade gets written.”' }
	];

	const QUOTE = {
		text: 'The room where the rest of the decade gets written.',
		who: 'David Bailey',
		role: 'CEO & Chairman, Nakamoto Inc.'
	};

	// Orange-capped experience cards (B22's "DAY 1 / DAY 2-3 / DAY 4" pattern) —
	// real B24/B25 conference photos from conference.b.tc
	const EXPERIENCE = [
		{ cap: 'DAY 1', title: 'INDUSTRY DAY', note: 'Institutions, miners & builders.', img: '/b27/b25-expo.webp' },
		{ cap: 'DAY 2–3', title: 'MAIN STAGE', note: 'Keynotes, debates & the big reveals.', img: '/b27/b24-crowd.webp', feature: true },
		{ cap: 'DAY 4', title: 'SOUND MONEY FEST', note: 'Music, art & the after-hours.', img: '/b27/b25-crowd.webp' }
	];

	// "Run the Numbers" (B22 pattern)
	const NUMBERS = [
		{ val: '35,000+', label: 'Attendees' },
		{ val: '500+', label: 'Speakers' },
		{ val: '200+', label: 'Sponsors' },
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

	// ── Scroll state: hero float-nav detaches into the sticky navbar (the mechanic)
	let scrolled = $state(false);
	let mobileOpen = $state(false);
	function onScroll() {
		scrolled = (typeof window !== 'undefined' ? window.scrollY : 0) > 160;
	}

	// ── Countdown (B22 top bar) ──────────────────────────────────────────────────
	let cd = $state({ d: '00', h: '00', m: '00', s: '00' });
	function tick() {
		const diff = new Date(TARGET).getTime() - Date.now();
		if (diff <= 0) {
			cd = { d: '00', h: '00', m: '00', s: '00' };
			return;
		}
		const s = Math.floor(diff / 1000);
		const pad = (n: number) => String(n).padStart(2, '0');
		cd = {
			d: String(Math.floor(s / 86400)),
			h: pad(Math.floor((s % 86400) / 3600)),
			m: pad(Math.floor((s % 3600) / 60)),
			s: pad(s % 60)
		};
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
		tick();
		const iv = setInterval(tick, 1000);
		return () => clearInterval(iv);
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
		href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,400;0,600;0,700;0,900;1,700&display=swap"
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
			WIREFRAME MODE · structural skeleton (the sketch) · toggle off for the styled page
		{:else}
			TEMPLATE DEMO · B19/B21/B22 layout + vibe, brought to B27 · content from conference.b.tc · toggle wireframe to see the structure
		{/if}
	</div>

	<!-- ── countdown bar (B22) ──────────────────────────────────────────────────── -->
	<div class="countdown" data-wf="A0 · countdown bar">
		<span class="cd-label">⚠ Price increase in ⚠</span>
		<div class="cd-grid">
			<span><strong>{cd.d}</strong><small>Days</small></span>
			<span><strong>{cd.h}</strong><small>Hrs</small></span>
			<span><strong>{cd.m}</strong><small>Min</small></span>
			<span><strong>{cd.s}</strong><small>Sec</small></span>
		</div>
	</div>
	<!-- green announcement bar (B22) -->
	<a class="announce" href="#tickets" onclick={goTickets} data-wf="A0 · announcement bar">
		Pre-order your tickets for {EVENT_NAME} →
	</a>

	<!-- bold hero field: real B24 Nashville crowd photo + B21 pixel-dither skyline -->
	<div class="field" aria-hidden="true">
		<div class="photo" style="background-image:url({HERO_IMG})"></div>
		<div class="wash"></div>
		<div class="stars"></div>
		<div class="dither"></div>
		<div class="horizon"></div>
	</div>

	<!-- ════════════════════════════════════════════════════════════════════════
	     A · HERO (B21 layout) — pixel field; LEFT location block · CENTER glyph ·
	     RIGHT subscribe box; the white NAV BAR sits pinned at the BOTTOM.
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="hero" id="top" data-wf="A · HERO (B21 pixel field)">
		<div class="hero-row">
			<!-- A1 · LEFT — location / city / dates (B21's MANA WYNWOOD / Miami block) -->
			<div class="hero-left" data-wf="A1 · location block">
				<div class="hl-venue">{VENUE}</div>
				<div class="hl-city">{CITY.split(',')[0]}</div>
				<div class="hl-date">{DATE}</div>
				<div class="hl-whale">WHALE PASS: {DATE.split('–')[0]}–17</div>
			</div>

			<!-- A2 · CENTER — the official B27 circular "2₿7" glyph badge -->
			<div class="hero-mid" data-wf="A2 · glyph badge (2₿7)">
				<img class="glyph" src={GLYPH} alt={EVENT_NAME} />
			</div>

			<!-- A3 · RIGHT — subscribe box (B21) -->
			<div class="hero-right" data-wf="A3 · subscribe box">
				<div class="sub-head">Subscribe to receive {EVENT_NAME} updates</div>
				<form class="sub-form" onsubmit={(e) => e.preventDefault()}>
					<input type="email" placeholder="email address" aria-label="Email address" />
					<button type="submit">SUBMIT</button>
				</form>
			</div>
		</div>

		<a class="scrollcue" href="#history" aria-label="Scroll"><span class="chev">⌄</span></a>
	</section>

	<!-- ── B21 NAV BAR — sits at the bottom of the hero, then detaches & sticks to
	     the top on scroll (the signature mechanic). ONE element, repositioned. ── -->
	<header class="navbar" class:stuck={scrolled} data-wf="A4 · NAV BAR (bottom → sticks top on scroll)">
		<div class="nb-left">
			<div class="nb-social">{#each SOCIAL as s}<a href={s.href} target="_blank" rel="noopener">{s.label}</a>{/each}</div>
			<div class="nb-loc">
				<span>{CITY}</span><span>{DATE}</span><span>{VENUE}</span>
			</div>
		</div>
		<a class="nb-brand" href="#top">
			<img src={LOGO_LIGHT} alt={EVENT_NAME} />
		</a>
		<div class="nb-right">
			<a class="ticket-btn" href="#tickets" onclick={goTickets}>TICKETS</a>
		</div>
		<button class="nb-burger" aria-label="Menu" onclick={() => (mobileOpen = !mobileOpen)}>☰</button>
		<nav class="nb-links" aria-label="Sections">
			{#each NAV as n}<a href={n.href}>{n.label}</a>{/each}
		</nav>
	</header>

	{#if mobileOpen}
		<div class="mobile-menu">
			{#each NAV as n}<a href={n.href} onclick={() => (mobileOpen = false)}>{n.label}</a>{/each}
			<a class="mm-cta" href="#tickets" onclick={goTickets}>🎟 Tickets</a>
		</div>
	{/if}

	<!-- ════════════════════════════════════════════════════════════════════════
	     B21 INTRO — huge uppercase banner + livestream video (sits on the gray page)
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="intro" data-wf="B0 · intro banner + video">
		<div class="sheet">
			<h2 class="intro-h">THE LARGEST BITCOIN EVENT IN HISTORY</h2>
			<div class="video" style="background-image:url({HERO_IMG})">
				<div class="video-scrim"></div>
				<div class="video-meta">
					<span class="vm-badge">▶</span>
					<span><strong>{EVENT_NAME} Livestream — Day 1</strong><br />Bitcoin Magazine</span>
				</div>
				<button class="video-play" aria-label="Play">▶</button>
				<span class="video-yt">Watch on ▶ YouTube</span>
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════
	     B · THE STORY — contained white column, field shows on the sides
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="band" id="history" data-wf="B1 · THE STORY / history + key moments">
		<div class="sheet">
			<div class="kicker">An Annual Event for the Bitcoin Community</div>
			<h2 class="big">SETTING THE SIGNAL<br />SINCE 2019.</h2>
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
			<a class="pill orange wide" href="#tickets" onclick={goTickets} data-wf="B2 · ticket CTA">
				B27 booths are going fast — get involved →
			</a>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════
	     C · THE EXPERIENCE — orange-capped cards (B22 "days" pattern)
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="experience" id="experience" data-wf="C · THE EXPERIENCE (cards)">
		<div class="sheet">
			<div class="kicker center">The Bitcoin 2027 Experience</div>
			<h2 class="big center">THREE DAYS. ONE SIGNAL.</h2>
			<div class="cards">
				{#each EXPERIENCE as c}
					<div class="card" class:feature={c.feature}>
						<div class="card-cap">{c.cap}</div>
						<div class="card-body" style="background-image:url({c.img})">
							<div class="card-scrim"></div>
							<div class="card-text">
								<div class="card-title">{c.title}</div>
								<div class="card-note">{c.note}</div>
								{#if c.feature}<a class="pill orange sm" href="#tickets" onclick={goTickets}>View Agenda</a>{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ════════════════════════════════════════════════════════════════════════
	     C · RUN THE NUMBERS (B22 stat row)
	     ════════════════════════════════════════════════════════════════════════ -->
	<section class="numbers" id="numbers" data-wf="C · RUN THE NUMBERS">
		<div class="sheet">
			<h2 class="big center">📈 RUN THE NUMBERS 🚀</h2>
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

	<!-- Nashville / venue strip (C) -->
	<section class="nashville" id="nashville" data-wf="C · NASHVILLE / VENUE">
		<div class="sheet">
			<div class="kicker">Nashville</div>
			<h2 class="big">HOME TURF.</h2>
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
			<div class="kicker center">Sponsored by Leaders in the Bitcoin Industry — Moon → Block</div>
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
	<section class="tickets" id="tickets" data-wf="D · TICKETS / final CTA">
		<div class="sheet">
			<div class="sec-head center">
				<div class="kicker">Register Today</div>
				<h2 class="big">BE IN THE ROOM.</h2>
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
						<a class="pill {t.feature ? 'green' : 'ghost'} full" href="#tickets" onclick={(e) => e.preventDefault()}>
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
				<img src={LOGO_DARK} alt={EVENT_NAME} height="30" />
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
				<span class="muted">A template channeling B19 / B21 / B22 · content from conference.b.tc · built on tommy.studio</span>
			</div>
		</div>
	</footer>

	<!-- the classic "₿ bitcoin accepted" sticky corner badge -->
	<div class="accepted" aria-hidden="true"><span class="coin">₿</span> bitcoin<small>ACCEPTED</small></div>
</div>

<style>
	/* ── palette ─────────────────────────────────────────────────────────────── */
	.b27 {
		--orange: #ff9500;
		--orange-d: #e07f00;
		--green: #4dc04d;
		--purple: #360d96;
		--ink: #222;
		--paper: #ffffff;
		--mut: #8a8a8a;
		background: #0b0718;
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

	.ribbon {
		position: relative;
		z-index: 60;
		background: #141018;
		color: #d8d2e6;
		font-size: 11px;
		letter-spacing: 0.05em;
		font-weight: 700;
		text-align: center;
		padding: 7px 14px;
		text-transform: uppercase;
	}

	/* ── countdown + announcement bars ───────────────────────────────────────── */
	.countdown {
		position: relative;
		z-index: 55;
		background: #000;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 26px;
		padding: 8px 16px;
		flex-wrap: wrap;
	}
	.cd-label {
		font-weight: 700;
		letter-spacing: 0.04em;
		font-size: 13px;
	}
	.cd-grid {
		display: flex;
		gap: 22px;
	}
	.cd-grid span {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1;
	}
	.cd-grid strong {
		font-size: 22px;
		font-weight: 900;
		font-variant-numeric: tabular-nums;
	}
	.cd-grid small {
		font-size: 9px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #9a9a9a;
		margin-top: 3px;
	}
	.announce {
		position: relative;
		z-index: 55;
		display: block;
		text-align: center;
		background: var(--green);
		color: #fff;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-size: 13px;
		padding: 10px 16px;
	}
	.announce:hover {
		filter: brightness(1.05);
	}

	/* ── hero FIELD (fixed, behind the contained columns) ────────────────────── */
	.field {
		position: fixed;
		inset: 0;
		z-index: 0;
		/* B21 purple skyline — bright blue sky up top fading to deep purple city */
		background:
			linear-gradient(180deg, #8fb4e8 0%, #7f7fe0 24%, #6a3fd6 48%, #4b1fb0 70%, #360d96 100%);
		overflow: hidden;
	}
	/* real B24 Nashville crowd photo, anchored to the top (the hero) */
	.field .photo {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100vh;
		background-size: cover;
		background-position: center 38%;
		opacity: 0.32;
		mix-blend-mode: luminosity;
	}
	/* purple wash over the photo so the white text stays legible (B21 tint) */
	.field .wash {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(120, 90, 220, 0.25) 0%, rgba(74, 31, 176, 0.35) 55%, rgba(54, 13, 150, 0.7) 88%, #0b0718 100%);
	}
	/* starfield */
	.stars {
		position: absolute;
		inset: -10%;
		background-image:
			radial-gradient(1.4px 1.4px at 20% 30%, #fff, transparent),
			radial-gradient(1.2px 1.2px at 70% 20%, #fff, transparent),
			radial-gradient(1.6px 1.6px at 40% 70%, #cbd8ff, transparent),
			radial-gradient(1px 1px at 85% 55%, #fff, transparent),
			radial-gradient(1.3px 1.3px at 55% 42%, #fff, transparent),
			radial-gradient(1.1px 1.1px at 10% 80%, #cbd8ff, transparent),
			radial-gradient(1.5px 1.5px at 92% 82%, #fff, transparent),
			radial-gradient(1px 1px at 33% 12%, #fff, transparent);
		opacity: 0.8;
	}
	/* B21 pixel-dither signature — chunky 8-bit grid over the whole field */
	.dither {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.07) 1px, transparent 1px);
		background-size: 9px 9px;
		mix-blend-mode: overlay;
		opacity: 0.9;
	}
	/* scattered 8-bit "city light" pixels — the B21 pixelated-skyline texture */
	.horizon {
		position: absolute;
		inset: 0;
		background-image:
			radial-gradient(1px 1px at 12% 62%, rgba(255, 255, 255, 0.5), transparent),
			radial-gradient(2px 2px at 24% 74%, rgba(180, 150, 255, 0.4), transparent),
			radial-gradient(1px 1px at 38% 58%, rgba(255, 255, 255, 0.4), transparent),
			radial-gradient(2px 2px at 61% 80%, rgba(200, 170, 255, 0.4), transparent),
			radial-gradient(1px 1px at 72% 66%, rgba(255, 255, 255, 0.45), transparent),
			radial-gradient(2px 2px at 86% 78%, rgba(170, 140, 240, 0.4), transparent),
			radial-gradient(1px 1px at 92% 60%, rgba(255, 255, 255, 0.4), transparent);
		background-repeat: no-repeat;
		opacity: 0.8;
	}

	/* everything above the field */
	.hero,
	.band,
	.experience,
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

	/* the contained content column — field shows on the sides */
	.sheet {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0 44px;
	}

	/* ── A · HERO (B21) — full viewport; left location · center glyph · right sub ── */
	.hero {
		min-height: calc(100vh - 92px); /* leave room for the bottom nav bar */
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 40px 48px 20px;
		color: #fff;
	}
	.hero-row {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 40px;
		max-width: 1500px;
		width: 100%;
		margin: 0 auto;
	}
	/* A1 · LEFT location block (B21 MANA WYNWOOD / Miami / JUNE 4–5) */
	.hero-left {
		justify-self: end;
		text-align: right;
		text-shadow: 0 2px 16px rgba(0, 0, 0, 0.4);
	}
	.hl-venue {
		font-size: 15px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #fff;
	}
	.hl-city {
		font-size: clamp(46px, 7vw, 92px);
		font-weight: 900;
		line-height: 0.9;
		margin: 8px 0 10px;
		color: #fff;
	}
	.hl-date {
		font-size: clamp(20px, 3vw, 34px);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--orange);
	}
	.hl-whale {
		margin-top: 8px;
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #fff;
	}
	.hl-whale::first-line {
		color: #fff;
	}
	/* A2 · CENTER glyph badge (real B27 "2₿7") */
	.hero-mid {
		justify-self: center;
	}
	.glyph {
		display: block;
		width: clamp(230px, 26vw, 360px);
		height: auto;
		filter: drop-shadow(0 22px 55px rgba(0, 0, 0, 0.35));
	}
	/* A3 · RIGHT subscribe box (B21) */
	.hero-right {
		justify-self: start;
		max-width: 360px;
		width: 100%;
	}
	.sub-head {
		color: var(--orange);
		font-weight: 700;
		font-size: 15px;
		margin-bottom: 10px;
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
	}
	.sub-form {
		display: flex;
		flex-direction: column;
		background: var(--orange);
		padding: 8px;
		border-radius: 2px;
		gap: 8px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
	}
	.sub-form input {
		border: 0;
		border-radius: 2px;
		padding: 12px 14px;
		font-size: 15px;
		font-family: inherit;
		color: #333;
	}
	.sub-form input::placeholder {
		color: #9a9a9a;
	}
	.sub-form button {
		border: 0;
		background: #fff;
		color: #333;
		font-weight: 900;
		letter-spacing: 0.08em;
		font-size: 14px;
		padding: 12px;
		border-radius: 2px;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.15s, color 0.15s;
	}
	.sub-form button:hover {
		background: #222;
		color: #fff;
	}

	/* ── B21 NAV BAR — bottom of hero, detaches & sticks to top on scroll ──────── */
	.navbar {
		position: sticky;
		top: 0;
		z-index: 50;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		grid-template-areas: 'left brand right' 'links links links';
		align-items: center;
		gap: 6px 24px;
		padding: 12px 34px 10px;
		background: #fff;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.16);
	}
	.navbar.stuck {
		box-shadow: 0 4px 18px rgba(0, 0, 0, 0.22);
	}
	.nb-left {
		grid-area: left;
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.nb-social {
		display: flex;
		gap: 8px;
		color: var(--orange);
		font-weight: 900;
		font-size: 13px;
	}
	.nb-social a:hover {
		color: var(--ink);
	}
	.nb-loc {
		display: flex;
		flex-direction: column;
		gap: 0;
		font-size: 12px;
		font-weight: 700;
		color: var(--orange-d);
		line-height: 1.32;
	}
	.nb-brand {
		grid-area: brand;
		justify-self: center;
		display: inline-flex;
		align-items: center;
	}
	.nb-brand img {
		display: block;
		height: 30px;
		width: auto;
	}
	.nb-right {
		grid-area: right;
		justify-self: end;
	}
	.ticket-btn {
		display: inline-block;
		background: var(--green);
		color: #fff;
		font-weight: 900;
		font-size: 15px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 11px 22px;
		border-radius: 3px;
		border: 2px solid #3aa83a;
		white-space: nowrap;
	}
	.ticket-btn:hover {
		filter: brightness(1.06);
	}
	.nb-links {
		grid-area: links;
		display: flex;
		justify-content: center;
		gap: 26px;
		padding-top: 6px;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink);
	}
	.nb-links a {
		white-space: nowrap;
	}
	.nb-links a:hover {
		color: var(--orange);
	}
	.nb-burger {
		display: none;
		grid-area: right;
		justify-self: end;
		background: none;
		border: 0;
		color: var(--ink);
		font-size: 26px;
		cursor: pointer;
	}

	.mobile-menu {
		position: sticky;
		top: 56px;
		z-index: 49;
		background: #fff;
		padding: 16px 30px 24px;
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

	/* ── chunky pill buttons (green / orange / ghost) ────────────────────────── */
	.pill {
		display: inline-block;
		font-weight: 900;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-size: 15px;
		padding: 15px 30px;
		border-radius: 6px;
		border: 2px solid transparent;
		transition: filter 0.15s, transform 0.15s, background 0.15s, color 0.15s;
	}
	.pill:hover {
		transform: translateY(-1px);
	}
	.pill.green {
		background: var(--green);
		color: #fff;
		border-color: #3aa83a;
	}
	.pill.green:hover {
		filter: brightness(1.06);
	}
	.pill.orange {
		background: var(--orange);
		color: #fff;
		border-color: var(--orange-d);
	}
	.pill.orange:hover {
		filter: brightness(1.06);
	}
	.pill.ghost {
		background: #fff;
		color: var(--orange);
		border-color: var(--orange);
	}
	.pill.ghost:hover {
		background: var(--orange);
		color: #fff;
	}
	.pill.wide {
		margin-top: 8px;
	}
	.pill.full {
		display: block;
		text-align: center;
	}
	.pill.sm {
		font-size: 12px;
		padding: 10px 18px;
	}

	.scrollcue {
		align-self: center;
		margin-top: 36px;
		color: rgba(255, 255, 255, 0.85);
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.scrollcue .chev {
		font-size: 22px;
		animation: bob 1.6s ease-in-out infinite;
	}
	@keyframes bob {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(4px); }
	}

	/* ── B21 body: light-gray page, purple pixel field bleeds on the side margins ─ */
	.intro,
	.band,
	.experience,
	.numbers,
	.nashville,
	.sponsors,
	.tickets {
		background: #eef1f4;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0;
	}
	.intro {
		padding-top: 44px;
	}
	.band .sheet,
	.experience .sheet,
	.numbers .sheet,
	.nashville .sheet,
	.tickets .sheet {
		background: transparent;
		padding: 58px 64px;
		max-width: 1080px;
	}
	.band {
		padding-top: 8px;
	}
	.experience,
	.numbers,
	.nashville,
	.tickets {
		padding-top: 0;
	}
	.sponsors {
		padding: 40px 0 44px;
	}

	/* ── B21 intro banner + livestream video ─────────────────────────────────── */
	.intro-h {
		text-align: center;
		font-size: clamp(26px, 4.6vw, 56px);
		font-weight: 900;
		letter-spacing: 0.01em;
		text-transform: uppercase;
		line-height: 0.98;
		margin: 0 0 30px;
		color: var(--ink);
	}
	.video {
		position: relative;
		max-width: 940px;
		margin: 0 auto;
		aspect-ratio: 16 / 9;
		border-radius: 4px;
		overflow: hidden;
		background-size: cover;
		background-position: center;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
	}
	.video-scrim {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(54, 13, 150, 0.35), rgba(54, 13, 150, 0.15));
	}
	.video-meta {
		position: absolute;
		top: 16px;
		left: 18px;
		display: flex;
		align-items: center;
		gap: 10px;
		color: #fff;
		font-size: 13px;
		line-height: 1.25;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
	}
	.vm-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--orange);
		font-size: 12px;
	}
	.video-play {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 74px;
		height: 52px;
		border: 0;
		border-radius: 12px;
		background: #ff0000;
		color: #fff;
		font-size: 22px;
		cursor: pointer;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
	}
	.video-yt {
		position: absolute;
		right: 16px;
		bottom: 14px;
		background: rgba(0, 0, 0, 0.6);
		color: #fff;
		font-size: 13px;
		font-weight: 700;
		padding: 7px 12px;
		border-radius: 4px;
	}

	/* ── shared type ─────────────────────────────────────────────────────────── */
	.kicker {
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--orange);
		margin-bottom: 14px;
	}
	.kicker.center {
		text-align: center;
	}
	.big {
		font-size: clamp(30px, 5.4vw, 62px);
		font-weight: 900;
		letter-spacing: 0.01em;
		text-transform: uppercase;
		line-height: 0.96;
		margin: 0 0 18px;
		color: var(--ink);
	}
	.big.center {
		text-align: center;
	}
	.sec-head {
		margin-bottom: 36px;
	}
	.sec-head.center {
		text-align: center;
	}
	.sub,
	.lede {
		color: #4a4a4a;
		font-size: 17px;
		line-height: 1.55;
		max-width: 640px;
	}
	.lede.orange {
		color: var(--orange-d);
		font-weight: 700;
		font-size: 19px;
	}
	.sec-head.center .sub {
		margin: 0 auto;
	}

	.timeline {
		list-style: none;
		margin: 32px 0 38px;
		padding: 0;
		border-left: 3px solid rgba(255, 149, 0, 0.35);
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
		left: -7px;
		top: 6px;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: #cfcfcf;
	}
	.timeline li.now::before {
		background: var(--orange);
		box-shadow: 0 0 0 4px rgba(255, 149, 0, 0.2);
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

	.pullquote {
		margin: 8px 0 34px;
		border-left: 5px solid var(--orange);
		padding: 6px 0 6px 24px;
	}
	.pullquote blockquote {
		margin: 0;
		font-size: clamp(22px, 3.4vw, 32px);
		font-weight: 900;
		text-transform: uppercase;
		line-height: 1.12;
		color: var(--ink);
	}
	.pullquote figcaption {
		margin-top: 12px;
		font-size: 14px;
		font-weight: 600;
	}

	/* ── C · experience cards (orange-capped) ────────────────────────────────── */
	.cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 18px;
		margin-top: 34px;
	}
	.card {
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	}
	.card-cap {
		background: var(--orange);
		color: #fff;
		text-align: center;
		font-weight: 900;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 12px;
		font-size: 17px;
	}
	.card-body {
		position: relative;
		min-height: 300px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 24px 22px;
		color: #fff;
		background-size: cover;
		background-position: center;
	}
	.card-scrim {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.35) 45%, rgba(0, 0, 0, 0.82) 100%);
	}
	.card-text {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.card.feature .card-body {
		min-height: 340px;
	}
	.card-title {
		font-size: clamp(24px, 3vw, 34px);
		font-weight: 900;
		text-transform: uppercase;
		line-height: 0.96;
	}
	.card-note {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.88);
	}

	/* ── C · run the numbers ─────────────────────────────────────────────────── */
	.num-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-top: 20px;
		text-align: center;
	}
	.num-val {
		font-size: clamp(40px, 6.4vw, 76px);
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
		border-left: 4px solid var(--orange);
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

	/* ── sponsors marquee ────────────────────────────────────────────────────── */
	.marquee {
		margin-top: 22px;
		overflow: hidden;
		-webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
		mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
	}
	.track {
		display: flex;
		gap: 22px;
		width: max-content;
		animation: slide 30s linear infinite;
	}
	.track .logo {
		font-weight: 900;
		font-size: 17px;
		letter-spacing: 0.06em;
		color: var(--ink);
		white-space: nowrap;
		background: #fff;
		padding: 14px 26px;
		border-radius: 999px;
		box-shadow: 0 10px 26px rgba(0, 0, 0, 0.2);
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
		border-radius: 8px;
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
		font-weight: 900;
		letter-spacing: 0.1em;
		padding: 4px 10px;
		border-radius: 3px;
	}
	.tier-name {
		font-weight: 900;
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
		font-size: 38px;
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

	.foot {
		background: #141018;
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
		display: block;
		margin-bottom: 28px;
	}
	.foot-brand img {
		height: 30px;
		width: auto;
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
		color: #b5b5c5;
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
		color: #9a9aa8;
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
		background: rgba(10, 6, 24, 0.7);
		color: #fff;
		font-weight: 700;
		font-style: italic;
		font-size: 16px;
		padding: 8px 14px 8px 12px;
		border-radius: 0 6px 6px 0;
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
	/* stack the B21 hero: center glyph, location above, subscribe below */
	@media (max-width: 1040px) {
		.hero-row {
			grid-template-columns: 1fr;
			justify-items: center;
			gap: 26px;
		}
		.hero-left {
			justify-self: center;
			text-align: center;
			order: 1;
		}
		.hero-mid {
			order: 0;
		}
		.hero-right {
			order: 2;
			justify-self: center;
		}
	}

	@media (max-width: 860px) {
		.navbar {
			grid-template-columns: auto 1fr auto;
			grid-template-areas: 'brand brand burger';
			padding: 12px 20px;
		}
		.nb-left,
		.nb-links {
			display: none;
		}
		.nb-right {
			display: none;
		}
		.nb-brand {
			justify-self: start;
		}
		.nb-burger {
			display: block;
		}
		.mobile-menu {
			display: flex;
		}
		.hero {
			padding: 32px 22px 16px;
		}
		.sheet {
			padding: 0 20px;
		}
		.band .sheet,
		.experience .sheet,
		.numbers .sheet,
		.nashville .sheet,
		.tickets .sheet {
			padding: 48px 24px;
		}
		.cards,
		.num-row,
		.venue-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.tiers,
		.foot-cols {
			grid-template-columns: 1fr;
		}
		.cd-label {
			display: none;
		}
		.accepted {
			display: none;
		}
	}

	/* ════════════════════════════════════════════════════════════════════════
	   WIREFRAME MODE — html.wf strips the page to its structural skeleton (the
	   sketch): white blueprint, dashed block outlines, labels revealed.
	   ════════════════════════════════════════════════════════════════════════ */
	:global(html.wf) .b27 {
		--orange: #111;
		--green: #111;
		--ink: #111;
		--mut: #888;
		background: #f4f4f2;
		color: #111;
	}
	:global(html.wf) .field,
	:global(html.wf) .accepted {
		display: none !important;
	}
	:global(html.wf) .b27 :global(*) {
		background: transparent !important;
		box-shadow: none !important;
		text-shadow: none !important;
		backdrop-filter: none !important;
		color: #111 !important;
		border-color: #bbb !important;
	}
	:global(html.wf) .ribbon,
	:global(html.wf) .countdown,
	:global(html.wf) .announce {
		background: #111 !important;
		color: #fff !important;
	}
	:global(html.wf) .countdown :global(*),
	:global(html.wf) .announce :global(*) {
		color: #fff !important;
	}
	:global(html.wf) .coin,
	:global(html.wf) .glyph {
		border: 1.5px dashed #999 !important;
		color: #111 !important;
	}
	/* real logo/photo assets become dashed placeholder boxes in wireframe mode */
	:global(html.wf) .glyph,
	:global(html.wf) .nb-brand img,
	:global(html.wf) .foot-brand img {
		opacity: 0 !important;
		outline: 1.5px dashed #999 !important;
		min-height: 26px;
	}
	:global(html.wf) .card-body {
		background-image: none !important;
	}
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
	/* center overlapping labels so they don't collide */
	:global(html.wf) .navbar[data-wf]::before,
	:global(html.wf) .countdown[data-wf]::before,
	:global(html.wf) .announce[data-wf]::before {
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	:global(html.wf) .hero-left[data-wf]::before {
		left: auto;
		right: 6px;
	}
	:global(html.wf) .pill,
	:global(html.wf) .ticket-btn,
	:global(html.wf) .track .logo,
	:global(html.wf) .card-cap {
		border: 1.5px solid #111 !important;
		border-radius: 2px !important;
	}
	:global(html.wf) .card-body {
		border: 1.5px dashed #bbb !important;
	}
	:global(html.wf) .track,
	:global(html.wf) .scrollcue .chev {
		animation: none !important;
	}
	/* hero text is white-on-cosmic normally; force it readable on paper */
	:global(html.wf) .hero,
	:global(html.wf) .hero-left,
	:global(html.wf) .hl-venue,
	:global(html.wf) .hl-city,
	:global(html.wf) .hl-date,
	:global(html.wf) .hl-whale,
	:global(html.wf) .nb-links a,
	:global(html.wf) .scrollcue,
	:global(html.wf) .card-body,
	:global(html.wf) .card-title,
	:global(html.wf) .card-note {
		color: #111 !important;
	}
	:global(html.wf) .band .sheet,
	:global(html.wf) .experience .sheet,
	:global(html.wf) .numbers .sheet,
	:global(html.wf) .nashville .sheet,
	:global(html.wf) .tickets .sheet {
		border-radius: 2px !important;
	}
</style>
