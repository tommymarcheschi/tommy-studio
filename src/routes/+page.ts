import { supabase } from '$lib/supabase';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const [artworksRes, settingsRes] = await Promise.all([
		supabase.from('artworks').select('*').order('sort_order', { ascending: true }),
		supabase.from('site_settings').select('*').eq('id', 'main').single()
	]);

	return {
		artworks: artworksRes.data ?? [],
		settings: settingsRes.data ?? { auction_live: false }
	};
};
