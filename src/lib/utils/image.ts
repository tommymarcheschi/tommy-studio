const SITE_ORIGIN = 'https://tommy.studio';

/**
 * Fast, lower-res thumbnail for grid/list views via the images.weserv.nl resize proxy.
 * Full-resolution source is untouched and still used on artwork detail pages.
 */
export function thumbUrl(src: string, width = 500, quality = 60): string {
	if (!src) return src;
	const absolute = src.startsWith('http') ? src : `${SITE_ORIGIN}${src}`;
	const hostAndPath = absolute.replace(/^https?:\/\//, '');
	return `https://images.weserv.nl/?url=${encodeURIComponent(hostAndPath)}&w=${width}&q=${quality}&output=webp`;
}
