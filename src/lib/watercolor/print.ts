// Print sizes & pricing. These map to standard frame sizes you can buy off the
// shelf (Hobby Lobby / Michaels) so framing is painless. Prices are your sale
// price to the customer; your cost = local print + frame + shipping.
//
// Tweak PRICES freely — a single source of truth the UI and (later) Stripe read.

export interface PrintSize {
	id: string;
	label: string;
	/** Inches, portrait orientation (swap for landscape at order time). */
	inches: [number, number];
	/** Standard off-the-shelf frame that fits (no custom framing needed). */
	frame: string;
	/** Customer price in USD. */
	price: number;
	/** Minimum long-edge pixels for a crisp 300 DPI print. */
	minPx: number;
}

export const PRINT_SIZES: PrintSize[] = [
	{ id: '5x7', label: '5 × 7 in', inches: [5, 7], frame: 'Standard 5×7 frame', price: 45, minPx: 2100 },
	{ id: '8x10', label: '8 × 10 in', inches: [8, 10], frame: 'Standard 8×10 frame', price: 75, minPx: 3000 },
	{ id: '11x14', label: '11 × 14 in', inches: [11, 14], frame: 'Standard 11×14 frame', price: 110, minPx: 4200 },
	{ id: '16x20', label: '16 × 20 in', inches: [16, 20], frame: 'Standard 16×20 frame', price: 180, minPx: 6000 }
];

export interface FrameOption {
	id: string;
	label: string;
	/** Added to the print price. */
	price: number;
}

export const FRAME_OPTIONS: FrameOption[] = [
	{ id: 'none', label: 'Print only (no frame)', price: 0 },
	{ id: 'black', label: 'Classic black frame', price: 25 },
	{ id: 'white', label: 'Gallery white frame', price: 25 },
	{ id: 'natural', label: 'Natural wood frame', price: 35 }
];

export function sizeById(id: string): PrintSize | undefined {
	return PRINT_SIZES.find((s) => s.id === id);
}
export function frameById(id: string): FrameOption | undefined {
	return FRAME_OPTIONS.find((f) => f.id === id);
}

export function orderTotal(sizeId: string, frameId: string, qty = 1): number {
	const s = sizeById(sizeId);
	const f = frameById(frameId);
	if (!s || !f) return 0;
	return (s.price + f.price) * qty;
}
