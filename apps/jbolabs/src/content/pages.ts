/** Copy for the smaller pages: titles, intros, and body text. */
import type { CallToAction, Link, Prose } from "./types.ts";

const startProject: Link = { href: "/contact", label: "Start a project" };

export const about = {
  closing: {
    headline: "Let's build something *good.*",
    link: startProject,
  } satisfies CallToAction,
  description:
    "Jake Bodea runs JBO Labs from Irvine: websites, custom software, and AI tools for Orange County businesses.",
  intro:
    "A one-person studio in Orange County. Websites, custom software, and AI tools, all built by me.",
  // A draft in Jake's voice, from jakebodea.com: Jake to edit.
  prose: [
    {
      paragraph:
        "Hi, I'm Jake. I run JBO Labs from Irvine, building websites and software for local businesses. You work with me directly, from the first call to launch and long after.",
    },
    {
      paragraph:
        "Before going independent I built software in-house: websites, internal tools, and AI systems running in production every day. If it can be built, I would rather figure it out than say no.",
    },
    {
      paragraph:
        "I studied math, then AI at Stanford, where I now help teach two of its online machine learning courses. I keep up with this stuff so you do not have to.",
    },
    { heading: "How I like to work" },
    {
      paragraph:
        "Plain language, fixed prices, and no surprises. You always know what is being built, what it costs, and when it will be done.",
    },
    {
      paragraph:
        "I take on a small number of clients at a time, so every project gets my full attention.",
    },
    { heading: "Outside of work" },
    {
      paragraph:
        "I lead worship at my church, build my own products on the side, and go on as many adventures with my wife as she will put up with.",
    },
  ] satisfies Prose,
  title: "About",
};

export const workPage = {
  aside: {
    link: { href: "/products", label: "See my products" },
    text: "I also build and run software of my own.",
  },
  closing: {
    headline: "Your business *could be next.*",
    link: startProject,
  } satisfies CallToAction,
  description:
    "Websites Jake Bodea has built at JBO Labs for small businesses, from contractors and lenders to salons.",
  intro: "Every business is different, and so is every site.",
  items: [
    {
      body: "A portfolio-led site for a commercial contractor that has wired schools, offices, and warehouses since 2001. They add new projects themselves.",
      highlights: ["Project portfolio", "Edited by their team"],
      href: "https://accesselectricinc.com",
      kind: "Electrical contractor",
      name: "Access Electric",
      screenshots: {
        desktop: "/work/access-electric.webp",
        phone: "/work/access-electric-phone.webp",
      },
    },
    {
      body: "A warm, editorial site for a European master stylist in Irvine, with booking built in. Clients pick a service and a time, share photos of their hair, and the appointment shows up on her calendar.",
      highlights: ["Online booking", "Calendar sync", "Hair Q&A articles"],
      kind: "Hairstylist",
      name: "Ani Wenger",
      screenshots: {
        desktop: "/work/ani-wenger.webp",
        phone: "/work/ani-wenger-phone.webp",
      },
    },
    {
      body: "A fast, bilingual site for a home equity lender, with a live calculator that shows homeowners their estimated line before they apply. Their team edits the copy themselves.",
      highlights: [
        "English and Spanish",
        "Live calculator",
        "Online applications",
      ],
      href: "https://equityfast.homes",
      kind: "Home equity lender",
      name: "EquityFast",
      screenshots: {
        desktop: "/work/equityfast.webp",
        phone: "/work/equityfast-phone.webp",
      },
    },
    {
      body: "A calm, photo-first site for a woman-owned builder, with a full portfolio and a financing page for homeowners planning a remodel.",
      highlights: ["Photo portfolio", "Remodel financing"],
      kind: "Custom home builder",
      name: "MS Custom Homes",
      screenshots: {
        desktop: "/work/ms-custom-homes.webp",
        phone: "/work/ms-custom-homes-phone.webp",
      },
    },
  ],
  title: "Work",
};

export const productsPage = {
  closing: {
    headline: "Need something *built?*",
    link: startProject,
  } satisfies CallToAction,
  description:
    "Software Jake Bodea builds and runs at JBO Labs alongside client work, made with the same care as every client project.",
  intro:
    "Between client projects I build my own products. They get the same care as client work, and they keep my skills sharp.",
  title: "Products",
};

export const contact = {
  description:
    "Tell Jake about the website, software, or AI tool you need. A few details up front make the first conversation far more useful.",
  headline: "Let's build *something good.*",
  intro:
    "Tell me about your business and what you need. A few details now make our first conversation far more useful.",
  nextSteps: [
    "I read your note and reply within two business days.",
    "We have a short intro call to talk it through.",
    "You get a clear proposal with a fixed price.",
  ],
  title: "Start a project",
};

export const privacy = {
  description:
    "How the JBO Labs site handles cookieless analytics and the details you send through the intake form.",
  intro: "How this site handles analytics and the information you send.",
  prose: [
    {
      paragraph:
        "This site uses anonymous, cookieless analytics to understand which pages are useful. It does not set cookies, store identifiers in your browser, or build a profile of you.",
    },
    {
      paragraph:
        "When you send the intake form, I store what you enter (your name, email, company, website, project details, budget, timeline, and who referred you) so I can reply. I do not sell or share this information.",
    },
    {
      paragraph:
        "The form is protected by Cloudflare Turnstile, which checks that a person, not a bot, is submitting it.",
    },
    {
      paragraph:
        "To ask about or delete information you have sent, use the intake form and mention this page.",
    },
  ] satisfies Prose,
  title: "Privacy",
};
