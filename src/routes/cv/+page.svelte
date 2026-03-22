<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>CV | Tommy Marcheschi</title>
	<meta name="description" content="Selected exhibitions, auctions, and press — Tommy Marcheschi" />
</svelte:head>

<div class="px-6 lg:px-10 py-12 lg:py-20">
	<div class="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
		<!-- Side nav -->
		<nav class="lg:w-32 lg:shrink-0 lg:sticky lg:top-24 lg:self-start">
			<div class="flex lg:flex-col gap-4 text-sm">
				<a href="/about" class="font-medium no-underline {$page.url.pathname === '/about' ? 'text-accent' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'} transition-colors">About</a>
				<a href="/cv" class="font-medium no-underline {$page.url.pathname === '/cv' ? 'text-accent' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'} transition-colors">CV</a>
				<a href="/contact" class="font-medium no-underline {$page.url.pathname === '/contact' ? 'text-accent' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'} transition-colors">Contact</a>
			</div>
		</nav>

		<!-- Content -->
		<div class="flex-1 max-w-xl">
			<h1 class="text-2xl lg:text-3xl font-semibold mb-12">CV</h1>

			<!-- Exhibitions -->
			<h2 class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-8">Selected Exhibitions & Auctions</h2>

			<div class="space-y-12 text-sm">
				<!-- 2025 -->
				<div>
					<p class="font-semibold mb-4">2025</p>
					<div class="space-y-4 text-neutral-600 dark:text-neutral-400">
						<div>
							<p><em><a href="https://b.tc/conference/2025" target="_blank" rel="noopener" class="text-accent hover:underline">Bitcoin 2025: The Art of Freedom</a></em>, Venetian Expo, Las Vegas</p>
							<p class="pl-4 mt-1">
								<a href="https://scarce.city/auctions/ross-ulbricht-portrait-tommy" target="_blank" rel="noopener" class="text-accent hover:underline">Ross Ulbricht Portrait</a>,
								<a href="https://scarce.city/auctions/compliance-violence" target="_blank" rel="noopener" class="text-accent hover:underline">COMPLIANCE=VIOLENCE</a>
							</p>
						</div>
					</div>
				</div>

				<!-- 2024 -->
				<div>
					<p class="font-semibold mb-4">2024</p>
					<div class="space-y-4 text-neutral-600 dark:text-neutral-400">
						<div>
							<p><em><a href="https://tabconf.com" target="_blank" rel="noopener" class="text-accent hover:underline">TABConf</a></em>, Atlanta — Live painting</p>
							<p class="pl-4 mt-1"><a href="https://satoshihouse.auction/auctions/only-the-hits" target="_blank" rel="noopener" class="text-accent hover:underline">ONLY THE HITS</a></p>
						</div>
						<div>
							<p><em><a href="https://b.tc/conference/2024" target="_blank" rel="noopener" class="text-accent hover:underline">Bitcoin 2024</a></em>, Nashville</p>
							<p class="pl-4 mt-1">NETWORKPEPE, WORLD&bull;LOVE&bull;BITCOIN&bull;PEACE, HARDCORECOCO</p>
						</div>
						<div>
							<p><a href="https://satoshihouse.auction/auctions/running" target="_blank" rel="noopener" class="text-accent hover:underline">RUNNING (Hal Finney)</a>, Bitcoin Museum, Nashville — 50% proceeds to ALS Foundation</p>
						</div>
					</div>
				</div>

				<!-- 2023 -->
				<div>
					<p class="font-semibold mb-4">2023</p>
					<div class="space-y-4 text-neutral-600 dark:text-neutral-400">
						<div>
							<p><em><a href="https://b.tc/conference/2023" target="_blank" rel="noopener" class="text-accent hover:underline">Bitcoin 2023: The Renaissance Continues</a></em>, Miami</p>
							<p class="pl-4 mt-1">
								<a href="https://scarce.city/auctions/gatekeepers" target="_blank" rel="noopener" class="text-accent hover:underline">GATEKEEPERS</a> (for Julian Assange),
								<a href="https://scarce.city/auctions/codex-alimentarius-bitcoin-war-bonds" target="_blank" rel="noopener" class="text-accent hover:underline">CODEX ALIMENTARIUS</a> (BWB #5)
							</p>
						</div>
						<div>
							<p><em>Cardsmiths Currency Series 2</em> — Featured artist, card #33</p>
						</div>
					</div>
				</div>

				<!-- 2022 -->
				<div>
					<p class="font-semibold mb-4">2022</p>
					<div class="space-y-4 text-neutral-600 dark:text-neutral-400">
						<div>
							<p><em><a href="https://b.tc/conference/2022" target="_blank" rel="noopener" class="text-accent hover:underline">Bitcoin 2022: Bitcoin Renaissance Gallery</a></em>, Miami Beach — Artist-in-Residence</p>
							<p class="pl-4 mt-1">BITCOIN WAR BONDS (debut), CUSP OF REVOLUTION, ROSSLIVESNOW, FORHODLONAUT, HODLOMONSTER, BITCOIN FROG, DEATHTOFIAT</p>
						</div>
						<div>
							<p><em>Fake Basel Miami</em> — <a href="https://scarce.city/auctions/cusp-of-revolution" target="_blank" rel="noopener" class="text-accent hover:underline">CUSP OF REVOLUTION</a></p>
						</div>
						<div>
							<p><em>Bitcoin Amsterdam Art Gallery</em> — <a href="https://scarce.city/auctions/bitcoin-war-bonds-print-2" target="_blank" rel="noopener" class="text-accent hover:underline">BITCOIN WAR BONDS print #02/10</a></p>
						</div>
						<div>
							<p><em>Bitcoin Magazine Art Gallery Opening</em>, Nashville — Curator + Artist</p>
							<p class="pl-4 mt-1">Free Ross Exhibit + original painting for <a href="https://freeross.org" target="_blank" rel="noopener" class="text-accent hover:underline">Ulbricht Freedom Trust</a></p>
						</div>
						<div>
							<p class="text-neutral-400 dark:text-neutral-500">Online auctions:</p>
							<p class="pl-4 mt-1">
								<a href="https://scarce.city/auctions/bitcoin-war-bonds-print-1" target="_blank" rel="noopener" class="text-accent hover:underline">BITCOIN WAR BONDS print #01/10</a>,
								<a href="https://scarce.city/auctions/hodlomonster" target="_blank" rel="noopener" class="text-accent hover:underline">HODLOMONSTER</a>
							</p>
						</div>
					</div>
				</div>

				<!-- 2021 -->
				<div>
					<p class="font-semibold mb-4">2021</p>
					<div class="space-y-4 text-neutral-600 dark:text-neutral-400">
						<div>
							<p><em><a href="https://b.tc/conference/2021" target="_blank" rel="noopener" class="text-accent hover:underline">Bitcoin 2021</a></em>, Miami</p>
							<p class="pl-4 mt-1"><a href="https://scarce.city/auctions/end-fiat-skatepark" target="_blank" rel="noopener" class="text-accent hover:underline">END FIAT Skatepark Deck</a> (signed by Tony Hawk, proceeds to The Skatepark Project)</p>
						</div>
						<div>
							<p class="text-neutral-400 dark:text-neutral-500">Online auctions:</p>
							<p class="pl-4 mt-1"><a href="https://scarce.city/products/untitled-for-all-hidden" target="_blank" rel="noopener" class="text-accent hover:underline">Untitled (FOR ALL)</a> — First solo auction, 0.13 BTC</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Press -->
			<div class="mt-20">
				<h2 class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-6">Selected Press</h2>
				<div class="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
					<p><a href="https://21ism.com/portfolio-item/tommy-marcheschi/" target="_blank" rel="noopener" class="text-accent hover:underline">21ism — Featured Artist Profile (Block 09)</a></p>
					<p><a href="https://bitcoinmagazine.com/culture/bitcoin-magazine-auctions-art-for-bitcoin" target="_blank" rel="noopener" class="text-accent hover:underline">Bitcoin Magazine / Nasdaq — Auction coverage, 2021</a></p>
					<p><a href="https://bitcoinmagazine.com/press-releases/bitcoin-magazine-art-gallery-opening" target="_blank" rel="noopener" class="text-accent hover:underline">Bitcoin Magazine / Nasdaq — Nashville Gallery Opening, 2022</a></p>
				</div>
			</div>
		</div>
	</div>
</div>
