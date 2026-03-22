<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/theme';
	import { siteConfig } from '$lib/data/site';
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { viewMode, showNavToggle } from '$lib/viewMode';

	let { children } = $props();
	let isHome = $derived($page.url.pathname === '/');
	let mobileMenuOpen = $state(false);
	let showLoader = $state(false);

	// Close mobile menu on navigation
	$effect(() => {
		$page.url.pathname;
		mobileMenuOpen = false;
	});
	let loaderTimeout: ReturnType<typeof setTimeout>;

	// Show loader on any navigation (even fast ones get a brief flash)
	$effect(() => {
		if ($navigating) {
			showLoader = true;
			clearTimeout(loaderTimeout);
		}
	});

	// Keep loader visible for minimum 400ms after navigation completes
	$effect(() => {
		$page.url.pathname;
		if (showLoader) {
			loaderTimeout = setTimeout(() => {
				showLoader = false;
			}, 400);
		}
	});
</script>

<svelte:head>
	<title>{$page.url.pathname === '/' ? 'Tommy Marcheschi' : 'Tommy Marcheschi'}</title>
</svelte:head>

<!-- Loading bar -->
{#if showLoader}
	<div class="fixed top-0 left-0 right-0 z-[100] h-[2px]" transition:fade={{ duration: 200 }}>
		<div class="loading-bar h-full bg-accent"></div>
	</div>
{/if}

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="sticky top-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm">
		<nav class="px-6 lg:px-10 py-5 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<a href="/" class="hover:opacity-70 transition-opacity no-underline">
					<img src="/tommy-logo.svg" alt="tommy" class="h-4 logo-img" />
				</a>

				<!-- View toggle in nav (desktop only, appears when scrolled past inline toggle) -->
				{#if isHome && $showNavToggle}
					<div class="hidden md:flex items-center gap-0.5 ml-2" transition:fade={{ duration: 200 }}>
						<button onclick={() => viewMode.set('grid')} class="p-1.5 transition-colors {$viewMode === 'grid' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'}" aria-label="Grid view">
							<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="0.5" y="0.5" width="7" height="7" rx="0.5" stroke="currentColor"/><rect x="10.5" y="0.5" width="7" height="7" rx="0.5" stroke="currentColor"/><rect x="0.5" y="10.5" width="7" height="7" rx="0.5" stroke="currentColor"/><rect x="10.5" y="10.5" width="7" height="7" rx="0.5" stroke="currentColor"/></svg>
						</button>
						<button onclick={() => viewMode.set('list')} class="p-1.5 transition-colors {$viewMode === 'list' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'}" aria-label="List view">
							<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="0.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor"/><line x1="8" y1="2.5" x2="17.5" y2="2.5" stroke="currentColor"/><line x1="8" y1="5.5" x2="14" y2="5.5" stroke="currentColor"/><rect x="0.5" y="11.5" width="5" height="5" rx="0.5" stroke="currentColor"/><line x1="8" y1="12.5" x2="17.5" y2="12.5" stroke="currentColor"/><line x1="8" y1="15.5" x2="14" y2="15.5" stroke="currentColor"/></svg>
						</button>
						<button onclick={() => viewMode.set('single')} class="p-1.5 transition-colors {$viewMode === 'single' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'}" aria-label="Single view">
							<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="0.5" y="2.5" width="17" height="13" rx="0.5" stroke="currentColor"/></svg>
						</button>
						<button onclick={() => viewMode.set('masonry')} class="p-1.5 transition-colors {$viewMode === 'masonry' ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'}" aria-label="Masonry view">
							<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="0.5" y="0.5" width="7" height="10" rx="0.5" stroke="currentColor"/><rect x="10.5" y="0.5" width="7" height="6" rx="0.5" stroke="currentColor"/><rect x="0.5" y="13.5" width="7" height="4" rx="0.5" stroke="currentColor"/><rect x="10.5" y="9.5" width="7" height="8" rx="0.5" stroke="currentColor"/></svg>
						</button>
					</div>
				{/if}
			</div>

			<!-- Desktop nav -->
			<div class="hidden md:flex items-center gap-6 text-sm">
				<a href="/" class="hover:text-accent transition-colors no-underline">Works</a>
				<a href="/about" class="hover:text-accent transition-colors no-underline">About</a>
				<a href="/contact" class="hover:text-accent transition-colors no-underline">Contact</a>
				<a href={siteConfig.social[0].url} target="_blank" rel="noopener" class="hover:text-accent transition-colors no-underline">Follow</a>
				<button
					onclick={() => theme.toggle()}
					class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
					aria-label="Toggle theme"
				>
					{#if $theme === 'dark'}
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
					{/if}
				</button>
			</div>

			<!-- Mobile hamburger -->
			<button
				class="md:hidden w-8 h-8 flex items-center justify-center"
				onclick={() => mobileMenuOpen = !mobileMenuOpen}
				aria-label="Toggle menu"
			>
				{#if mobileMenuOpen}
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4L14 14M14 4L4 14" stroke="currentColor" stroke-width="1.5"/></svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><line x1="1" y1="5" x2="17" y2="5" stroke="currentColor" stroke-width="1.5"/><line x1="1" y1="13" x2="17" y2="13" stroke="currentColor" stroke-width="1.5"/></svg>
				{/if}
			</button>
		</nav>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="md:hidden px-6 pb-8 pt-2 flex flex-col gap-5 text-lg" transition:fade={{ duration: 150 }}>
				<a href="/" class="hover:text-accent transition-colors no-underline">Works</a>
				<a href="/about" class="hover:text-accent transition-colors no-underline">About</a>
				<a href="/cv" class="hover:text-accent transition-colors no-underline">CV</a>
				<a href="/contact" class="hover:text-accent transition-colors no-underline">Contact</a>
				<a href={siteConfig.social[0].url} target="_blank" rel="noopener" class="hover:text-accent transition-colors no-underline">Follow</a>
				<button
					onclick={() => theme.toggle()}
					class="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 hover:text-accent transition-colors text-sm mt-2"
				>
					{#if $theme === 'dark'}
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
						Light mode
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
						Dark mode
					{/if}
				</button>
			</div>
		{/if}
	</header>

	<!-- Main with page transition -->
	<main class="flex-1">
		{#key $page.url.pathname}
			<div in:fade={{ duration: 200, delay: 100 }} out:fade={{ duration: 100 }}>
				{@render children()}
			</div>
		{/key}
	</main>

	<!-- Footer -->
	<footer class="mt-auto">
		<div class="px-6 lg:px-10 py-16 lg:py-20">
			<!-- Signature -->
			<div class="mb-14">
				<img src="/tommy-signature-new.svg" alt="Tommy Marcheschi signature" class="h-12 logo-img opacity-30" />
			</div>

			<div class="flex flex-col gap-2 text-sm text-neutral-400 dark:text-neutral-500">
				<a href="/" class="hover:text-accent transition-colors no-underline">Works</a>
				<a href="/about" class="hover:text-accent transition-colors no-underline">About</a>
				<a href="/cv" class="hover:text-accent transition-colors no-underline">CV</a>
				<a href="/contact" class="hover:text-accent transition-colors no-underline">Contact</a>
				<a href={siteConfig.social[0].url} target="_blank" rel="noopener" class="hover:text-accent transition-colors no-underline">{siteConfig.social[0].handle}</a>
			</div>

			<p class="text-xs text-neutral-300 dark:text-neutral-700 mt-14">&copy; {new Date().getFullYear()} Tommy Marcheschi. All rights reserved.</p>
		</div>
	</footer>
</div>

<style>
	@keyframes loading {
		0% { width: 0%; margin-left: 0; }
		50% { width: 70%; margin-left: 0; }
		100% { width: 100%; margin-left: 0; }
	}

	.loading-bar {
		animation: loading 1.5s ease-in-out infinite;
	}
</style>
