/** Shapes of the copy in `src/content`, one per section component. */
export interface Link {
  readonly href: string;
  readonly label: string;
}

/** Icons the example site can draw; keep in step with `example-site.astro`. */
export const EXAMPLE_ICONS = [
  "fish",
  "wrench",
  "flower",
  "croissant",
  "scissors",
] as const;
export type ExampleIcon = (typeof EXAMPLE_ICONS)[number];

/** One made-up business the hero's example site can switch to. */
export interface ExampleBusiness {
  readonly kind: string;
  readonly name: string;
  readonly headline: string;
  readonly body: string;
  readonly cta: string;
  /** OKLCH hue of the business's brand color. */
  readonly hue: number;
  readonly icon: ExampleIcon;
}

/** The hero's editable demo site: default copy plus brand swatches. */
export interface HeroExample {
  /** Kept for content authors; the live editor no longer shows a business picker. */
  readonly prompt: string;
  readonly businesses: readonly ExampleBusiness[];
}

export interface Hero {
  readonly headline: string;
  readonly example?: HeroExample;
  readonly subheadline?: string;
  readonly primary?: Link;
  readonly secondary?: Link;
}

export interface Pillar {
  readonly title: string;
  readonly body: string;
}

/** The three promises under the hero, each with its own small illustration. */
export interface Pillars {
  readonly speed: Pillar;
  readonly editing: Pillar;
  readonly analytics: Pillar;
}

export interface ListItem {
  readonly title: string;
  readonly body: string;
}

/** Services (a two-by-two grid) and process (a timeline) share this shape. */
export interface ListSection {
  readonly headline: string;
  readonly intro?: string;
  readonly items: readonly ListItem[];
}

/** A client site, shown as its home page on a desktop and a phone. */
export interface WorkItem {
  readonly name: string;
  /** What the business is, e.g. "Custom home builder". */
  readonly kind: string;
  readonly body: string;
  /** Two to four short things the site does, e.g. "Online booking". */
  readonly highlights: readonly string[];
  /** Home page captures under `public/work/`: 1200x750 at 1280 wide, 600x1299 at 390 wide. */
  readonly screenshots: { readonly desktop: string; readonly phone: string };
  /** The live site, once it is on its own domain; without one it shows as launching soon. */
  readonly href?: string;
}

/** The `/work` page's list: client sites, then a quiet line pointing elsewhere. */
export interface WorkSection {
  readonly items: readonly WorkItem[];
  readonly aside?: { readonly text: string; readonly link: Link };
}

/** One of my own products. */
export interface Product {
  readonly name: string;
  readonly kind: string;
  readonly description: string;
  readonly status: "Live" | "Beta" | "Coming soon";
  readonly href?: string;
  /** A 16:10 screenshot of its landing page under `public/`. */
  readonly image?: string;
}

export interface FaqSection {
  readonly headline: string;
  readonly items: readonly {
    readonly question: string;
    readonly answer: string;
  }[];
}

export interface CallToAction {
  readonly headline: string;
  readonly body?: string;
  readonly link?: Link;
}

/** A page of plain prose: paragraphs, with optional subheadings. */
export type Prose = readonly (
  | { readonly heading: string }
  | { readonly paragraph: string }
)[];
