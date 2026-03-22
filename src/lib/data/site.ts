export const siteConfig = {
	name: 'Tommy Marcheschi',
	birthYear: 1992,
	bio: 'Multi-disciplinary artist, collector, and curator with a passion for Hyperbitcoinization.',
	projects: [
		{ name: 'BTC Inc', url: 'https://b.tc' },
		{ name: 'BMAG', url: 'https://museum.b.tc' },
		{ name: 'Satoshi House Auctions', url: 'https://www.satoshihouse.auction/' },
		{ name: 'Bitcoin War Bonds', url: 'https://www.bitcoinwarbonds.law/' }
	],
	social: [
		{ platform: 'X', url: 'https://x.com/YungGucciT', handle: '@YungGucciT' }
	],
	btcAddress: 'bc1p3e7l6hct5sys0ctdspx0r53a5nwdzlt9cull4fjtj4f2wzlanyhs20v52k',
	auctionLive: {
		title: 'END FIAT! BEFORE FIAT ENDS US',
		url: 'https://rsmc.tech/auctions/end-fiat'
	}
};

export interface Artwork {
	slug: string;
	title: string;
	year: number;
	medium: string;
	dimensions?: string;
	description?: string;
	dedication?: string;
	image: string;
	externalLink?: string;
	tokenLink?: string;
	tokenLabel?: string;
	sortOrder: number;
}

