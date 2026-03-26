import { artworks, siteConfig } from '$lib/data/site';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	return {
		artworks,
		settings: {
			auction_live: !!siteConfig.auctionLive,
			auction_url: siteConfig.auctionLive?.url ?? null,
			auction_title: siteConfig.auctionLive?.title ?? null
		}
	};
};
