<script lang="ts">
	import { siteConfig } from '$lib/data/site';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>About | Tommy Marcheschi</title>
	<meta name="description" content="Tommy Marcheschi (b. 1992) — Multi-disciplinary artist, collector, and curator based in Nashville, TN." />
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
			<h1 class="text-2xl lg:text-3xl font-semibold mb-10">About</h1>

			<div class="space-y-6 leading-relaxed">
				<p>
					Tommy Marcheschi (b. 1992) is a multi-disciplinary artist, collector, and curator based in Nashville, Tennessee. His work spans oil, acrylic, aerosol, and mixed media on canvas and wood — rooted in the tradition of painting but driven by the politics and culture of Bitcoin.
				</p>

				<p>
					Originally from Glen Ellyn, Illinois, Tommy received his BFA in Graphic Design from the University of South Carolina in 2015 before relocating to Nashville. After learning more about Bitcoin in 2016-17 and joining BTC Media as a graphic designer, he eventually became the company's artist-in-residence. His artistic practice lives at the intersection of fine art and graphic design — he calls it "pre-emptive propaganda." The idea is simple: the most blatant propaganda comes from governments, and the best defense is to meme the dystopia before the state can normalize it. By channeling the visual language of European wartime posters, Tommy exposes the absurdity of state overreach before it arrives, giving his audience a framework to recognize it when it does.
				</p>

				<p>
					His breakout work, <em>Bitcoin War Bonds</em>, debuted as a painting at Bitcoin 2022 in Miami alongside 1,000,000 WARBONDS.BITCOIN tokens on CounterParty. When Ordinals launched shortly after, Tommy inscribed the work as a 4MB image in Bitcoin block 777945 in early 2023 — cementing it across both physical and on-chain mediums. The piece marked the beginning of an ongoing body of work exploring sovereignty, censorship, and resistance through the lens of Bitcoin culture. Tommy works across CounterParty, Ordinals, and Runes, treating each as its own object with its own provenance.
				</p>

				<p>
					Inspired by <a href="https://scarce.city" target="_blank" rel="noopener" class="text-accent hover:underline">Scarce City</a>'s pioneering Bitcoin art auctions, Tommy and developer Erik Jacobi built <a href="https://satoshihouse.auction" target="_blank" rel="noopener" class="text-accent hover:underline">Satoshi House Auctions</a> — a Bitcoin-native auction house for fine art and artifacts. That platform, combined with a growing collection of over 200 works co-built with David Bailey (CEO of Nakamoto Inc), became the foundation for <a href="https://museum.b.tc" target="_blank" rel="noopener" class="text-accent hover:underline">BMAG (Bitcoin Museum & Art Gallery)</a>. Co-founded with Bailey, curator Dennis Koch, and Jacobi, BMAG launched in Nashville on Genesis Day, January 3, 2026 — a permanent home for Bitcoin's cultural history.
				</p>
			</div>

			<!-- Quick info -->
			<div class="mt-16 space-y-6 text-sm text-neutral-500 dark:text-neutral-400">
				<div>
					<p class="text-neutral-600 dark:text-neutral-300 text-xs uppercase tracking-wider mb-3">Selected Projects</p>
					<div class="space-y-1">
						{#each siteConfig.projects as project}
							<p><a href={project.url} target="_blank" rel="noopener" class="text-accent hover:underline">{project.name}</a></p>
						{/each}
					</div>
				</div>

				<div>
					<p class="text-neutral-600 dark:text-neutral-300 text-xs uppercase tracking-wider mb-3">Education</p>
					<p>BFA Graphic Design, University of South Carolina, 2015</p>
				</div>
			</div>
		</div>
	</div>
</div>
