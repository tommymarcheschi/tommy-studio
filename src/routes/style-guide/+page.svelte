<script lang="ts">
	import { theme } from '$lib/theme';

	const sections = [
		{ id: 'logo', label: 'Logo' },
		{ id: 'colors', label: 'Colors' },
		{ id: 'typography', label: 'Typography' },
		{ id: 'spacing', label: 'Spacing' },
		{ id: 'components', label: 'Components' },
		{ id: 'motion', label: 'Motion' },
		{ id: 'principles', label: 'Principles' },
	];

	const colors = [
		{ name: 'Background', light: '#FFFFFF', dark: '#0A0A0A', class: 'bg-white border border-neutral-100 dark:border-neutral-800' },
		{ name: 'Text Primary', light: '#171717', dark: '#F5F5F5', class: 'bg-neutral-900 dark:bg-neutral-100' },
		{ name: 'Text Secondary', light: '#A3A3A3', dark: '#525252', class: 'bg-neutral-400 dark:bg-neutral-600' },
		{ name: 'Accent — Bitcoin Orange', light: '#FF9900', dark: '#FF9900', class: 'bg-accent' },
		{ name: 'Surface Hover', light: '#FAFAFA', dark: '#171717', class: 'bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800' },
		{ name: 'Border / Divider', light: '#E5E5E5', dark: '#262626', class: 'bg-neutral-200 dark:bg-neutral-800' },
	];

	const fontWeights = [
		{ weight: 300, label: 'Light' },
		{ weight: 400, label: 'Regular' },
		{ weight: 500, label: 'Medium' },
		{ weight: 600, label: 'Semibold' },
		{ weight: 700, label: 'Bold' },
	];

	let activeSection = 'logo';

	function scrollTo(id: string) {
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		activeSection = id;
	}
</script>

<svelte:head>
	<title>Style Guide | Tommy Marcheschi</title>
</svelte:head>

