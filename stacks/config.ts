/**
 * Facts the jbolabs stacks are built from. Not secrets: account ids, zone
 * names and hostnames are visible to anyone who can resolve DNS.
 */

/** Same Cloudflare account as the sites repo (`sites/stacks/config.ts`). */
export const accountId = "984b82870acd18daf8bda97bad966b38";

/** This repository on GitHub; `stacks/github.ts` writes CI credentials into it. */
export const repository = {
  owner: "jbolabs",
  repository: "jbolabs",
} as const;

/**
 * CI deploy tokens are minted per generation. Bump `generation` to rotate: the
 * next `deploy:github` mints fresh tokens, writes them to GitHub, and deletes
 * the previous generation. Rotate before `expiresOn`.
 */
export const deployTokens = {
  expiresOn: "2027-10-05T23:59:59Z",
  generation: 1,
} as const;

/**
 * The studio domain. The jbolabs site (`apps/jbolabs`) and the client sites in
 * the `sites` repo send lead mail from `sender` and failure alerts to
 * `alertInbox`, which lands in Mailflare. `sites/stacks/config.ts` duplicates
 * these strings: keep the two in step.
 */
export const studio = {
  alertInbox: "alerts@jbolabs.com",
  domain: "jbolabs.com",
  sender: "sites@mail.jbolabs.com",
  sendingSubdomain: "mail.jbolabs.com",
} as const;
