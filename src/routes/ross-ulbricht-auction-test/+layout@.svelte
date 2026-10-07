<script lang="ts">
	// Standalone layout — breaks out of the tommy.studio portfolio chrome (nav/footer)
	// so this reads as its own BMAG-branded checkout, not a portfolio sub-page.
	let { children } = $props();
</script>

{@render children()}
