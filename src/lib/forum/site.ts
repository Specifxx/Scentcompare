// ScentCompare's forum settings (the rules are in ./core.ts, docs/forum.md).
import type { ForumSite } from "./core";

export const FORUM_SITE: ForumSite = {
  site: "scentcompare",
  siteName: "ScentCompare",
  repo: "Specifxx/scentcompare",
  hosts: ["scentcompare.app", "www.scentcompare.app"],
  base: "/forum",
  topic: "fragrance",
  intro: "Swap fragrance wardrobes, product finds and good prices with other fragrance lovers.",
  categories: [
    {
      "key": "wardrobe",
      "name": "Scents & recommendations",
      "blurb": "Your signature scent, what to try next and what got the compliments.",
      "prompts": [
        "Your signature scent right now?",
        "A bottle you would repurchase forever?"
      ]
    },
    {
      "key": "deals",
      "name": "Deals & where to buy",
      "blurb": "Good prices you spotted, store experiences and shipping times.",
      "prompts": [
        "Which store shipped fastest to you?",
        "Best perfume price you found this month"
      ]
    },
    {
      "key": "men",
      "name": "Men's cologne",
      "blurb": "Office scents, date-night bottles, summer and winter picks.",
      "prompts": [
        "Best cologne for the office that won't choke the room?",
        "A winter scent that lasts all day?"
      ]
    },
    {
      "key": "niche",
      "name": "Niche & Arabic houses",
      "blurb": "Creed, MFK, Le Labo, Lattafa, Armaf and the rest: worth the money, or not?",
      "prompts": [
        "Which Lattafa is actually worth it?",
        "Is a niche bottle ever worth three designer ones?"
      ]
    },
    {
      "key": "site",
      "name": "Site feedback",
      "blurb": "Ideas, bugs or a store we should add.",
      "prompts": [
        "A store we should compare"
      ]
    }
  ],
  reserved: ["scentcompare", "scent compare"],
};
