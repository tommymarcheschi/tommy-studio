<script lang="ts">
	// ── Bitcoin Magazine Store — REDESIGN DEMO ────────────────────────────────────
	// A proof-of-concept storefront for bitcoinmagazine.com, built to run on the
	// shared BMAG commerce backend (SvelteKit + Supabase + Stripe + BTCPay) instead
	// of Shopify. Brand-distinct from BMAG (museum) but same infra underneath.
	// Products below are REAL items/prices pulled from the live Shopify store, used
	// here only to populate the layout. No real checkout — preview only.

	type Cat = 'Issues' | 'Books' | 'Prints' | 'Hardware' | 'Collectibles';

	interface Product {
		title: string;
		price: string;
		cat: Cat;
		tag?: string;
		blurb?: string;
		img?: string;
	}

	// ── Rotating fullscreen hero campaigns ───────────────────────────────────────
	// Each slide is a full-bleed takeover for ONE thing we're pushing. bg can be an
	// image (now) or a video src (field reserved). Rotates automatically; dots let
	// the visitor drive. Floating feature widgets cross-promote other items on top.
	interface Slide {
		kicker: string;
		headline: string;
		sub: string;
		price: string;
		cta: string;
		href: string;
		bg: string; // image url
		video?: string; // optional video src (takes over bg when set)
		align?: 'left' | 'center';
		accent?: string; // optional headline accent word color override
	}

	const slides: Slide[] = [
		{
			kicker: 'New · Issue #42 · On sale now',
			headline: 'The Quantum Issue',
			sub: "Don't panic. The threat that could break Bitcoin at the root — with Jameson Lopp, Ethan Heilman, Jonas Nick & Max Keiser.",
			price: 'From $21.00',
			cta: 'Shop Issue #42',
			href: '#issues',
			bg: '/bmag/products/p10.webp',
			align: 'left'
		},
		{
			kicker: 'The Collector’s Vault · Graded & Historic',
			headline: 'History you can hold.',
			sub: 'The first issue ever printed, CGC-graded slabs, and limited fine-art prints — the pieces that make a collection.',
			price: 'From $256',
			cta: 'Enter the Vault',
			href: '#collect',
			bg: '/bmag/products/p9.webp',
			align: 'left'
		},
		{
			kicker: 'Secure your stack · Hardware',
			headline: 'Self-custody, sorted.',
			sub: 'Blockstream Jade & Jade Plus — open-source hardware wallets, shipped worldwide. Pay in Bitcoin.',
			price: 'From $67',
			cta: 'Shop Hardware',
			href: '#hardware',
			bg: '/bmag/products/p18.webp',
			align: 'left'
		}
	];

	let slide = $state(0);
	let heroHover = $state(false);
	function go(i: number) {
		slide = (i + slides.length) % slides.length;
	}
	$effect(() => {
		if (heroHover) return;
		const id = setInterval(() => (slide = (slide + 1) % slides.length), 6000);
		return () => clearInterval(id);
	});

	// floating feature widgets pinned over the hero (cross-promote)
	const features = [
		{ label: 'Collector’s pick', title: 'Issue #1 · CGC 9.8', price: '$4,999', img: '/bmag/products/p9.webp', href: '#collect' },
		{ label: 'Bestseller', title: 'The Satoshi Papers', price: '$199.95', img: '/bmag/products/p32.webp', href: '#books' },
		{ label: 'Limited print', title: 'The Magician (2025)', price: '$256', img: '/bmag/products/p31.webp', href: '#prints' }
	];

	// scrolled-past-hero → solid Amazon-style navbar
	let scrolled = $state(false);
	function onScroll() {
		scrolled = (typeof window !== 'undefined' ? window.scrollY : 0) > 80;
	}
	let query = $state('');

	const collectors: Product[] = [
		{ title: 'Bitcoin Magazine Issue #1 · CGC 9.8', price: '$4,999', cat: 'Collectibles', img: '/bmag/products/p9.webp', tag: 'CGC 9.8 · Graded' },
		{ title: 'Bitcoin Magazine Issue 1', price: '$2,100', cat: 'Issues', img: '/bmag/products/p46.webp', tag: '2012 · Historic', blurb: 'The first issue ever printed. A genuine artifact of Bitcoin history.' },
		{ title: '10th Anniversary Edition', price: '$249.99', cat: 'Issues', img: '/bmag/products/p8.webp', tag: 'Collector’s Edition' },
		{ title: 'The Genesis Book · #1 Collector’s Package', price: '$5,000', cat: 'Books', img: '/bmag/products/p0.webp', tag: '#1 · Collector' },
		{ title: 'Bitcoin War Bonds (2022) Print', price: '$256', cat: 'Prints', img: '/bmag/products/p22.webp', tag: '#/256 · Limited' },
		{ title: 'The Magician (2025) Print', price: '$256', cat: 'Prints', img: '/bmag/products/p31.webp', tag: '#/256 · Limited' }
	];

	const catalog: Product[] = [
		{ title: 'The Quantum Issue, #42', price: 'From $21', cat: 'Issues', img: '/bmag/products/p10.webp', tag: 'Current' },
		{ title: 'The 2036 Issue, #41', price: 'From $29', cat: 'Issues', img: '/bmag/products/p13.webp' },
		{ title: 'The Core Issue, #40', price: 'From $29', cat: 'Issues', img: '/bmag/products/p16.webp' },
		{ title: 'The El Salvador Issue, #24', price: '$79.99', cat: 'Issues', img: '/bmag/products/p7.webp', tag: 'Historic' },
		{ title: 'The Censorship Resistant Issue, #26', price: '$79.99', cat: 'Issues', img: '/bmag/products/p5.webp', tag: 'Historic' },
		{ title: 'To The Moon Issue, #25', price: '$79.99', cat: 'Issues', img: '/bmag/products/p6.webp', tag: 'Historic' },
		{ title: 'Annual Subscription', price: '$79', cat: 'Issues', img: '/bmag/products/p45.webp', tag: 'Print + digital' },
		{ title: 'Collector’s Edition Subscription', price: '$155', cat: 'Issues', img: '/bmag/products/p42.webp', tag: 'Sealed copy' },
		{ title: 'The Genesis Book', price: '$16.99', cat: 'Books', img: '/bmag/products/p35.webp' },
		{ title: 'The Satoshi Papers', price: '$199.95', cat: 'Books', img: '/bmag/products/p32.webp' },
		{ title: 'Bitcoin Is Venice', price: '$17.99', cat: 'Books', img: '/bmag/products/p44.webp' },
		{ title: 'The Bitcoin Tao', price: '$145', cat: 'Books', img: '/bmag/products/p15.webp' },
		{ title: 'The Philosophy of Bitcoin', price: '$17.99', cat: 'Books', img: '/bmag/products/p40.webp' },
		{ title: 'Fiat Ruins Everything', price: '$17.99', cat: 'Books', img: '/bmag/products/p38.webp' },
		{ title: 'A Progressive’s Case For Bitcoin', price: '$14.99', cat: 'Books', img: '/bmag/products/p23.webp' },
		{ title: 'The Bitcoin-Dollar', price: '$15.99', cat: 'Books', img: '/bmag/products/p37.webp' },
		{ title: 'FAKEGENESIS (2022) Print', price: '$256', cat: 'Prints', img: '/bmag/products/p24.webp', tag: '#/256 · Limited' },
		{ title: 'WORLD•LOVE•BITCOIN•PEACE Print', price: '$256', cat: 'Prints', img: '/bmag/products/p29.webp', tag: '#/69 · Limited' },
		{ title: 'Magic Lantern Show (2024) Print', price: '$256', cat: 'Prints', img: '/bmag/products/p30.webp', tag: '#/256 · Limited' },
		{ title: 'Fiat Land by Marcus Connor', price: '$121', cat: 'Prints', img: '/bmag/products/p19.webp', tag: 'Art print' },
		{ title: 'Blockstream Jade Plus', price: '$169', cat: 'Hardware', img: '/bmag/products/p18.webp', tag: 'Hardware wallet' },
		{ title: 'Blockstream Jade', price: '$67', cat: 'Hardware', img: '/bmag/products/p20.webp', tag: 'Hardware wallet' },
		{ title: 'Bitcoin 2025 Limited Edition Watch', price: '$1,299', cat: 'Collectibles', img: '/bmag/products/p25.webp', tag: 'Limited' },
		{ title: 'Bicycle® Bitcoin Playing Cards', price: '$40', cat: 'Collectibles', img: '/bmag/products/p21.webp' }
	];

	const cats: (Cat | 'All')[] = ['All', 'Issues', 'Books', 'Prints', 'Hardware', 'Collectibles'];
	let active = $state<Cat | 'All'>('All');
	const shown = $derived(active === 'All' ? catalog : catalog.filter((p) => p.cat === active));

	let bag = $state(0);
	function add() {
		bag += 1;
	}
