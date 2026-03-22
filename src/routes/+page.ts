import { supabase } from '$lib/supabase';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const { data: artworks, error } = await supabase
		.from('artworks')
		.select('*')
		.order('sort_order', { ascending: true });

	if (error) {
		console.error('Error fetching artworks:', error);
		return { artworks: [] };
	}

	return { artworks: artworks ?? [] };
};
