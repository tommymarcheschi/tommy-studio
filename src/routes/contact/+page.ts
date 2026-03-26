import { artworks } from '$lib/data/site';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	return {
		artworks: artworks.map((a) => ({ title: a.title, slug: a.slug })),
		selectedArtwork: url.searchParams.get('artwork') || ''
	};
};