export const artworks: Artwork[] = [
	{
		slug: 'ross-ulbricht-portrait-2025',
		title: 'Ross Ulbricht Portrait',
		year: 2025,
		medium: 'Oil on aluminum-backed paper',
		dimensions: '8 x 10 in (framed 17 x 19 x 4 in)',
		description: 'A portrait of Ross Ulbricht painted from the very first video he posted after receiving a presidential pardon and being freed from prison on January 23, 2025. 50% of auction proceeds donated to Lyn Ulbricht\'s nonprofit MACS.',
		image: 'https://cdn.prod.website-files.com/5cbfe26da2227a9de063b458/67ffca0a3aa8fa819dee6b94_ross-ulbricht-portrait.jpeg',
		externalLink: 'https://scarce.city/auctions/ross-ulbricht-portrait-tommy',
		sortOrder: 1
	},
	{
		slug: 'compliance-violence',
		title: 'COMPLIANCE=VIOLENCE',
		year: 2025,
		medium: 'Acrylic on paper',
		description: 'A propaganda-style officer demands compliance with Executive Order 69420 — the hypothetical seizure of Bitcoin by the state. A companion piece to Bitcoin War Bonds, extending the pre-emptive propaganda series.',
		image: 'https://cdn.prod.website-files.com/5cbfe26da2227a9de063b458/67ffc82d1b719b61a77344d4_COMPLIANCE-WILL-END-THE-VIOLENCE-openSource-TommyMarcheschi-lowres%20Large.jpeg',
		externalLink: 'https://scarce.city/auctions/compliance-violence',
		sortOrder: 2
	},
	{
		slug: 'only-the-hits',
		title: 'ONLY THE HITS',
		year: 2024,
		medium: 'Mixed media on canvas',
		description: 'Painted live at TABConf (The Atlanta Bitcoin Conference) in 2024. A vibrant, layered composition capturing the energy of the Bitcoin community in real time.',
		image: 'https://cdn.prod.website-files.com/5cbfe26da2227a9de063b458/67ffccbe7c30af5de6690264_onlythehits.jpeg',
		externalLink: 'https://satoshihouse.auction/auctions/only-the-hits',
		sortOrder: 3
	},
	{
		slug: 'networkpepe',
		title: 'NETWORKPEPE',
		year: 2024,
		medium: 'Mixed media on canvas',
		description: 'A frantic Pepe surrounded by clocks — a commentary on the relentless pace of the network and the pressure of time in a hyperconnected world.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/669067d5440c77af36a2a88a_NETWORKPEPE%20Large.jpeg',
		sortOrder: 4
	},
	{
		slug: 'world-love-bitcoin-peace',
		title: 'WORLD\u2022LOVE\u2022BITCOIN\u2022PEACE',
		year: 2024,
		medium: 'Oil on canvas',
		description: 'A Bitcoin Puppet depicted as Napoleon in Antarctica, holding a Bitcoin scepter among glaciers and mountains. A meditation on the Bitcoin Puppets ordinals collection and the pursuit of world peace through sound money.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/6634f7bf460461e107ad4a87_WORLD%E2%80%A2LOVE%E2%80%A2BITCOIN%E2%80%A2PEACE.webp',
		tokenLink: 'https://ordinals.com/inscription/28326bc0bb3c7fb0251efcb39595ffdd0c634d792c0d503ad40f47b2f0d8db82i0',
		tokenLabel: 'Ordinal Inscription',
		sortOrder: 5
	},
	{
		slug: 'hardcorecoco',
		title: 'HARDCORECOCO',
		year: 2024,
		medium: 'Mixed media on wood',
		description: 'A tribute to the Rare Coco community — a hand-painted physical card rendered on wood panel.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/6631923be1b00c3870b27c75_HARDCORECOCO-4.jpg',
		tokenLink: 'https://rarecoco.wtf/card/d515a20f-3059-469c-9bca-9b42e5f32c3d',
		tokenLabel: 'Rare Coco Card',
		sortOrder: 6
	},
	{
		slug: 'end-fiat-before-fiat-ends-us',
		title: 'END FIAT! (BEFORE FIAT ENDS US)',
		year: 2023,
		medium: 'Mixed media on canvas',
		description: 'Pepe as the Earth, weighed down by fiat currency, while Bitcoin scissors cut the fuse of a dollar-sign bomb. A grimacing moon watches from the corner. The painting exists as both a physical work and an ordinal inscription.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/653aad52fb4e885230f88a32_ENDFIAT-press.jpg',
		externalLink: 'https://rsmc.tech/auctions/end-fiat',
		tokenLink: 'https://ordinals.com/inscription/00246c1e419ff39cc3d190064f489be4fe81a706fb032ef55f4042e091dfd90ai0',
		tokenLabel: 'Ordinal Inscription',
		sortOrder: 7
	},
	{
		slug: 'gatekeepers',
		title: 'GATEKEEPERS',
		year: 2023,
		medium: 'Oil on canvas',
		dedication: 'For Julian Assange',
		description: 'A portrait dedicated to Julian Assange and the fight against institutional gatekeeping. Debuted at the Bitcoin 2023 art gallery in Miami.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/64443ea575880184e9abb08f_assange-inscribeFInal.webp',
		tokenLink: 'https://xchain.io/asset/GATEKEEPERS',
		tokenLabel: 'CounterParty Token',
		sortOrder: 8
	},
	{
		slug: 'codex-alimentarius',
		title: 'CODEX ALIMENTARIUS',
		year: 2023,
		medium: 'Mixed media on canvas',
		dimensions: '24 x 36 in',
		description: 'Bitcoin War Bonds #5. A dark, surrealist propaganda poster exposing the intersection of food regulation, pharmaceutical control, and institutional power. References the real-world Codex Alimentarius Commission.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/6407c8c482be2bf9ba2d39d2_codex-printmag.jpg',
		externalLink: 'https://scarce.city/auctions/codex-alimentarius-bitcoin-war-bonds',
		sortOrder: 9
	},
	{
		slug: 'running',
		title: 'RUNNING',
		year: 2023,
		medium: 'Mixed media on canvas',
		description: 'A portrait of Hal Finney in motion — the legendary Bitcoin pioneer who received the first-ever Bitcoin transaction from Satoshi Nakamoto and was also a dedicated runner. 50% of auction proceeds donated to the ALS Foundation.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/667c49bbf0fd7195fb9b8b65_RUNNING%20Large.jpeg',
		externalLink: 'https://satoshihouse.auction/auctions/running',
		sortOrder: 10
	},
	{
		slug: '420-pepe',
		title: '420 PEPE',
		year: 2023,
		medium: 'Acrylic on canvas',
		dimensions: '11 x 14 in',
		description: 'A 420 special edition — started, completed, and auctioned for PEPE on April 20, 2023. Accompanied by an ordinal inscription.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/6443ecfd827de60cb368536e_420pepe2023ord.jpg',
		externalLink: 'https://gallery.manifold.xyz/listing?listingId=5326',
		sortOrder: 11
	},
	{
		slug: 'backofpepe',
		title: 'BACKOFPEPE',
		year: 2023,
		medium: 'Mixed media on wood',
		description: 'A painted wood panel depicting the reverse side of a Pepe trading card — blurring the line between collectible card culture and fine art.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/64ef76520c4774df4e4e6338_smBACKOFPEPE-300x420%20.gif',
		tokenLink: 'https://xchain.io/asset/BACKOFPEPE',
		tokenLabel: 'CounterParty Token',
		sortOrder: 12
	},
	{
		slug: 'rosslivesnow',
		title: 'ROSSLIVESNOW',
		year: 2022,
		medium: 'Acrylic on canvas',
		dimensions: '5 x 5 in',
		description: 'A small but charged portrait of Ross Ulbricht. On permanent display at the BMAG Free Ross Exhibit in Nashville, TN. Originally offered for a direct donation of 1.83961921 BTC to FreeRoss.org — the amount matching his $183,961,921 fine.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/66762fc5753697f246b66266_rosslivesnow.jpg',
		externalLink: 'https://freeross.org/',
		sortOrder: 13
	},
	{
		slug: 'forhodlonaut',
		title: 'FORHODLONAUT',
		year: 2022,
		medium: 'Acrylic on canvas',
		description: 'A portrait of the pseudonymous Bitcoiner Hodlonaut, painted as a congratulatory gift after his long and victorious legal battle with Craig Wright.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/635ecb5f482d4aa90d1379a2_FORHODLONAUT-small.jpg',
		sortOrder: 14
	},
	{
		slug: 'warbonds',
		title: 'BITCOIN WAR BONDS',
		year: 2022,
		medium: 'Mixed media on canvas',
		description: 'The genesis of the Bitcoin War Bonds collection and Tommy\'s breakout work. A Guy Fawkes figure in military regalia demands you buy Bitcoin War Bonds under Executive Order 69420. Debuted at Bitcoin 2022 in Miami alongside 1,000,000 WARBONDS.BITCOIN tokens on CounterParty. Later inscribed as a 4MB image in Bitcoin block 777945 in early 2023.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/624d3a966587e4cbfd73c938_WARBONDS-TOKEN-photo-site.jpg',
		externalLink: 'https://www.bitcoinwarbonds.law/',
		tokenLink: 'https://xchain.io/asset/WARBONDS.BITCOIN',
		tokenLabel: 'WARBONDS.BITCOIN (CounterParty)',
		sortOrder: 15
	},
	{
		slug: 'cusp-of-revolution',
		title: 'CUSP OF REVOLUTION',
		year: 2022,
		medium: 'Acrylic on canvas',
		description: 'Bitcoin War Bonds #4. A classical portrait in an ornate gold frame — a quieter, more traditional entry in the series that signals the broader cultural shift Bitcoin represents.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/638fec7761c5ed210d4952eb_CUSPOFREVOLUTION--frame1.jpg',
		externalLink: 'https://www.bitcoinwarbonds.law',
		sortOrder: 16
	},
	{
		slug: 'bitcoin-frog',
		title: 'BITCOIN FROG',
		year: 2022,
		medium: 'Acrylic on canvas',
		description: 'A military frog in dress uniform — part of the Bitcoin War Bonds universe. The frog serves as both a nod to meme culture and a symbol of quiet resilience.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/62a100d694f1446796f5327f_WARBONDS-BITCOINFROG-smol.jpg',
		tokenLink: 'https://xchain.io/asset/WARBONDS.BITCOINFROG',
		tokenLabel: 'WARBONDS.BITCOINFROG (CounterParty)',
		sortOrder: 17
	},
	{
		slug: 'hodlomonster-culmination-of-proof-a-clash-of-cats-and-the-charlatan',
		title: 'HODLOMONSTER: CULMINATION OF PROOF, A CLASH OF CATS AND THE CHARLATAN',
		year: 2022,
		medium: 'Mixed media on canvas',
		dimensions: '30 x 24 x 1.5 in',
		description: 'An epoch duel between cats and pussies — this moment echoes through the timechain. Painted in support of Hodlonaut during his legal battle. 100% of proceeds donated via @DefendingBTC.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/66762e6a48876d15a913f7df_65a22db4706a449690cf10005d8d40be093b16ff-2992x2530.webp',
		externalLink: 'https://scarce.city/auctions/hodlomonster',
		sortOrder: 18
	},
	{
		slug: 'deathtofiat',
		title: 'DEATHTOFIAT',
		year: 2022,
		medium: 'Aerosol on canvas',
		description: 'A raw aerosol piece — the title says it all. An early expression of the anti-fiat sentiment that would develop into the Bitcoin War Bonds series.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/6676354d1549e628ba30b35b_deathtofiat.webp',
		tokenLink: 'https://xchain.io/asset/DEATHTOFIAT',
		tokenLabel: 'CounterParty Token',
		sortOrder: 19
	},
	{
		slug: 'untitled-for-all',
		title: 'Untitled (FOR ALL)',
		year: 2021,
		medium: 'Mixed media on canvas',
		dimensions: '38 x 38 in',
		description: 'Tommy\'s first major painting, created over the span of a year (March 2020 to April 2021) while working as Art Director at BTC Inc. A Guy Fawkes mask rendered in acrylic, charcoal, and ash on hand-stretched canvas. A small piece of shredded paper landed on his table mid-process reading "FOR ALL" — giving the work its name and its thesis: privacy is a self-evident right for all.',
		image: 'https://uploads-ssl.webflow.com/5cbfe26da2227a9de063b458/6676342ed0b72654f4515a79_Screenshot%202024-06-21%20at%209.17.01%E2%80%AFPM.png',
		externalLink: 'https://scarce.city/products/untitled-for-all-hidden',
		sortOrder: 20
	}
];
