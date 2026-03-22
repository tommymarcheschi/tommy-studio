import { supabase } from '$lib/supabase';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const { data: artworks } = await supabase
		.from('artworks')
		.select('title, slug')
		.order('sort_order', { ascending: true });

	return {
		artworks: artworks ?? [],
		selectedArtwork: url.searchParams.get('artwork') || ''
	};
};
