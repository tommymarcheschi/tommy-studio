<script lang="ts">
	import { siteConfig } from '$lib/data/site';
	import { page } from '$app/stores';

	let { data } = $props();
	let selectedArtwork = $state(data.selectedArtwork);
</script>

<svelte:head>
	<title>Contact | Tommy Marcheschi</title>
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
			<h1 class="text-2xl lg:text-3xl font-semibold mb-4">Get in touch</h1>
			<p class="text-neutral-500 dark:text-neutral-400 mb-12">
				{#if selectedArtwork}
					Inquiring about <span class="text-neutral-900 dark:text-neutral-100 font-medium">{selectedArtwork}</span>
				{:else}
					For inquiries about artworks, commissions, collaborations, or press.
				{/if}
			</p>

			<form class="space-y-8">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
					<div>
						<label for="name" class="block text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Name</label>
						<input type="text" id="name" name="name" required
							class="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 px-0 py-3 text-sm focus:border-accent focus:outline-none transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
							placeholder="Your name"
						/>
					</div>
					<div>
						<label for="email" class="block text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Email</label>
						<input type="email" id="email" name="email" required
							class="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 px-0 py-3 text-sm focus:border-accent focus:outline-none transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
							placeholder="your@email.com"
						/>
					</div>
				</div>
				<div>
					<label for="artwork" class="block text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Regarding</label>
					<select
						id="artwork"
						name="artwork"
						bind:value={selectedArtwork}
						class="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 px-0 py-3 text-sm focus:border-accent focus:outline-none transition-colors appearance-none cursor-pointer"
					>
						<option value="">General inquiry</option>
						{#each data.artworks as art}
							<option value={art.title}>{art.title}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="message" class="block text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Message</label>
					<textarea id="message" name="message" rows="6" required
						class="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 px-0 py-3 text-sm focus:border-accent focus:outline-none transition-colors resize-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
						placeholder="Tell me about your project or inquiry..."
					></textarea>
				</div>
				<div class="pt-4">
					<button type="submit"
						class="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-10 py-3.5 text-sm font-medium hover:bg-accent hover:text-black transition-colors"
					>
						Send Message
					</button>
				</div>
			</form>

			<!-- Alt contact -->
			<div class="mt-20 flex flex-col sm:flex-row gap-10 text-sm text-neutral-500 dark:text-neutral-400">
				<div>
					<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Social</p>
					<a href={siteConfig.social[0].url} target="_blank" rel="noopener" class="text-accent hover:underline no-underline">
						{siteConfig.social[0].handle}
					</a>
				</div>
				<div>
					<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Location</p>
					<p>Nashville, Tennessee</p>
				</div>
				</div>
		</div>
	</div>
</div>
