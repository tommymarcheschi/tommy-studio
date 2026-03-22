import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const { data: artwork, error: err } = await supabase
		.from('artworks')
		.select('*')
		.eq('slug', params.slug)
		.single();

	if (err || !artwork) {
		error(404, 'Artwork not found');
	}

	return { artwork };
};
