<script lang="ts">
	let { data } = $props();
	const { artwork } = data;
</script>

<svelte:head>
	<title>{artwork.title} | Tommy Marcheschi</title>
	<meta name="description" content="{artwork.title} — {artwork.medium}, {artwork.year}" />
</svelte:head>

<div class="px-6 lg:px-10 py-8 lg:py-12">
	<a href="/" class="text-sm text-neutral-400 dark:text-neutral-500 hover:text-accent transition-colors mb-10 inline-block no-underline">&larr; Works</a>

	<!-- Image -->
	<div class="max-w-4xl mx-auto mb-16">
		<img
			src={artwork.image}
			alt={artwork.title}
			class="w-full object-contain"
		/>
	</div>

	<!-- Details -->
	<div class="max-w-xl mx-auto">
		<h1 class="text-2xl lg:text-3xl font-semibold mb-6">{artwork.title}</h1>

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
			<p class="italic text-neutral-500 dark:text-neutral-400 mb-6">{artwork.dedication}</p>
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
			<a href="/contact" class="inline-block bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 text-sm hover:bg-accent hover:text-black transition-colors no-underline">
				Inquire About This Work
			</a>
		</div>
	</div>
</div>
