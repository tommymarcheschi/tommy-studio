import { artworks } from '$lib/data/site';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const artwork = artworks.find((a) => a.slug === params.slug);

	if (!artwork) {
		error(404, 'Artwork not found');
	}

	return { artwork };
};
