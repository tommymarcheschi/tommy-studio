<script lang="ts">
	import { siteConfig, artworks } from '$lib/data/site';
	import { onMount } from 'svelte';

	let gridItems: HTMLElement[] = $state([]);

	onMount(() => {
		requestAnimationFrame(() => {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							entry.target.classList.add('is-visible');
							observer.unobserve(entry.target);
						}
					});
				},
				{ threshold: 0.05, rootMargin: '50px 0px 0px 0px' }
			);

			gridItems.forEach((el) => {
				if (el) observer.observe(el);
			});

			return () => observer.disconnect();
		});
	});
</script>

<svelte:head>
	<title>Tommy Marcheschi | Gallery</title>
	<meta name="description" content="Art of Tommy Marcheschi" />
</svelte:head>

<div class="px-6 lg:px-10">
	<!-- Intro -->
	<section class="pt-12 pb-16 lg:pt-16 lg:pb-20 max-w-xl">
		<p class="text-sm text-neutral-400 dark:text-neutral-500 mb-3">Tommy Marcheschi (b. {siteConfig.birthYear})</p>
		<p class="text-lg lg:text-xl leading-relaxed">{siteConfig.bio}</p>
	</section>

	<!-- Auction Live CTA -->
	{#if siteConfig.auctionLive}
		<a href={siteConfig.auctionLive.url} target="_blank" rel="noopener" class="block mb-16 lg:mb-20 group no-underline">
			<div class="py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors inline-block">
				<div class="flex items-center gap-3 mb-1">
					<span class="relative flex h-2.5 w-2.5">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
					</span>
					<span class="text-sm font-semibold uppercase tracking-wider">Auction Live</span>
				</div>
				<p class="font-medium">{siteConfig.auctionLive.title}</p>
				<span class="inline-block mt-1 text-sm text-accent group-hover:underline">Bid Now &rarr;</span>
			</div>
		</a>
	{/if}

	<!-- Portfolio Grid -->
	<section class="pb-20 lg:pb-28">
		<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14 lg:gap-x-12 lg:gap-y-20">
			{#each artworks as artwork, i}
				<a
					href="/artworks/{artwork.slug}"
					class="artwork-card block group no-underline"
					bind:this={gridItems[i]}
					style="transition-delay: {(i % 4) * 80}ms"
				>
					<div class="aspect-[3/4] overflow-hidden">
						<img
							src={artwork.image}
							alt={artwork.title}
							loading="lazy"
							class="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
						/>
					</div>
					<div class="mt-3">
						<h2 class="text-xs font-medium group-hover:text-accent transition-colors duration-300 leading-tight">{artwork.title}</h2>
						<p class="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 transition-colors duration-300 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
							{artwork.medium}, {artwork.year}
						</p>
					</div>
				</a>
			{/each}
		</div>
	</section>
</div>

<style>
	:global(.artwork-card) {
		opacity: 0;
		transform: translateY(24px);
		transition: opacity 0.6s ease-out, transform 0.6s ease-out;
	}

	:global(.artwork-card.is-visible) {
		opacity: 1;
		transform: translateY(0);
	}
</style>
