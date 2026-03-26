import { error } from '@sveltejs/kit';
import { artworks } from '$lib/data/site';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const artwork = artworks.find((a) => a.slug === params.slug);

	if (!artwork) {
		error(404, 'Artwork not found');
	}

	return { artwork };
};