<div class="px-6 lg:px-10 py-12 lg:py-20 max-w-6xl mx-auto">

	<!-- Header -->
	<div class="mb-16">
		<h1 class="text-3xl lg:text-4xl font-semibold mb-3">Style Guide</h1>
		<p class="text-neutral-400 dark:text-neutral-500 max-w-lg">Visual identity and design system for tommy.studio — the personal portfolio of Tommy Marcheschi.</p>
	</div>

	<div class="flex gap-16 lg:gap-20 items-start">

		<!-- Sticky Left Nav -->
		<nav class="hidden lg:block w-36 shrink-0 sticky top-24">
			<ul class="space-y-1">
				{#each sections as s}
					<li>
						<button
							on:click={() => scrollTo(s.id)}
							class="text-xs uppercase tracking-wider transition-colors w-full text-left py-1
								{activeSection === s.id
									? 'text-neutral-900 dark:text-neutral-100 font-medium'
									: 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-400'}"
						>
							{s.label}
						</button>
					</li>
				{/each}
			</ul>

			<div class="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
				<button
					on:click={() => theme.toggle()}
					class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 hover:text-accent transition-colors"
				>
					{#if $theme === 'dark'}Light mode{:else}Dark mode{/if}
				</button>
			</div>
		</nav>

		<!-- Content -->
		<div class="flex-1 min-w-0 space-y-24">

			<!-- Logo -->
			<section id="logo">
				<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-8">Logo</p>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
					<div class="bg-white border border-neutral-100 p-12 flex items-center justify-center">
						<img src="/tommy-logo.svg" alt="tommy wordmark" style="height: 24px; width: auto;" />
					</div>
					<div class="bg-neutral-950 p-12 flex items-center justify-center">
						<img src="/tommy-logo.svg" alt="tommy wordmark" style="height: 24px; width: auto; filter: invert(1);" />
					</div>
				</div>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="bg-white border border-neutral-100 p-12 flex items-center justify-center">
						<img src="/tommy-signature-new.svg" alt="tommy signature" style="height: 64px; width: auto;" />
					</div>
					<div class="bg-neutral-950 p-12 flex items-center justify-center">
						<img src="/tommy-signature-new.svg" alt="tommy signature" style="height: 64px; width: auto; filter: invert(1);" />
					</div>
				</div>
				<p class="text-xs text-neutral-400 dark:text-neutral-500 mt-4">Wordmark and signature. Both invert for dark backgrounds.</p>
			</section>

			<hr class="border-neutral-100 dark:border-neutral-800" />

			<!-- Colors -->
			<section id="colors">
				<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-8">Colors</p>
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8">
					{#each colors as color}
						<div>
							<div class="{color.class} w-full aspect-[4/3] rounded-sm"></div>
							<p class="text-sm font-medium mt-3">{color.name}</p>
							<p class="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 font-mono">{color.light} / {color.dark}</p>
						</div>
					{/each}
				</div>
			</section>

			<hr class="border-neutral-100 dark:border-neutral-800" />

			<!-- Typography -->
			<section id="typography">
				<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-8">Typography</p>

				<!-- Montserrat -->
				<div class="mb-12">
					<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-6 font-mono">Montserrat — Primary sans-serif</p>
					<div class="space-y-5">
						{#each fontWeights as fw}
							<div class="flex items-baseline gap-6">
								<p class="text-xs text-neutral-400 dark:text-neutral-500 w-24 shrink-0 font-mono">{fw.weight} {fw.label}</p>
								<p style="font-weight: {fw.weight}" class="text-2xl">The quick brown fox</p>
							</div>
						{/each}
					</div>
				</div>

				<!-- EB Garamond -->
				<div class="mb-12">
					<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-6 font-mono">EB Garamond — Serif accent</p>
					<div class="space-y-5">
						<div class="flex items-baseline gap-6">
							<p class="text-xs text-neutral-400 dark:text-neutral-500 w-24 shrink-0 font-mono">400 Regular</p>
							<p class="text-3xl font-serif">The quick brown fox</p>
						</div>
						<div class="flex items-baseline gap-6">
							<p class="text-xs text-neutral-400 dark:text-neutral-500 w-24 shrink-0 font-mono">400 Italic</p>
							<p class="text-3xl font-serif italic">The quick brown fox</p>
						</div>
						<div class="flex items-baseline gap-6">
							<p class="text-xs text-neutral-400 dark:text-neutral-500 w-24 shrink-0 font-mono">500 Medium</p>
							<p class="text-3xl font-serif font-medium">The quick brown fox</p>
						</div>
						<div class="flex items-baseline gap-6">
							<p class="text-xs text-neutral-400 dark:text-neutral-500 w-24 shrink-0 font-mono">600 Semibold</p>
							<p class="text-3xl font-serif font-semibold">The quick brown fox</p>
						</div>
					</div>
				</div>

				<!-- Type Scale -->
				<div>
					<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-6 font-mono">Type Scale — in use</p>
					<div class="space-y-8">
						<div>
							<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-2 font-mono">Artwork title — font-serif text-4xl italic</p>
							<p class="font-serif text-4xl italic">Bitcoin War Bonds</p>
						</div>
						<div>
							<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-2 font-mono">Page title — font-sans text-3xl font-semibold</p>
							<p class="text-3xl font-semibold">Selected Works</p>
						</div>
						<div>
							<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-2 font-mono">Section header — text-xs uppercase tracking-wider</p>
							<p class="text-xs uppercase tracking-wider">Selected Exhibitions & Auctions</p>
						</div>
						<div>
							<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-2 font-mono">Body — text-base leading-relaxed</p>
							<p class="leading-relaxed max-w-lg text-neutral-600 dark:text-neutral-400">Tommy Marcheschi (b. 1992) is a multi-disciplinary artist, collector, and curator based in Nashville, Tennessee. His work spans oil, acrylic, aerosol, and mixed media on canvas and wood.</p>
						</div>
						<div>
							<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-2 font-mono">Caption — font-serif italic text-sm</p>
							<p class="font-serif italic text-sm text-neutral-500 dark:text-neutral-400">Mixed media on canvas, 2022 — 24 × 36 in</p>
						</div>
						<div>
							<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-2 font-mono">Accent link — text-accent</p>
							<a href="#" class="text-accent hover:underline text-sm">museum.b.tc &rarr;</a>
						</div>
					</div>
				</div>
			</section>

			<hr class="border-neutral-100 dark:border-neutral-800" />

			<!-- Spacing -->
			<section id="spacing">
				<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-8">Spacing & Layout</p>
				<div class="space-y-4 text-sm">
					<div class="flex items-start gap-6">
						<span class="text-neutral-400 dark:text-neutral-500 w-36 shrink-0 text-xs font-mono">Page padding</span>
						<span class="text-xs font-mono">px-6 (mobile) / px-10 (desktop)</span>
					</div>
					<div class="flex items-start gap-6">
						<span class="text-neutral-400 dark:text-neutral-500 w-36 shrink-0 text-xs font-mono">Grid gap</span>
						<span class="text-xs font-mono">gap-x-12 gap-y-20 (desktop)</span>
					</div>
					<div class="flex items-start gap-6">
						<span class="text-neutral-400 dark:text-neutral-500 w-36 shrink-0 text-xs font-mono">Section gap</span>
						<span class="text-xs font-mono">space-y-24 (style guide) / mb-16 (pages)</span>
					</div>
					<div class="flex items-start gap-6">
						<span class="text-neutral-400 dark:text-neutral-500 w-36 shrink-0 text-xs font-mono">Content max-width</span>
						<span class="text-xs font-mono">max-w-xl (text) / max-w-4xl (images)</span>
					</div>
					<div class="flex items-start gap-6">
						<span class="text-neutral-400 dark:text-neutral-500 w-36 shrink-0 text-xs font-mono">Nav width</span>
						<span class="text-xs font-mono">w-36 sticky left column</span>
					</div>
				</div>
			</section>

			<hr class="border-neutral-100 dark:border-neutral-800" />

			<!-- Components -->
			<section id="components">
				<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-8">Components</p>

				<div class="space-y-16">

					<!-- Button -->
					<div>
						<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-4 font-mono">Button — Primary</p>
						<button class="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-8 py-3 text-sm font-medium hover:bg-accent hover:text-black transition-colors">
							Inquire About This Work
						</button>
					</div>

					<!-- BMAG CTA -->
					<div>
						<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-4 font-mono">CTA — BMAG hover inversion</p>
						<div class="inline-flex items-center gap-5 py-5 px-6 transition-all duration-300 hover:bg-neutral-900 dark:hover:bg-neutral-100 hover:px-8 group cursor-pointer">
							<img src="/bmag-camel.svg" alt="BMAG" class="h-8 logo-img transition-all duration-300 group-hover:invert dark:group-hover:invert-0" />
							<div class="transition-colors duration-300">
								<p class="font-medium group-hover:text-white dark:group-hover:text-neutral-900">Visit BMAG — Bitcoin Museum & Art Gallery</p>
								<span class="inline-block mt-1 text-sm text-accent">museum.b.tc &rarr;</span>
							</div>
						</div>
					</div>

					<!-- Auction Live -->
					<div>
						<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-4 font-mono">CTA — Auction Live indicator</p>
						<div class="py-4 inline-block">
							<div class="flex items-center gap-3 mb-1">
								<span class="relative flex h-2.5 w-2.5">
									<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
									<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
								</span>
								<span class="text-sm font-semibold uppercase tracking-wider">Auction Live</span>
							</div>
							<p class="font-serif italic text-xl mt-1">END FIAT! BEFORE FIAT ENDS US</p>
							<span class="inline-block mt-2 text-sm text-accent">Bid Now &rarr;</span>
						</div>
					</div>

					<!-- Artwork card caption -->
					<div>
						<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-4 font-mono">Artwork caption — serif italic</p>
						<div class="max-w-xs">
							<div class="bg-neutral-100 dark:bg-neutral-800 aspect-[3/4] w-full mb-3"></div>
							<p class="font-serif italic text-base">Bitcoin War Bonds</p>
							<p class="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">2022 — Oil on canvas, 24 × 36 in</p>
						</div>
					</div>

					<!-- View Toggle -->
					<div>
						<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-4 font-mono">View Toggle</p>
						<div class="flex items-center gap-1">
							<button class="p-2 text-neutral-900 dark:text-neutral-100">
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="0.5" y="0.5" width="7" height="7" rx="0.5" stroke="currentColor"/><rect x="10.5" y="0.5" width="7" height="7" rx="0.5" stroke="currentColor"/><rect x="0.5" y="10.5" width="7" height="7" rx="0.5" stroke="currentColor"/><rect x="10.5" y="10.5" width="7" height="7" rx="0.5" stroke="currentColor"/></svg>
							</button>
							<button class="p-2 text-neutral-300 dark:text-neutral-600">
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="0.5" y="1.5" width="5" height="5" rx="0.5" stroke="currentColor"/><line x1="8" y1="2.5" x2="17.5" y2="2.5" stroke="currentColor"/><line x1="8" y1="5.5" x2="14" y2="5.5" stroke="currentColor"/><rect x="0.5" y="11.5" width="5" height="5" rx="0.5" stroke="currentColor"/><line x1="8" y1="12.5" x2="17.5" y2="12.5" stroke="currentColor"/><line x1="8" y1="15.5" x2="14" y2="15.5" stroke="currentColor"/></svg>
							</button>
						</div>
					</div>

					<!-- Form Input -->
					<div>
						<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-4 font-mono">Form Input — underline style</p>
						<div class="max-w-sm">
							<label class="block text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Name</label>
							<input type="text"
								class="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 px-0 py-3 text-sm focus:border-accent focus:outline-none transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
								placeholder="Your name"
							/>
						</div>
					</div>

				</div>
			</section>

			<hr class="border-neutral-100 dark:border-neutral-800" />

			<!-- Motion -->
			<section id="motion">
				<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-8">Motion</p>
				<div class="space-y-10 text-sm">
					<div>
						<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-4 font-mono">Hover inversion — nav / CTA blocks</p>
						<div class="inline-flex items-center gap-4 px-6 py-4 transition-all duration-300 hover:bg-neutral-900 dark:hover:bg-neutral-100 hover:px-8 group cursor-pointer">
							<span class="font-medium group-hover:text-white dark:group-hover:text-neutral-900 transition-colors duration-300">About</span>
							<span class="text-neutral-400 group-hover:text-white dark:group-hover:text-neutral-500 transition-colors duration-300 text-xs uppercase tracking-wider">→</span>
						</div>
					</div>
					<div>
						<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-4 font-mono">Color transition — accent on hover</p>
						<button class="text-neutral-900 dark:text-neutral-100 hover:text-accent transition-colors duration-200 font-medium">Hover for orange &rarr;</button>
					</div>
					<div>
						<p class="text-xs text-neutral-400 dark:text-neutral-500 mb-4 font-mono">Duration tokens</p>
						<div class="space-y-2 font-mono text-xs">
							<p><span class="text-neutral-400 dark:text-neutral-500 w-40 inline-block">duration-200</span> Color transitions</p>
							<p><span class="text-neutral-400 dark:text-neutral-500 w-40 inline-block">duration-300</span> Block inversions, theme toggle</p>
							<p><span class="text-neutral-400 dark:text-neutral-500 w-40 inline-block">duration-500</span> Page transitions (planned)</p>
						</div>
					</div>
				</div>
			</section>

			<hr class="border-neutral-100 dark:border-neutral-800" />

			<!-- Principles -->
			<section id="principles">
				<p class="text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-8">Design Principles</p>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
					<div>
						<p class="font-medium mb-2">Let the art breathe</p>
						<p class="text-neutral-500 dark:text-neutral-400 leading-relaxed">Generous whitespace, no visible grid lines. The work is the focus — UI stays out of the way.</p>
					</div>
					<div>
						<p class="font-medium mb-2">Light by default</p>
						<p class="text-neutral-500 dark:text-neutral-400 leading-relaxed">Clean white canvas as default. Dark mode available for user preference, respects system settings.</p>
					</div>
					<div>
						<p class="font-medium mb-2">Serif for the art, sans for the system</p>
						<p class="text-neutral-500 dark:text-neutral-400 leading-relaxed">EB Garamond for artwork titles and captions — adds weight and personality. Montserrat for UI, labels, and navigation.</p>
					</div>
					<div>
						<p class="font-medium mb-2">Bitcoin orange as accent</p>
						<p class="text-neutral-500 dark:text-neutral-400 leading-relaxed">#FF9900 used sparingly — links, active states, and CTAs. Never as a background fill.</p>
					</div>
					<div>
						<p class="font-medium mb-2">Motion with intention</p>
						<p class="text-neutral-500 dark:text-neutral-400 leading-relaxed">Scroll reveals, page transitions, hover inversions. Every animation communicates something.</p>
					</div>
					<div>
						<p class="font-medium mb-2">Structure felt, not seen</p>
						<p class="text-neutral-500 dark:text-neutral-400 leading-relaxed">Layout defined by spacing and alignment, not lines. Complexity is opt-in.</p>
					</div>
				</div>
			</section>

		</div>
	</div>
</div>
