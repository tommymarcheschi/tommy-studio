<script lang="ts">
	let { data } = $props();
	const { artwork } = data;

	// Build image array: main image (additional images not yet supported in static data)
	const images = [artwork.image];
	let currentIndex = $state(0);

	function next() {
		currentIndex = (currentIndex + 1) % images.length;
	}

	function prev() {
		currentIndex = (currentIndex - 1 + images.length) % images.length;
	}

	function goTo(index: number) {
		currentIndex = index;
	}

	// Fullscreen lightbox
	let lightboxOpen = $state(false);
	let zoomLevel = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isPanning = $state(false);
	let panStart = { x: 0, y: 0 };

	function openLightbox() {
		lightboxOpen = true;
		zoomLevel = 1;
		panX = 0;
		panY = 0;
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		lightboxOpen = false;
		zoomLevel = 1;
		panX = 0;
		panY = 0;
		document.body.style.overflow = '';
	}

	function toggleZoom(e: MouseEvent) {
		if (zoomLevel === 1) {
			zoomLevel = 2.5;
			// Zoom toward click position
			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = (e.clientY - rect.top) / rect.height;
			panX = (0.5 - x) * rect.width * (zoomLevel - 1);
			panY = (0.5 - y) * rect.height * (zoomLevel - 1);
		} else {
			zoomLevel = 1;
			panX = 0;
			panY = 0;
		}
	}

	function onMouseMove(e: MouseEvent) {
		if (zoomLevel <= 1) return;
		if (!isPanning) return;
		panX += e.movementX;
		panY += e.movementY;
	}

	function onMouseDown(e: MouseEvent) {
		if (zoomLevel <= 1) return;
		isPanning = true;
		e.preventDefault();
	}

	function onMouseUp() {
		isPanning = false;
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowRight') next();
		if (e.key === 'ArrowLeft') prev();
	}
</script>

<svelte:head>
	<title>{artwork.title} | Tommy Marcheschi</title>
	<meta name="description" content="{artwork.title} — {artwork.medium}, {artwork.year}" />
</svelte:head>

<div class="px-6 lg:px-10 py-8 lg:py-12">
	<a href="/" class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-accent transition-colors mb-10 inline-block no-underline">&larr; Works</a>

	<!-- Image Gallery -->
	<div class="max-w-4xl mx-auto mb-16">
		<div class="relative group">
			<!-- Main Image -->
			<div class="overflow-hidden cursor-zoom-in" onclick={openLightbox} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && openLightbox()}>
				{#key currentIndex}
					<img
						src={images[currentIndex]}
						alt="{artwork.title} — image {currentIndex + 1} of {images.length}"
						class="w-full object-contain animate-fade-in"
					/>
				{/key}
			</div>

			<!-- Nav Arrows (only show if multiple images) -->
			{#if images.length > 1}
				<button
					onclick={prev}
					class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-neutral-900"
					aria-label="Previous image"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"/></svg>
				</button>
				<button
					onclick={next}
					class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-neutral-900"
					aria-label="Next image"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.5"/></svg>
				</button>

				<!-- Dots -->
				<div class="flex items-center justify-center gap-2 mt-4">
					{#each images as _, i}
						<button
							onclick={() => goTo(i)}
							class="w-1.5 h-1.5 rounded-full transition-colors {i === currentIndex ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'}"
							aria-label="Go to image {i + 1}"
						></button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Details -->
	<div class="max-w-xl mx-auto">
		<h1 class="font-serif italic text-3xl lg:text-4xl mb-6">{artwork.title}</h1>

		<!-- Specs -->
		<div class="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mb-10">
			<div>
				<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">Medium</p>
				<p>{artwork.medium}</p>
			</div>
			<div>
				<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">Year</p>
				<p>{artwork.year}</p>
			</div>
			{#if artwork.dimensions}
				<div>
					<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1">Dimensions</p>
					<p>{artwork.dimensions}</p>
				</div>
			{/if}
		</div>

		{#if artwork.dedication}
			<p class="font-serif italic text-neutral-500 dark:text-neutral-400 mb-6">{artwork.dedication}</p>
		{/if}

		{#if artwork.description}
			<p class="leading-relaxed mb-10">{artwork.description}</p>
		{/if}

		<!-- Links -->
		{#if artwork.externalLink || artwork.tokenLink}
			<div class="flex flex-col gap-3 text-sm">
				{#if artwork.tokenLink}
					<a
						href={artwork.tokenLink}
						target="_blank"
						rel="noopener"
						class="text-accent hover:underline no-underline"
					>
						{artwork.tokenLabel || 'View Token'} &rarr;
					</a>
				{/if}
				{#if artwork.externalLink}
					<a
						href={artwork.externalLink}
						target="_blank"
						rel="noopener"
						class="text-accent hover:underline no-underline"
					>
						View Auction &rarr;
					</a>
				{/if}
			</div>
		{/if}

		<!-- Inquire -->
		<div class="mt-14 pt-10">
			<a href="/contact?artwork={encodeURIComponent(artwork.title)}" class="inline-block bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 text-sm hover:bg-accent hover:text-black transition-colors no-underline">
				Inquire About This Work
			</a>
		</div>
	</div>
</div>

<!-- Fullscreen Lightbox -->
<svelte:window onkeydown={onKeyDown} />

{#if lightboxOpen}
	<div class="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center">
		<!-- Close button -->
		<button
			onclick={closeLightbox}
			class="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
			aria-label="Close"
		>
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4L16 16M16 4L4 16" stroke="currentColor" stroke-width="1.5"/></svg>
		</button>

		<!-- Counter -->
		<div class="absolute top-5 left-5 text-white/40 text-xs">
			{currentIndex + 1} / {images.length}
		</div>

		<!-- Image container -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="w-full h-full flex items-center justify-center overflow-hidden {zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in'} {isPanning ? '!cursor-grabbing' : ''}"
			onclick={toggleZoom}
			onmousemove={onMouseMove}
			onmousedown={onMouseDown}
			onmouseup={onMouseUp}
			onmouseleave={onMouseUp}
		>
			{#key currentIndex}
				<img
					src={images[currentIndex]}
					alt={artwork.title}
					class="max-w-[90vw] max-h-[90vh] object-contain select-none animate-fade-in"
					style="transform: scale({zoomLevel}) translate({panX / zoomLevel}px, {panY / zoomLevel}px); transition: {isPanning ? 'none' : 'transform 0.3s ease-out'};"
					draggable="false"
				/>
			{/key}
		</div>

		<!-- Nav arrows -->
		{#if images.length > 1}
			<button
				onclick={(e) => { e.stopPropagation(); prev(); zoomLevel = 1; panX = 0; panY = 0; }}
				class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
				aria-label="Previous image"
			>
				<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.5"/></svg>
			</button>
			<button
				onclick={(e) => { e.stopPropagation(); next(); zoomLevel = 1; panX = 0; panY = 0; }}
				class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
				aria-label="Next image"
			>
				<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="1.5"/></svg>
			</button>

			<!-- Dots -->
			<div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
				{#each images as _, i}
					<button
						onclick={(e) => { e.stopPropagation(); goTo(i); zoomLevel = 1; panX = 0; panY = 0; }}
						class="w-1.5 h-1.5 rounded-full transition-colors {i === currentIndex ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}"
						aria-label="Go to image {i + 1}"
					></button>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.animate-fade-in {
		animation: fadeIn 0.3s ease-out;
	}
</style>