</script>

<svelte:head>
	<title>Bitcoin Magazine Store — Redesign Demo</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<svelte:window on:scroll={onScroll} />

<div class="bm" id="top" class:scrolled>
	<!-- demo ribbon -->
	<div class="ribbon">
		CONCEPT DEMO · bitcoinmagazine.com store on the shared BMAG backend · not live checkout
	</div>

	<!-- nav: transparent over hero, solid Amazon-style bar once scrolled -->
	<header class="nav" class:solid={scrolled}>
		<a class="brand" href="#top">
			<img class="logo-img" src="/bmag/bitcoin-magazine-logo.png" alt="Bitcoin Magazine" />
			<span class="btag">STORE</span>
		</a>
		<div class="search">
			<span class="sicon">⌕</span>
			<input placeholder="Search issues, books, prints, hardware…" bind:value={query} />
			<button class="sgo" onclick={() => (active = 'All')}>Search</button>
		</div>
		<nav class="links">
			<a href="#issues">Issues</a>
			<a href="#books">Books</a>
			<a href="#prints">Prints &amp; Art</a>
			<a href="#hardware">Hardware</a>
			<a href="#collect">Vault</a>
		</nav>
		<div class="navright">
			<span class="pay">₿ · ⚡ · Card</span>
			<button class="bag" onclick={add}>Bag · {bag}</button>
		</div>
	</header>

	<!-- fullscreen rotating hero takeover -->
	<section
		class="hero"
		aria-label="Featured"
		onmouseenter={() => (heroHover = true)}
		onmouseleave={() => (heroHover = false)}
	>
		{#each slides as s, i}
			<div class="slide" class:active={i === slide} aria-hidden={i !== slide}>
				{#if s.video}
					<!-- svelte-ignore a11y_media_has_caption -->
					<video class="slide-bg" src={s.video} autoplay muted loop playsinline></video>
				{:else}
					<div class="slide-bg" style="background-image:url({s.bg})"></div>
				{/if}
				<div class="scrim"></div>
			</div>
		{/each}

		<div class="hero-inner">
			{#key slide}
				<div class="hero-copy">
					<div class="kicker">{slides[slide].kicker}</div>
					<h1>{slides[slide].headline}</h1>
					<p>{slides[slide].sub}</p>
					<div class="hero-cta">
						<a class="primary" href={slides[slide].href} onclick={add}>{slides[slide].cta}</a>
						<span class="hprice">{slides[slide].price}</span>
					</div>
					<div class="trust">
						<span>⚡ Lightning &amp; on-chain</span><span>◆ Stripe cards</span><span>✓ We own your order data</span>
					</div>
				</div>
			{/key}

			<!-- floating feature widgets over the takeover -->
			<aside class="features" aria-label="Also featured">
				{#each features as f}
					<a class="fwidget" href={f.href}>
						<span class="fimg" style="background-image:url({f.img})"></span>
						<span class="ftext">
							<span class="flabel">{f.label}</span>
							<span class="ftitle">{f.title}</span>
							<span class="fprice">{f.price}</span>
						</span>
					</a>
				{/each}
			</aside>
		</div>

		<!-- slide controls -->
		<div class="dots" role="tablist" aria-label="Choose featured slide">
			{#each slides as _, i}
				<button
					class="dot"
					class:on={i === slide}
					role="tab"
					aria-label={`Slide ${i + 1}`}
					aria-selected={i === slide}
					onclick={() => go(i)}
				></button>
			{/each}
		</div>
		<a class="scrollcue" href="#collect" aria-label="Scroll to shop">
			<span>Shop the store</span><span class="chev">⌄</span>
		</a>
	</section>

	<!-- collector's vault -->
	<section class="vault" id="collect">
		<div class="vhead">
			<div>
				<div class="eyebrow">The Collector’s Vault</div>
				<h2>History you can hold.</h2>
			</div>
			<p class="vsub">
				Historic issues and limited-edition fine-art prints — the pieces that make Bitcoin
				Magazine a collection, not a catalog.
			</p>
		</div>
		<div class="vgrid">
			{#each collectors as p}
				<article class="vcard">
					<div class="vimg">
						{#if p.img}
							<img class="vpic" src={p.img} alt={p.title} loading="lazy" />
						{:else}
							<span class="vmono">{p.title.includes('Issue 1') ? '№1' : p.title.includes('Print') ? '◈' : '◆'}</span>
						{/if}
						{#if p.tag}<span class="vtag">{p.tag}</span>{/if}
					</div>
					<div class="vbody">
						<h3>{p.title}</h3>
						{#if p.blurb}<p>{p.blurb}</p>{/if}
						<div class="vrow">
							<span class="vprice">{p.price}</span>
							<button class="mini" onclick={add}>Add</button>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<!-- shop / catalog -->
	<section class="shop" id="issues">
		<div class="shead">
			<h2>The Store</h2>
			<div class="filters">
				{#each cats as c}
					<button class:on={active === c} onclick={() => (active = c)}>{c}</button>
				{/each}
			</div>
		</div>
		<div class="grid">
			{#each shown as p}
				<article class="card">
					<div class="cimg">
						{#if p.img}
							<img class="cpic" src={p.img} alt={p.title} loading="lazy" />
						{:else}
							<span class="cmono"
								>{p.cat === 'Issues' ? '📰' : p.cat === 'Books' ? '▦' : p.cat === 'Prints' ? '◈' : p.cat === 'Hardware' ? '▣' : '✦'}</span
							>
						{/if}
						{#if p.tag}<span class="ctag">{p.tag}</span>{/if}
					</div>
					<div class="cbody">
						<div class="ccat">{p.cat}</div>
						<h3>{p.title}</h3>
						<div class="crow">
							<span class="cprice">{p.price}</span>
							<button class="mini" onclick={add}>Add</button>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</section>

	<!-- why switch band -->
	<section class="band">
		<div class="bitem"><span>₿</span><h4>Bitcoin-native checkout</h4><p>Lightning, on-chain, or card — one flow, your rails.</p></div>
		<div class="bitem"><span>◇</span><h4>You own the data</h4><p>Every order, customer, and payout lives in our database — not Shopify’s.</p></div>
		<div class="bitem"><span>◆</span><h4>One backend, two brands</h4><p>Same engine that runs BMAG auctions, skinned for Bitcoin Magazine.</p></div>
	</section>

	<footer class="foot">
		<img class="foot-logo" src="/bmag/bitcoin-magazine-logo.png" alt="Bitcoin Magazine" />
		<div class="fmono">Concept redesign · runs on the shared BMAG commerce backend · demo only</div>
	</footer>
</div>

<style>
	.bm {
		--ink: #0b0b0c;
		--ink2: #141416;
		--paper: #f4efe6;
		--paper2: #e9e1d2;
		--orange: #f7931a;
		--orange2: #ffb04a;
		--line: #26262b;
		--muted: #8a8a93;
		background: var(--ink);
		color: var(--paper);
		font-family: 'Montserrat', system-ui, sans-serif;
		min-height: 100vh;
		overflow-x: hidden;
	}
	.bm :global(*) {
		box-sizing: border-box;
	}
	.ribbon {
		background: var(--orange);
		color: #1a1206;
		text-align: center;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		padding: 7px 12px;
		text-transform: uppercase;
	}

	/* nav: fixed overlay on the hero, becomes a solid Amazon-style bar on scroll */
	.nav {
		display: flex;
		align-items: center;
		gap: 22px;
		padding: 16px 40px;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background: transparent;
		border-bottom: 1px solid transparent;
		z-index: 40;
		transition: background 0.3s ease, border-color 0.3s ease, padding 0.3s ease, box-shadow 0.3s ease;
	}
	.nav.solid {
		background: rgba(10, 10, 12, 0.94);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--line);
		padding: 12px 40px;
		box-shadow: 0 10px 30px -18px rgba(0, 0, 0, 0.9);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
		flex-shrink: 0;
	}
	.logo-img {
		height: 26px;
		width: auto;
		display: block;
	}
	.btag {
		font-size: 10px;
		letter-spacing: 0.4em;
		color: var(--orange);
		font-weight: 700;
		padding-left: 12px;
		border-left: 1px solid rgba(255, 255, 255, 0.18);
		line-height: 1;
	}
	/* Amazon-style search field — hidden over hero, slides in when solid */
	.search {
		flex: 1;
		max-width: 520px;
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 0 6px 0 16px;
		height: 42px;
		opacity: 0;
		transform: translateY(-4px);
		pointer-events: none;
		transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s ease;
	}
	.nav.solid .search {
		opacity: 1;
		transform: none;
		pointer-events: auto;
	}
	.search:focus-within {
		border-color: var(--orange);
		background: rgba(255, 255, 255, 0.09);
	}
	.sicon {
		color: var(--muted);
		font-size: 18px;
	}
	.search input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--paper);
		font-size: 14px;
		font-family: inherit;
	}
	.search input::placeholder {
		color: var(--muted);
	}
	.sgo {
		background: var(--orange);
		color: #1a1206;
		border: none;
		border-radius: 999px;
		padding: 0 18px;
		height: 32px;
		font-weight: 800;
		font-size: 13px;
		cursor: pointer;
	}
	.links {
		display: flex;
		gap: 22px;
		font-size: 13px;
		font-weight: 600;
		flex-shrink: 0;
	}
	.links a {
		color: var(--paper);
		text-decoration: none;
		opacity: 0.9;
		text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
	}
	.links a:hover {
		opacity: 1;
		color: var(--orange2);
	}
	.navright {
		display: flex;
		align-items: center;
		gap: 16px;
		flex-shrink: 0;
	}
	.pay {
		font-size: 11px;
		color: var(--paper);
		opacity: 0.8;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
	}
	.bag {
		background: rgba(0, 0, 0, 0.25);
		border: 1px solid var(--orange);
		color: var(--orange2);
		border-radius: 999px;
		padding: 8px 16px;
		font-weight: 700;
		font-size: 13px;
		cursor: pointer;
		backdrop-filter: blur(4px);
	}
	.bag:hover {
		background: var(--orange);
		color: #1a1206;
	}

	/* ── fullscreen rotating hero takeover ─────────────────────────────── */
	.hero {
		position: relative;
		height: 100vh;
		min-height: 620px;
		width: 100%;
		overflow: hidden;
		display: flex;
		align-items: flex-end;
	}
	.slide {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 1.1s ease;
		z-index: 0;
	}
	.slide.active {
		opacity: 1;
		z-index: 1;
	}
	.slide-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background-size: cover;
		background-position: center;
		transform: scale(1.06);
		animation: kenburns 14s ease-out forwards;
	}
	.slide.active .slide-bg {
		animation: kenburns 14s ease-out forwards;
	}
	@keyframes kenburns {
		from {
			transform: scale(1.14);
		}
		to {
			transform: scale(1.02);
		}
	}
	/* legibility scrim: dark on the left where copy sits, vignette all round */
	.scrim {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(90deg, rgba(8, 8, 10, 0.92) 0%, rgba(8, 8, 10, 0.72) 32%, rgba(8, 8, 10, 0.25) 62%, rgba(8, 8, 10, 0.55) 100%),
			linear-gradient(0deg, rgba(8, 8, 10, 0.95) 0%, rgba(8, 8, 10, 0.1) 34%, transparent 55%);
	}
	.hero-inner {
		position: relative;
		z-index: 2;
		width: 100%;
		max-width: 1300px;
		margin: 0 auto;
		padding: 0 40px 92px;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 40px;
	}
	.hero-copy {
		max-width: 560px;
		animation: riseIn 0.7s ease both;
	}
	@keyframes riseIn {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	.kicker {
		color: var(--orange2);
		font-size: 12px;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin-bottom: 16px;
		text-shadow: 0 1px 14px rgba(0, 0, 0, 0.6);
	}
	.hero h1 {
		font-family: 'EB Garamond', Georgia, serif;
		font-size: 76px;
		line-height: 0.98;
		font-weight: 600;
		margin: 0 0 20px;
		letter-spacing: -0.01em;
		text-shadow: 0 4px 40px rgba(0, 0, 0, 0.7);
	}
	.hero p {
		color: #e7e0d2;
		font-size: 18px;
		line-height: 1.55;
		max-width: 470px;
		margin: 0 0 28px;
		text-shadow: 0 1px 18px rgba(0, 0, 0, 0.6);
	}
	.hero-cta {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 24px;
	}
	.primary {
		background: var(--orange);
		color: #1a1206;
		border: none;
		border-radius: 999px;
		padding: 16px 34px;
		font-weight: 800;
		font-size: 15px;
		cursor: pointer;
		text-decoration: none;
		display: inline-block;
		box-shadow: 0 16px 40px -14px rgba(247, 147, 26, 0.7);
		transition: background 0.2s ease, transform 0.15s ease;
	}
	.primary:hover {
		background: var(--orange2);
		transform: translateY(-2px);
	}
	.hprice {
		font-weight: 800;
		color: var(--paper);
		font-size: 15px;
		text-shadow: 0 1px 12px rgba(0, 0, 0, 0.7);
	}
	.trust {
		display: flex;
		gap: 18px;
		flex-wrap: wrap;
		font-size: 12px;
		color: #d7d0c2;
		font-weight: 700;
		text-shadow: 0 1px 10px rgba(0, 0, 0, 0.6);
	}

	/* floating feature widgets over the takeover */
	.features {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 290px;
		flex-shrink: 0;
	}
	.fwidget {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px;
		border-radius: 14px;
		background: rgba(18, 18, 22, 0.55);
		border: 1px solid rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(14px);
		text-decoration: none;
		transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
	}
	.fwidget:hover {
		transform: translateX(-4px);
		border-color: var(--orange);
		background: rgba(24, 24, 28, 0.7);
	}
	.fimg {
		width: 52px;
		height: 66px;
		border-radius: 6px;
		background-size: cover;
		background-position: center;
		flex-shrink: 0;
		box-shadow: 0 6px 14px -6px rgba(0, 0, 0, 0.8);
	}
	.ftext {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.flabel {
		font-size: 9px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--orange2);
		font-weight: 800;
	}
	.ftitle {
		font-size: 13px;
		font-weight: 700;
		color: var(--paper);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.fprice {
		font-size: 13px;
		font-weight: 800;
		color: var(--paper);
	}

	/* slide dots + scroll cue */
	.dots {
		position: absolute;
		left: 40px;
		bottom: 38px;
		display: flex;
		gap: 9px;
		z-index: 3;
	}
	.dot {
		width: 30px;
		height: 4px;
		border-radius: 999px;
		border: none;
		background: rgba(255, 255, 255, 0.3);
		cursor: pointer;
		padding: 0;
		transition: background 0.2s ease, width 0.2s ease;
	}
	.dot.on {
		background: var(--orange);
		width: 46px;
	}
	.scrollcue {
		position: absolute;
		right: 40px;
		bottom: 34px;
		z-index: 3;
		display: flex;
		align-items: center;
		gap: 8px;
		color: #d7d0c2;
		text-decoration: none;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.85;
	}
	.scrollcue:hover {
		opacity: 1;
		color: var(--orange2);
	}
	.chev {
		font-size: 18px;
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

	/* vault */
	.vault {
		background: var(--ink2);
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		padding: 64px 40px;
	}
	.vhead {
		max-width: 1240px;
		margin: 0 auto 36px;
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 30px;
	}
	.eyebrow {
		color: var(--orange);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		margin-bottom: 10px;
	}
	.vhead h2,
	.shead h2 {
		font-family: 'EB Garamond', serif;
		font-size: 40px;
		font-weight: 600;
		margin: 0;
	}
	.vsub {
		color: #cfc8ba;
		font-size: 15px;
		max-width: 420px;
		line-height: 1.6;
	}
	.vgrid {
		max-width: 1240px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}
	.vcard {
		background: var(--ink);
		border: 1px solid var(--line);
		border-radius: 12px;
		overflow: hidden;
		transition: transform 0.18s ease, border-color 0.18s ease;
	}
	.vcard:hover {
		transform: translateY(-4px);
		border-color: var(--orange);
	}
	.vimg {
		height: 260px;
		background:
			radial-gradient(120% 120% at 50% -5%, rgba(247, 147, 26, 0.18), transparent 58%),
			linear-gradient(160deg, #1b1b1f, #0a0a0c);
		display: grid;
		place-items: center;
		position: relative;
		overflow: hidden;
		padding: 26px 26px 28px;
	}
	.vimg::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 20%, transparent 70%, rgba(0, 0, 0, 0.55) 100%);
	}
	.vpic {
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		object-fit: contain;
		border-radius: 4px;
		box-shadow:
			0 1px 0 rgba(255, 255, 255, 0.16) inset,
			0 22px 38px -14px rgba(0, 0, 0, 0.8),
			0 3px 8px rgba(0, 0, 0, 0.55);
		transition: transform 0.25s ease;
	}
	.vcard:hover .vpic {
		transform: translateY(-3px);
	}
	.vmono {
		font-family: 'EB Garamond', serif;
		font-size: 54px;
		color: var(--orange);
		opacity: 0.85;
	}
	.vtag {
		position: absolute;
		top: 12px;
		left: 12px;
		background: var(--orange);
		color: #1a1206;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.06em;
		padding: 4px 9px;
		border-radius: 999px;
		text-transform: uppercase;
	}
	.vbody {
		padding: 18px;
	}
	.vbody h3 {
		font-size: 17px;
		font-weight: 700;
		margin: 0 0 8px;
	}
	.vbody p {
		color: var(--muted);
		font-size: 13px;
		line-height: 1.5;
		margin: 0 0 14px;
	}
	.vrow,
	.crow {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.vprice,
	.cprice {
		font-weight: 800;
		color: var(--paper);
		font-size: 17px;
	}
	.mini {
		background: transparent;
		border: 1px solid var(--line);
		color: var(--paper);
		border-radius: 999px;
		padding: 7px 16px;
		font-weight: 700;
		font-size: 12px;
		cursor: pointer;
	}
	.mini:hover {
		border-color: var(--orange);
		color: var(--orange2);
	}

	/* shop */
	.shop {
		padding: 64px 40px;
		max-width: 1240px;
		margin: 0 auto;
	}
	.shead {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
		margin-bottom: 30px;
		flex-wrap: wrap;
	}
	.filters {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.filters button {
		background: transparent;
		border: 1px solid var(--line);
		color: var(--paper);
		border-radius: 999px;
		padding: 8px 16px;
		font-weight: 600;
		font-size: 13px;
		cursor: pointer;
	}
	.filters button.on {
		background: var(--orange);
		color: #1a1206;
		border-color: var(--orange);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 18px;
	}
	.card {
		background: var(--ink2);
		border: 1px solid var(--line);
		border-radius: 12px;
		overflow: hidden;
		transition: transform 0.18s ease, border-color 0.18s ease;
	}
	.card:hover {
		transform: translateY(-4px);
		border-color: var(--orange);
	}
	.cimg {
		height: 230px;
		background:
			radial-gradient(130% 100% at 50% -10%, rgba(247, 147, 26, 0.1), transparent 55%),
			linear-gradient(165deg, #17171a 0%, #0a0a0c 100%);
		display: grid;
		place-items: center;
		position: relative;
		font-size: 34px;
		overflow: hidden;
		padding: 22px 22px 24px;
	}
	/* seat the cover: dark floor + top edge so cards don't read as a bright wall */
	.cimg::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.28) 0%, transparent 22%, transparent 72%, rgba(0, 0, 0, 0.5) 100%);
	}
	.cpic {
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		object-fit: contain;
		border-radius: 3px;
		box-shadow:
			0 1px 0 rgba(255, 255, 255, 0.14) inset,
			0 18px 30px -12px rgba(0, 0, 0, 0.75),
			0 2px 6px rgba(0, 0, 0, 0.5);
		transition: transform 0.3s ease;
	}
	.card:hover .cpic {
		transform: translateY(-3px) scale(1.03);
	}
	.ctag {
		position: absolute;
		top: 10px;
		left: 10px;
		background: rgba(247, 147, 26, 0.15);
		color: var(--orange2);
		border: 1px solid rgba(247, 147, 26, 0.4);
		font-size: 10px;
		font-weight: 700;
		padding: 3px 8px;
		border-radius: 999px;
	}
	.cbody {
		padding: 16px;
	}
	.ccat {
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--orange);
		font-weight: 700;
		margin-bottom: 7px;
	}
	.cbody h3 {
		font-size: 15px;
		font-weight: 700;
		margin: 0 0 14px;
		line-height: 1.25;
		min-height: 38px;
	}

	/* band */
	.band {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
		max-width: 1240px;
		margin: 0 auto;
		padding: 20px 40px 72px;
	}
	.bitem {
		background: var(--ink2);
		border: 1px solid var(--line);
		border-radius: 14px;
		padding: 28px;
	}
	.bitem span {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 10px;
		background: rgba(247, 147, 26, 0.12);
		color: var(--orange);
		font-size: 22px;
		margin-bottom: 16px;
	}
	.bitem h4 {
		font-size: 17px;
		margin: 0 0 8px;
		font-weight: 700;
	}
	.bitem p {
		color: var(--muted);
		font-size: 14px;
		line-height: 1.55;
		margin: 0;
	}

	.foot {
		border-top: 1px solid var(--line);
		padding: 30px 40px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px;
	}
	.foot-logo {
		height: 22px;
		width: auto;
		display: block;
		opacity: 0.9;
	}
	.fmono {
		font-size: 12px;
		color: var(--muted);
	}

	@media (max-width: 900px) {
		.nav {
			padding: 12px 16px;
			gap: 12px;
		}
		.nav.solid {
			padding: 10px 16px;
		}
		.search {
			display: none;
		}
		.links {
			display: none;
		}
		.hero {
			min-height: 560px;
		}
		.hero-inner {
			flex-direction: column;
			align-items: flex-start;
			padding: 0 18px 90px;
		}
		.hero h1 {
			font-size: 46px;
		}
		.features {
			display: none;
		}
		.scrollcue {
			display: none;
		}
		.dots {
			left: 18px;
		}
		.vhead {
			flex-direction: column;
			align-items: flex-start;
		}
		.vgrid {
			grid-template-columns: 1fr;
		}
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
		.band {
			grid-template-columns: 1fr;
		}
		.vault,
		.shop {
			padding: 44px 18px;
		}
	}
</style>
