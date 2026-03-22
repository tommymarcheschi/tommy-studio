<script lang="ts">
	import '../app.css';
	import { theme } from '$lib/theme';
	import { siteConfig } from '$lib/data/site';
	import { page } from '$app/stores';
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	let { children } = $props();
	let showLoader = $state(false);
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
			<a href="/" class="hover:opacity-70 transition-opacity no-underline">
				<img src="/tommy-logo.svg" alt="tommy" class="h-4 logo-img" />
			</a>
			<div class="flex items-center gap-6 text-sm">
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
		</nav>
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
		<div class="px-6 lg:px-10 py-12">
			<div class="flex flex-col md:flex-row justify-between gap-8 text-sm text-neutral-400 dark:text-neutral-500">
				<div class="flex flex-col gap-3">
					<p class="text-neutral-600 dark:text-neutral-300">Tommy Marcheschi (b. {siteConfig.birthYear})</p>
					<p class="max-w-sm">{siteConfig.bio}</p>
				</div>
				<div class="flex flex-col gap-3">
					<p class="text-neutral-600 dark:text-neutral-300 text-xs uppercase tracking-wider">Projects</p>
					{#each siteConfig.projects as project}
						<a href={project.url} target="_blank" rel="noopener" class="hover:text-accent transition-colors no-underline">{project.name}</a>
					{/each}
				</div>
				<div class="flex flex-col gap-3">
					<p class="text-neutral-600 dark:text-neutral-300 text-xs uppercase tracking-wider">Connect</p>
					<a href="/contact" class="hover:text-accent transition-colors no-underline">Contact</a>
					<a href={siteConfig.social[0].url} target="_blank" rel="noopener" class="hover:text-accent transition-colors no-underline">{siteConfig.social[0].handle}</a>
					<p class="text-xs font-mono break-all opacity-50 max-w-[240px] mt-2">{siteConfig.btcAddress}</p>
				</div>
			</div>
			<p class="text-xs text-neutral-400 dark:text-neutral-600 mt-10">&copy; {new Date().getFullYear()} Tommy Marcheschi</p>
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
