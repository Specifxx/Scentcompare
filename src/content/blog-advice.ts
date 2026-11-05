// Advice and opinion posts, written as data and drawn by the advice layout in
// src/app/blog/[slug]/page.tsx, so every pick is a live price table for the
// reader's own country.
//
// Rules (DECISIONS.md "Advice posts"): one question per post; opinions rest on
// what a product's own name says it is, how widely it is stocked and what it
// costs, never on invented reviews or figures we have not measured; written as
// the ScentCompare team, for anyone who wears fragrance.
import type { Post } from "./blog";

export const ADVICE_POSTS: Post[] = [
  {
    slug: "mens-colognes-every-store-stocks-priced",
    title: "The men's colognes every store stocks, priced at the cheapest one",
    short: "Men's colognes, priced",
    description: "Sauvage, Bleu de Chanel, Aventus, Eros, Le Male, 1 Million, Acqua di Giò: the men's fragrances the most stores carry, at the cheapest store in your country today, and how far the same bottle's price spreads.",
    date: "2026-11-05",
    art: "men",
    sections: [
      {
        p: [
          "A handful of men's fragrances account for most of what fragrance stores sell, and because every store stocks them, they are also the bottles with the widest price gaps. The same 100 ml of Sauvage, matched by the barcode on the box, can cost a third more at one shop than at another on the same day. This post lists the bestsellers the most stores in your country stock, cheapest store first, and refreshes every day.",
          "Two things to check before you buy. The concentration: Sauvage alone comes as an eau de toilette, an eau de parfum, a parfum and an elixir, and they are different products at different prices, so make sure the row you click is the one you want. And the size: a 60 ml is rarely a better deal per millilitre than a 100 ml, but it is the right buy if you own ten bottles already.",
        ],
      },
      {
        h: "The designer bestsellers",
        p: ["The names people type into our search most: Dior, Chanel, Versace, Jean Paul Gaultier, Rabanne, Armani and Yves Saint Laurent. Each row is the exact bottle at every store that has it in stock."],
        picks: { title: "The men's bestsellers {region}", match: "sauvage|bleu de chanel|eros|le male|1 million|one million|acqua di gi|dylan blue|stronger with you|spicebomb|invictus|the one|\\by\\b.*(edp|eau de parfum)|bad boy|phantom|le beau|wanted|code|boss bottled|allure homme|terre d'hermes|man in black", cat: "men", limit: 12 },
      },
      {
        h: "The niche men's favourites",
        p: ["Creed Aventus, Parfums de Marly Layton and Herod, Xerjoff Naxos and Tom Ford's Oud Wood are the ones that make a cheaper store worth finding: at this price, a 10% gap is real money. Many of these are sold for anyone, so the ones labelled unisex are in the [unisex section](/unisex)."],
        picks: { title: "Niche favourites for men {region}", match: "aventus|layton|herod|naxos|oud wood|green irish tweed|percival|althair|pegasus|erba pura|tobacco vanille|ombre leather", limit: 10 },
      },
      {
        h: "Aftershave and the rest of the line",
        p: ["An aftershave balm or lotion from the same house is usually the cheapest way into a scent, and the deodorant and shower gel are where a gift set earns its price. Those are in the [body section](/body); the houses' boxed sets are in [gift sets](/sets)."],
        picks: { title: "Aftershaves and balms {region}", match: "aftershave|after shave", limit: 8 },
      },
    ],
  },
  {
    slug: "womens-perfumes-every-store-stocks-priced",
    title: "The women's perfumes every store stocks, priced at the cheapest one",
    short: "Women's perfumes, priced",
    description: "J'adore, Coco Mademoiselle, Good Girl, La Vie Est Belle, Black Opium, Libre, Miss Dior, Flowerbomb: the women's fragrances the most stores carry, at the cheapest store in your country today.",
    date: "2026-11-06",
    art: "women",
    sections: [
      {
        p: [
          "The women's bestsellers are the bottles with the most stores competing on them, so they are where comparing pays most. We match every listing by the barcode printed on the box, so each row below is the exact concentration and size at every store that has it in stock, cheapest first, in your own currency and never converted.",
          "The concentrations matter more here than anywhere: Coco Mademoiselle exists as an eau de toilette, an eau de parfum, an intense and a parfum; Black Opium has a dozen flankers. Read the row's name, not just the brand.",
        ],
      },
      {
        h: "The designer bestsellers",
        p: ["Dior, Chanel, Carolina Herrera, Lancôme, Yves Saint Laurent, Viktor & Rolf, Marc Jacobs and Mugler: the names the most stores stock in every country we compare."],
        picks: { title: "The women's bestsellers {region}", match: "j'adore|jadore|coco mademoiselle|good girl|la vie est belle|black opium|libre|miss dior|chance|flowerbomb|daisy|alien|my way|\\bs[iì]\\b|olymp[eé]a|light blue|idole|idôle|la nuit tr[eé]sor|mon guerlain|scandal|paradoxe|bombshell|cloud|angel", cat: "women", limit: 12 },
      },
      {
        h: "The niche favourites",
        p: ["Baccarat Rouge 540, Delina, Lost Cherry, Gypsy Water and the Jo Malone colognes are where a cheaper store saves the most, and many are sold for anyone, so look in the [unisex section](/unisex) too."],
        picks: { title: "Niche favourites {region}", match: "baccarat rouge|delina|lost cherry|gypsy water|bal d'afrique|jo malone|santal 33|another 13|rose prick|valaya|oriana|cassili", limit: 10 },
      },
      {
        h: "Body mists and the rest of the line",
        p: ["The same scent as a body mist, lotion or hair mist is a fraction of the price of the eau de parfum, and it is what most people actually wear every day. Those are in the [body section](/body)."],
        picks: { title: "Mists and lotions {region}", match: "body mist|body lotion|hair mist|body cream|shower gel", cat: "body", limit: 8 },
      },
    ],
  },
  {
    slug: "eau-de-parfum-vs-eau-de-toilette",
    title: "Eau de parfum or eau de toilette: which one to buy, and what each costs",
    short: "EDP vs EDT",
    description: "The difference between parfum, eau de parfum, eau de toilette and eau de cologne is concentration, not quality. Which lasts longer, which is better value, and the same scents in both, priced at the cheapest store in your country.",
    date: "2026-11-08",
    art: "unisex",
    sections: [
      {
        p: [
          "The letters on a box describe how much fragrance oil is in the alcohol. Roughly: an eau de cologne is the lightest, an eau de toilette (EDT) sits around five to fifteen per cent, an eau de parfum (EDP) around fifteen to twenty, and a parfum or extrait above that. Houses do not publish exact figures and the ranges overlap, so treat them as a ladder, not a measurement.",
          "What that means for you: an EDP usually lasts longer on skin and projects less sharply than the EDT of the same name, and it costs more per bottle. But an EDT is not a watered-down EDP. Many houses write a different formula for each (Dior's Sauvage EDT and EDP are noticeably different scents), so the one you like is the one to buy, whatever its letters.",
          "On price, the honest rule is per millilitre: a 100 ml EDT often costs about what a 50 ml EDP does. If you wear one scent every day, the bigger EDT bottle is better value; if you wear a scent for an evening, the EDP's longevity is what you are paying for.",
        ],
      },
      {
        h: "Eau de toilette: the most-stocked bottles",
        p: ["The EDTs the most stores in your country carry, cheapest store first."],
        picks: { title: "Eau de toilette {region}", match: "eau de toilette|\\bedt\\b", limit: 10 },
      },
      {
        h: "Eau de parfum: the most-stocked bottles",
        p: ["The EDPs the most stores carry. Compare the same name against the table above to see what the concentration adds to the price."],
        picks: { title: "Eau de parfum {region}", match: "eau de parfum|\\bedp\\b", limit: 10 },
      },
      {
        h: "Parfum, extrait and elixir",
        p: ["The top of the ladder, sold in smaller bottles. These are where a price gap between stores is largest in money terms, so check every store before you buy one."],
        picks: { title: "Parfum and extrait {region}", match: "parfum\\b(?!.*eau de parfum)|extrait|elixir|absolu|intense", limit: 8 },
      },
    ],
  },
  {
    slug: "fragrance-gift-sets-priced",
    title: "Fragrance gift sets: when the box is cheaper than the bottle",
    short: "Gift sets, priced",
    description: "A house's own gift set often costs the same as the bottle inside it, with a travel spray or a lotion thrown in. The sets the most stores stock, priced at the cheapest store in your country, and how to tell a real set from a shop bundle.",
    date: "2026-11-12",
    art: "sets",
    sections: [
      {
        p: [
          "Every November the houses box their bestsellers with a travel spray, a shower gel or a body lotion, and the set is often priced at or near the full-size bottle alone. That makes the set the cheapest way to buy the bottle, as long as it is the house's own set: it has its own barcode, its own box, and the same contents at every store.",
          "A shop-made bundle is different: two products the store put together under one price, carrying only one of the barcodes. We leave those out, so every row below is a boxed set the house itself sells, compared across stores on the same barcode.",
        ],
      },
      {
        h: "The most-stocked gift sets",
        p: ["Cheapest store first. The size in the name is the main bottle; the set's extras are in the store's listing."],
        picks: { title: "Fragrance gift sets {region}", match: ".", cat: "sets", limit: 12 },
      },
      {
        h: "Sets for men",
        p: ["Aftershave balm and shower gel sets are the ones most often cheaper than the bottle alone."],
        picks: { title: "Men's gift sets {region}", match: "men|homme|him|sauvage|bleu|eros|le male|million|acqua di gi|invictus|boss|armani code", cat: "sets", limit: 8 },
      },
      {
        h: "Before you buy",
        p: ["Check the set's bottle size against the full bottle in the same section: a set with a 50 ml is not a deal against a 100 ml. And a set that is the same price as the bottle on one store may be dearer than the bottle on another; the [women's](/women) and [men's](/men) sections show the bottle alone."],
      },
    ],
  },
  {
    slug: "travel-sprays-and-minis-priced",
    title: "Travel sprays and minis: the cheapest way to own a scent you cannot afford",
    short: "Travel sprays and minis",
    description: "A house's own 7.5 ml, 10 ml or 15 ml bottle is a real product with a barcode, unlike a decant. The travel sizes the most stores stock, priced at the cheapest store in your country, and why we never list decants.",
    date: "2026-11-15",
    art: "minis",
    sections: [
      {
        p: [
          "A travel spray is the house's own small bottle: a 7.5 ml Chanel, a 10 ml Dior, a 15 ml Tom Ford, boxed, barcoded and sold at every store that stocks the big one. It costs more per millilitre than the 100 ml, but it is the only way to own a Creed or a Kilian for the price of a dinner, and it is what most people actually carry.",
          "A decant is something else: a shop pouring a big bottle into its own vials. It can be perfectly honest, but it has no barcode, no box and no guarantee of what is in it, so ScentCompare never lists decants, samples or testers. Every row here is the brand's own miniature.",
        ],
      },
      {
        h: "The most-stocked travel sizes",
        p: ["Cheapest store first, in your own currency."],
        picks: { title: "Travel sprays and minis {region}", match: ".", cat: "minis", limit: 12 },
      },
      {
        h: "Niche houses in small bottles",
        p: ["Where the small bottle makes the most sense: a 30 ml Creed, a 35 ml Maison Francis Kurkdjian, a 15 ml Parfums de Marly."],
        picks: { title: "Niche minis {region}", match: "creed|kurkdjian|parfums de marly|kilian|xerjoff|tom ford|le labo|byredo|initio|amouage", cat: "minis", limit: 8 },
      },
    ],
  },
  {
    slug: "lattafa-armaf-arabic-perfumes-priced",
    title: "Lattafa, Armaf and the Arabic houses: the budget bottles people buy instead",
    short: "Lattafa, Armaf and friends",
    description: "Lattafa, Armaf, Rasasi, Afnan and Al Haramain sell long-lasting fragrances at a fraction of designer prices, and the stores that carry them price them very differently. The most-stocked bottles at the cheapest store in your country.",
    date: "2026-11-18",
    art: "unisex",
    sections: [
      {
        p: [
          "The Arabic houses are the fastest-growing shelf in every fragrance store we read. Lattafa's Khamrah and Asad, Armaf's Club de Nuit, Afnan's 9pm and Rasasi's Hawas sell for a quarter of a designer bottle and are famous for lasting all day. Many are openly built in the style of a famous scent; they are real products of real houses with their own barcodes, which is why they are here, while the \"inspired by\" oils and clones sold under a designer's name are not.",
          "Because they are cheap, the price gap between stores is often bigger in percentage than for a designer bottle: a bottle that is US$30 at one store and US$45 at another is a 50% gap. Check the row before you pay.",
        ],
      },
      {
        h: "Lattafa",
        p: ["Khamrah, Asad, Yara, Fakhar, Ameer Al Oudh and the Raghba line: the most-stocked Lattafa bottles, cheapest first."],
        picks: { title: "Lattafa {region}", match: "lattafa", limit: 10 },
      },
      {
        h: "Armaf, Afnan, Rasasi and Al Haramain",
        p: ["Club de Nuit, 9pm, Hawas and Amber Oud, the ones people buy first."],
        picks: { title: "Armaf, Afnan, Rasasi, Al Haramain {region}", match: "armaf|afnan|rasasi|al haramain|ajmal|swiss arabian|ard al zaafaran", limit: 10 },
      },
      {
        h: "Oud for the rest of us",
        p: ["The Arabic houses are also the cheapest way into oud. Our [oud guide](/blog/oud-fragrances-guide) covers the whole ladder, from these to Tom Ford and Kilian."],
      },
    ],
  },
  {
    slug: "black-friday-perfume-2026",
    title: "Black Friday perfume 2026: how to tell a real discount from a usual price",
    short: "Black Friday perfume",
    description: "Fragrance is one of the most-discounted things on Black Friday, and also one of the most faked discounts. How to use a product's price history and every store's price to know what a bottle really costs, and what to buy first.",
    date: "2026-11-14",
    art: "sets",
    sections: [
      {
        p: [
          "Black Friday is 27 November 2026 and Cyber Monday 30 November. Fragrance stores lean on it harder than almost any other category, because a bottle's full price is high and a 40% sticker is easy to print. The catch is that the sticker is against a recommended price few stores ever charge, so a \"40% off\" bottle is often the price it was on an ordinary Tuesday at a different store.",
          "ScentCompare reads every store every day and keeps each product's price history, so a product page shows two things a sale banner does not: the cheapest store today, and what that bottle has cost over the past weeks. A real Black Friday price is one that is below the bottle's own history, not just below the number printed next to it.",
          "What to buy first, in our view: the gift sets, which are made for this week and genuinely cheaper than the bottle inside; the big 100 ml and 150 ml bottles of a scent you already wear, which the discounters compete hardest on; and anything niche that rarely goes on sale, if it does.",
        ],
      },
      {
        h: "The bestsellers to watch",
        p: ["The bottles the most stores stock in your country, cheapest first today. Open a row's product page for its price history before the sales start, so you know its real price."],
        picks: { title: "Bestsellers {region}", match: ".", limit: 12 },
      },
      {
        h: "Gift sets",
        p: ["The houses' own sets, which are the week's genuine bargains more often than the bottles."],
        picks: { title: "Gift sets {region}", match: ".", cat: "sets", limit: 8 },
      },
      {
        h: "The one rule",
        p: ["Prices are each store's own, in your own currency, never converted and never including delivery. [Today's biggest savings](/deals) lists the bottles with the widest gap between stores right now, which is where a sale actually is."],
      },
    ],
  },
  {
    slug: "oud-fragrances-guide",
    title: "Oud fragrances: from a Lattafa to a Tom Ford, priced at the cheapest store",
    short: "Oud fragrances guide",
    description: "What oud is, why real oud is rare, and the oud fragrances at every price, from the Arabic houses to Tom Ford, Kilian and Maison Francis Kurkdjian, at the cheapest store in your country today.",
    date: "2026-11-16",
    art: "unisex",
    sections: [
      {
        p: [
          "Oud is the resinous heartwood of agarwood trees that have been infected by a mould, and real oud oil is among the most expensive raw materials in perfumery. Almost no bottle under a few hundred dollars contains much of it; what most \"oud\" fragrances use is a reconstruction, which is not a flaw, just a fact worth knowing when a label says oud and the price says otherwise.",
          "The ladder runs from the Arabic houses (Lattafa, Rasasi, Al Haramain, Ajmal), where oud is a house style and a bottle costs the same as a lunch, through designer ouds (Tom Ford Oud Wood, Armani Privé Oud Royal, Dior's Oud Ispahan) to niche (Kilian, Maison Francis Kurkdjian, Xerjoff, Amouage). Most are sold for anyone, so they are in our [unisex section](/unisex).",
        ],
      },
      {
        h: "Oud under US$60",
        p: ["The Arabic houses' ouds the most stores stock."],
        picks: { title: "Affordable oud {region}", match: "oud", limit: 10 },
      },
      {
        h: "Designer and niche oud",
        p: ["Where the price gap between stores is largest in money terms."],
        picks: { title: "Designer and niche oud {region}", match: "oud wood|oud ispahan|oud royal|oud satin|oud silk|oud for greatness|oud minerale|interlude|black afgano|oud stars|oud ousse|royal oud|kurkdjian.*oud|kilian.*oud|xerjoff.*oud|amouage.*oud", limit: 10 },
      },
    ],
  },
  {
    slug: "body-mists-vs-perfume",
    title: "Body mist or perfume: what you are paying for, and when the mist is enough",
    short: "Body mist or perfume",
    description: "A body mist is lighter, cheaper and reapplied; a perfume lasts. Which to buy for what, and the mists and sprays the most stores stock, at the cheapest store in your country.",
    date: "2026-11-22",
    art: "body",
    sections: [
      {
        p: [
          "A body mist (or body spray, brume, fragrance mist) is a lightly scented water-and-alcohol spray, usually two to four per cent fragrance, sold in a big bottle for a small price. It lasts an hour or two and is meant to be reapplied; a perfume at ten times the concentration lasts a day. They are not competing products so much as a daytime habit and an occasion.",
          "Where the mist wins: the scent you want to wear to the gym, to bed, to work in a shared office, or simply every day without thinking about cost. Where it does not: anything you want someone to notice at dinner. The sweet spot many people land on is the mist of the scent they own as an eau de parfum, which the houses sell precisely for that reason.",
        ],
      },
      {
        h: "The most-stocked body mists",
        p: ["Cheapest store first. Sizes run large (200 to 250 ml is usual), so compare per bottle, not per millilitre, against a perfume."],
        picks: { title: "Body mists and sprays {region}", match: "mist|body spray|brume", cat: "body", limit: 12 },
      },
      {
        h: "Lotions, shower gels and hair mists",
        p: ["The rest of a house's line is the cheapest way to layer a scent so it lasts longer than the mist alone."],
        picks: { title: "Lotions and gels {region}", match: "lotion|shower|gel|cream|hair", cat: "body", limit: 8 },
      },
    ],
  },
  {
    slug: "vanilla-and-gourmand-perfumes-priced",
    title: "Vanilla and gourmand perfumes: the sweet bestsellers, priced at the cheapest store",
    short: "Vanilla and gourmand",
    description: "Vanilla, cherry, caramel and praline fragrances are the most-searched scent family right now. The most-stocked sweet perfumes at the cheapest store in your country, from Lattafa Khamrah to Tom Ford Lost Cherry.",
    date: "2026-11-26",
    art: "women",
    sections: [
      {
        p: [
          "Gourmand is the family of scents built to smell edible: vanilla, caramel, praline, cherry, coffee, tonka. It is the family the stores we read stock most heavily right now, at every price, and it is one where the cheap bottle and the dear one really do share a style, so the ladder is worth climbing from the bottom.",
          "At the bottom, Lattafa's Khamrah and Yara and Ariana Grande's Cloud. In the middle, Yves Saint Laurent's Black Opium, Mugler's Angel and Alien, Prada's Candy, Carolina Herrera's Good Girl and Kayali's Vanilla 28. At the top, Tom Ford's Lost Cherry and Tobacco Vanille, Kilian's Angels' Share and Maison Francis Kurkdjian's Baccarat Rouge 540, which is sweeter than its reputation.",
        ],
      },
      {
        h: "The sweet bestsellers",
        p: ["Cheapest store first, in your own currency."],
        picks: { title: "Vanilla and gourmand {region}", match: "vanill|gourmand|cherry|caramel|praline|khamrah|yara|cloud|black opium|angel|alien|candy|good girl|angels' share|baccarat rouge|tobacco vanille|lost cherry|vanilla 28", limit: 12 },
      },
      {
        h: "Cherry, specifically",
        p: ["The scent of 2026 in our stores' catalogues: Lost Cherry, Electric Cherry, Cherry Smoke, Yara and the cherry mists."],
        picks: { title: "Cherry fragrances {region}", match: "cherry", limit: 8 },
      },
    ],
  },
];
