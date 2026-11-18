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
	}

	const HERO = {
		kicker: 'Est. 2012 · The original Bitcoin publication',
		headline: 'The Quantum Issue',
		sub: "Don't panic. Issue #42 confronts the threat that could break Bitcoin at the root — featuring Jameson Lopp, Ethan Heilman, Jonas Nick & Max Keiser.",
		price: 'From $21.00',
		cta: 'Read Issue #42'
	};

	const collectors: Product[] = [
		{ title: 'Bitcoin Magazine Issue 1', price: '$2,100', cat: 'Issues', tag: 'May 2012 · Historic', blurb: 'The first issue ever printed. A genuine artifact of Bitcoin history.' },
		{ title: '10th Anniversary Edition', price: '$249.99', cat: 'Issues', tag: 'Collector’s Edition' },
		{ title: 'The El Salvador Issue #24', price: '$79.99', cat: 'Issues', tag: 'Historic' },
		{ title: 'The Magician (2025) Print', price: '$256', cat: 'Prints', tag: '#/256 · Limited' },
		{ title: 'FAKEGENESIS (2022) Print', price: '$256', cat: 'Prints', tag: '#/256 · Limited' },
		{ title: 'Bitcoin War Bonds (2022) Print', price: '$256', cat: 'Prints', tag: '#/256 · Limited' }
	];

	const catalog: Product[] = [
		{ title: 'Annual Subscription', price: '$79.00', cat: 'Issues', tag: 'Print + digital' },
		{ title: 'Collector’s Edition Subscription', price: '$155.00', cat: 'Issues', tag: 'Read + sealed copy' },
		{ title: 'The Quantum Issue #42', price: 'From $21.00', cat: 'Issues', tag: 'Current' },
		{ title: 'The Core Issue #40', price: 'From $29.00', cat: 'Issues' },
		{ title: 'The 2036 Issue #41', price: 'From $29.00', cat: 'Issues' },
		{ title: 'The Censorship Resistant Issue #26', price: '$79.99', cat: 'Issues', tag: 'Historic' },
		{ title: 'The Genesis Book', price: 'From $6.99', cat: 'Books' },
		{ title: 'The Genesis Book — 3rd Anniversary Package', price: '$221.00', cat: 'Books', tag: 'Only 333' },
		{ title: 'The Satoshi Papers', price: 'From $6.99', cat: 'Books' },
		{ title: 'Bitcoin Is Venice', price: 'From $6.99', cat: 'Books' },
		{ title: 'Cryptosovereignty', price: 'From $6.99', cat: 'Books' },
		{ title: 'The Philosophy of Bitcoin', price: '$17.99', cat: 'Books' },
		{ title: 'Fiat Ruins Everything', price: 'From $6.99', cat: 'Books' },
		{ title: 'The Bitcoin-Dollar', price: 'From $6.99', cat: 'Books' },
		{ title: 'Blockstream Jade Plus', price: 'From $149.00', cat: 'Hardware', tag: 'Hardware wallet' },
		{ title: 'Blockstream Jade', price: '$67.00', cat: 'Hardware', tag: 'Hardware wallet' },
		{ title: 'Fiat Land by Marcus Connor', price: '$121.00', cat: 'Prints', tag: 'Art print' },
		{ title: 'Bicycle® Bitcoin Playing Cards', price: '$40.00', cat: 'Collectibles' },
		{ title: 'Sticker Pack', price: '$21.00', cat: 'Collectibles' },
		{ title: 'WORLD·LOVE·BITCOIN·PEACE Print', price: '$256', cat: 'Prints', tag: '#/69 · Limited' }
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

<div class="bm">
	<!-- demo ribbon -->
	<div class="ribbon">
		CONCEPT DEMO · bitcoinmagazine.com store on the shared BMAG backend · not live checkout
	</div>

	<!-- nav -->
	<header class="nav">
		<div class="brand">
			<span class="logo">₿</span>
			<div>
				<div class="bname">BITCOIN MAGAZINE</div>
				<div class="btag">STORE</div>
			</div>
		</div>
		<nav class="links">
			<a href="#issues">Issues</a>
			<a href="#books">Books</a>
			<a href="#prints">Prints &amp; Art</a>
			<a href="#hardware">Hardware</a>
			<a href="#collect">Collector’s Vault</a>
		</nav>
		<div class="navright">
			<span class="pay">Pay with ₿ · ⚡ · Card</span>
			<button class="bag" onclick={add}>Bag · {bag}</button>
		</div>
	</header>

	<!-- hero -->
	<section class="hero">
		<div class="hero-copy">
			<div class="kicker">{HERO.kicker}</div>
			<h1>{HERO.headline}</h1>
			<p>{HERO.sub}</p>
			<div class="hero-cta">
				<button class="primary" onclick={add}>{HERO.cta}</button>
				<span class="hprice">{HERO.price}</span>
			</div>
			<div class="trust">
				<span>⚡ Lightning &amp; on-chain</span><span>◆ Stripe cards</span><span>✓ We own your order data</span>
			</div>
		</div>
		<div class="hero-art">
			<div class="mag">
				<div class="mag-top">BITCOIN MAGAZINE</div>
				<div class="mag-no">№42</div>
				<div class="mag-title">THE<br />QUANTUM<br />ISSUE</div>
				<div class="mag-foot">DON’T PANIC</div>
			</div>
		</div>
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
						<span class="vmono">{p.title.includes('Issue 1') ? '№1' : p.title.includes('Print') ? '◈' : '◆'}</span>
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
						<span class="cmono"
							>{p.cat === 'Issues' ? '📰' : p.cat === 'Books' ? '▦' : p.cat === 'Prints' ? '◈' : p.cat === 'Hardware' ? '▣' : '✦'}</span
						>
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
		<div>BITCOIN MAGAZINE — STORE</div>
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

	/* nav */
	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		padding: 18px 40px;
		border-bottom: 1px solid var(--line);
		position: sticky;
		top: 0;
		background: rgba(11, 11, 12, 0.92);
		backdrop-filter: blur(10px);
		z-index: 20;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.logo {
		width: 38px;
		height: 38px;
		border-radius: 8px;
		background: var(--orange);
		color: #1a1206;
		display: grid;
		place-items: center;
		font-weight: 800;
		font-size: 22px;
	}
	.bname {
		font-weight: 800;
		letter-spacing: 0.14em;
		font-size: 15px;
	}
	.btag {
		font-size: 10px;
		letter-spacing: 0.4em;
		color: var(--orange);
		font-weight: 700;
	}
	.links {
		display: flex;
		gap: 26px;
		font-size: 13px;
		font-weight: 600;
	}
	.links a {
		color: var(--paper);
		text-decoration: none;
		opacity: 0.82;
	}
	.links a:hover {
		opacity: 1;
		color: var(--orange2);
	}
	.navright {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.pay {
		font-size: 11px;
		color: var(--muted);
		font-weight: 600;
		letter-spacing: 0.03em;
	}
	.bag {
		background: transparent;
		border: 1px solid var(--orange);
		color: var(--orange2);
		border-radius: 999px;
		padding: 8px 16px;
		font-weight: 700;
		font-size: 13px;
		cursor: pointer;
	}
	.bag:hover {
		background: var(--orange);
		color: #1a1206;
	}

	/* hero */
	.hero {
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		gap: 40px;
		align-items: center;
		padding: 76px 40px 64px;
		max-width: 1240px;
		margin: 0 auto;
	}
	.kicker {
		color: var(--orange);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		margin-bottom: 18px;
	}
	.hero h1 {
		font-family: 'EB Garamond', Georgia, serif;
		font-size: 68px;
		line-height: 1.02;
		font-weight: 600;
		margin: 0 0 20px;
		letter-spacing: -0.01em;
	}
	.hero p {
		color: #cfc8ba;
		font-size: 17px;
		line-height: 1.6;
		max-width: 460px;
		margin: 0 0 28px;
	}
	.hero-cta {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 26px;
	}
	.primary {
		background: var(--orange);
		color: #1a1206;
		border: none;
		border-radius: 999px;
		padding: 15px 32px;
		font-weight: 800;
		font-size: 15px;
		cursor: pointer;
	}
	.primary:hover {
		background: var(--orange2);
	}
	.hprice {
		font-weight: 700;
		color: var(--paper);
	}
	.trust {
		display: flex;
		gap: 18px;
		flex-wrap: wrap;
		font-size: 12px;
		color: var(--muted);
		font-weight: 600;
	}
	.hero-art {
		display: grid;
		place-items: center;
	}
	.mag {
		width: 300px;
		height: 400px;
		background: linear-gradient(160deg, #1b1b1f 0%, #0d0d0f 100%);
		border: 1px solid var(--line);
		border-radius: 6px;
		box-shadow: 0 40px 80px -30px rgba(247, 147, 26, 0.35), 0 10px 30px rgba(0, 0, 0, 0.6);
		padding: 26px 24px;
		display: flex;
		flex-direction: column;
		transform: rotate(-4deg);
		position: relative;
	}
	.mag-top {
		font-size: 11px;
		letter-spacing: 0.2em;
		font-weight: 800;
		color: var(--orange);
	}
	.mag-no {
		margin-top: 6px;
		font-size: 13px;
		color: var(--muted);
		font-weight: 700;
	}
	.mag-title {
		font-family: 'EB Garamond', serif;
		font-size: 46px;
		line-height: 0.98;
		font-weight: 700;
		margin-top: auto;
		letter-spacing: 0.01em;
	}
	.mag-foot {
		margin-top: 16px;
		font-size: 12px;
		letter-spacing: 0.3em;
		color: var(--orange2);
		font-weight: 700;
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
		height: 180px;
		background:
			radial-gradient(120% 120% at 50% 0%, rgba(247, 147, 26, 0.16), transparent 60%),
			linear-gradient(160deg, #1b1b1f, #0c0c0e);
		display: grid;
		place-items: center;
		position: relative;
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
		height: 140px;
		background: linear-gradient(160deg, #191919, #0c0c0e);
		display: grid;
		place-items: center;
		position: relative;
		font-size: 34px;
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
	.foot > div:first-child {
		font-weight: 800;
		letter-spacing: 0.14em;
		font-size: 14px;
	}
	.fmono {
		font-size: 12px;
		color: var(--muted);
	}

	@media (max-width: 900px) {
		.nav {
			padding: 14px 18px;
			flex-wrap: wrap;
		}
		.links {
			display: none;
		}
		.hero {
			grid-template-columns: 1fr;
			padding: 48px 18px;
			text-align: center;
		}
		.hero h1 {
			font-size: 46px;
		}
		.hero-cta,
		.trust {
			justify-content: center;
		}
		.hero-art {
			margin-top: 20px;
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
