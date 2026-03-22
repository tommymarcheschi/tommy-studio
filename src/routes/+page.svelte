<script lang="ts">
	import { siteConfig } from '$lib/data/site';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { viewMode, showNavToggle } from '$lib/viewMode';

	let { data } = $props();
	const artworks = data.artworks;
	const settings = data.settings;

	let gridItems: HTMLElement[] = $state([]);
	let toggleEl: HTMLElement;

	onMount(() => {
		// Scroll reveal observer
		requestAnimationFrame(() => {
			const revealObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							entry.target.classList.add('is-visible');
							revealObserver.unobserve(entry.target);
						}
					});
				},
				{ threshold: 0.05, rootMargin: '50px 0px 0px 0px' }
			);

			gridItems.forEach((el) => {
				if (el) revealObserver.observe(el);
			});
		});

		// Toggle visibility observer — when inline toggle scrolls out of view, show it in nav
		const toggleObserver = new IntersectionObserver(
			([entry]) => {
				showNavToggle.set(!entry.isIntersecting);
			},
			{ threshold: 0 }
		);

		if (toggleEl) toggleObserver.observe(toggleEl);

		return () => {
			toggleObserver.disconnect();
			showNavToggle.set(false);
		};
	});

	// When view mode changes, make new items visible immediately
	$effect(() => {
		$viewMode;
		if (!browser) return;
		requestAnimationFrame(() => {
			gridItems.forEach((el) => {
				if (el && !el.classList.contains('is-visible')) {
					el.classList.add('is-visible');
				}
			});
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

	<!-- CTA: Auction Live or Visit BMAG fallback -->
	{#if settings.auction_live && settings.auction_url}
		<a href={settings.auction_url} target="_blank" rel="noopener" class="block mb-16 lg:mb-20 group no-underline">
			<div class="py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors inline-block">
				<div class="flex items-center gap-3 mb-1">
					<span class="relative flex h-2.5 w-2.5">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
					</span>
					<span class="text-sm font-semibold uppercase tracking-wider">Auction Live</span>
				</div>
				<p class="font-medium">{settings.auction_title}</p>
				<span class="inline-block mt-1 text-sm text-accent group-hover:underline">Bid Now &rarr;</span>
			</div>
		</a>
	{:else}
		<a href="https://museum.b.tc" target="_blank" rel="noopener" class="block mb-16 lg:mb-20 group no-underline">
			<div class="py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors inline-flex items-center gap-4">
				<img src="/bmag-camel.svg" alt="BMAG" class="h-8 opacity-40 group-hover:opacity-70 transition-opacity logo-img" />
				<div>
					<p class="text-sm font-semibold uppercase tracking-wider mb-1">Visit</p>
					<p class="font-medium">BMAG — Bitcoin Museum & Art Gallery</p>
					<span class="inline-block mt-1 text-sm text-accent group-hover:underline">museum.b.tc &rarr;</span>
				</div>
			</div>
		</a>
	{/if}

	<!-- View Toggle (inline) -->
	<div class="flex items-center gap-1 mb-10" bind:this={toggleEl}>
		<button onclick={() => viewMode.set('grid')} class="p-2 rounded transition-colors {$viewMode === 'grid' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400'}" aria-label="Grid view">
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="0.5" y="0.5" width="7" height="7" rx="0.5" stroke="currentColor"/><rect x="10.5" y="0.5" width="7" height="7" rx="0.5" stroke="currentColor"/><rect x="0.5" y="10.5" width="7" height="7" rx="0.5" stroke="currentColor"/><rect x="10.5" y="10.5" width="7" height="7" rx="0.5" stroke="currentColor"/></svg>
		</button>
		<button onclick={() => viewMode.set('list')} class="p-2 rounded transition-colors {$viewMode === 'list' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400'}" aria-label="List view">
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="0.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor"/><line x1="8" y1="2.5" x2="17.5" y2="2.5" stroke="currentColor"/><line x1="8" y1="5.5" x2="14" y2="5.5" stroke="currentColor"/><rect x="0.5" y="11.5" width="5" height="5" rx="0.5" stroke="currentColor"/><line x1="8" y1="12.5" x2="17.5" y2="12.5" stroke="currentColor"/><line x1="8" y1="15.5" x2="14" y2="15.5" stroke="currentColor"/></svg>
		</button>
		<button onclick={() => viewMode.set('single')} class="p-2 rounded transition-colors {$viewMode === 'single' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400'}" aria-label="Single view">
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="0.5" y="2.5" width="17" height="13" rx="0.5" stroke="currentColor"/></svg>
		</button>
		<button onclick={() => viewMode.set('masonry')} class="p-2 rounded transition-colors {$viewMode === 'masonry' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400'}" aria-label="Masonry view">
			<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="0.5" y="0.5" width="7" height="10" rx="0.5" stroke="currentColor"/><rect x="10.5" y="0.5" width="7" height="6" rx="0.5" stroke="currentColor"/><rect x="0.5" y="13.5" width="7" height="4" rx="0.5" stroke="currentColor"/><rect x="10.5" y="9.5" width="7" height="8" rx="0.5" stroke="currentColor"/></svg>
		</button>
	</div>

	<!-- Portfolio -->
	<section class="pb-20 lg:pb-28">
		<!-- Grid View -->
		{#if $viewMode === 'grid'}
			<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-14 lg:gap-x-12 lg:gap-y-20">
				{#each artworks as artwork, i}
					<a
						href="/artworks/{artwork.slug}"
						class="artwork-card block group no-underline"
						bind:this={gridItems[i]}
						style="transition-delay: {(i % 4) * 80}ms"
					>
						<div class="aspect-[3/4] overflow-hidden">
							<img src={artwork.image} alt={artwork.title} loading="lazy"
								class="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
							/>
						</div>
						<div class="mt-3">
							<h2 class="text-xs font-medium group-hover:text-accent transition-colors duration-300 leading-tight">{artwork.title}</h2>
							<p class="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">{artwork.medium}, {artwork.year}</p>
						</div>
					</a>
				{/each}
			</div>

		<!-- List View -->
		{:else if $viewMode === 'list'}
			<div class="space-y-8">
				{#each artworks as artwork, i}
					<a
						href="/artworks/{artwork.slug}"
						class="artwork-card flex gap-6 group no-underline items-start"
						bind:this={gridItems[i]}
						style="transition-delay: {i * 40}ms"
					>
						<div class="w-24 lg:w-32 shrink-0 overflow-hidden">
							<img src={artwork.image} alt={artwork.title} loading="lazy"
								class="w-full aspect-[3/4] object-cover transition-all duration-500 group-hover:opacity-80"
							/>
						</div>
						<div class="py-1">
							<h2 class="text-sm font-medium group-hover:text-accent transition-colors duration-300">{artwork.title}</h2>
							<p class="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{artwork.medium}, {artwork.year}</p>
							{#if artwork.dimensions}
								<p class="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">{artwork.dimensions}</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>

		<!-- Single View -->
		{:else if $viewMode === 'single'}
			<div class="space-y-20 lg:space-y-28 max-w-4xl mx-auto">
				{#each artworks as artwork, i}
					<a
						href="/artworks/{artwork.slug}"
						class="artwork-card block group no-underline"
						bind:this={gridItems[i]}
						style="transition-delay: {i * 60}ms"
					>
						<div class="overflow-hidden">
							<img src={artwork.image} alt={artwork.title} loading="lazy"
								class="w-full object-contain transition-all duration-500 group-hover:opacity-90"
							/>
						</div>
						<div class="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
							<h2 class="text-sm font-medium group-hover:text-accent transition-colors duration-300">{artwork.title}</h2>
							<p class="text-xs text-neutral-400 dark:text-neutral-500">{artwork.medium}, {artwork.year}</p>
						</div>
					</a>
				{/each}
			</div>

		<!-- Masonry View -->
		{:else if $viewMode === 'masonry'}
			<div class="columns-2 md:columns-3 xl:columns-4 gap-8 lg:gap-12">
				{#each artworks as artwork, i}
					<a
						href="/artworks/{artwork.slug}"
						class="artwork-card block group no-underline mb-8 lg:mb-12 break-inside-avoid"
						bind:this={gridItems[i]}
						style="transition-delay: {(i % 4) * 80}ms"
					>
						<div class="overflow-hidden">
							<img src={artwork.image} alt={artwork.title} loading="lazy"
								class="w-full object-cover transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-90"
							/>
						</div>
						<div class="mt-3">
							<h2 class="text-xs font-medium group-hover:text-accent transition-colors duration-300 leading-tight">{artwork.title}</h2>
							<p class="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">{artwork.medium}, {artwork.year}</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
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
