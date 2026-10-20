# jbolabs

Everything for JBO Labs, Jake's own studio: the jbolabs.com website, the studio domain and its email, and the Mailflare inbox. Client sites live in `~/code/projects/sites`. Cloudflare Workers, deployed with Alchemy v2; server code is Effect 4.

## Map

| Path | What lives there |
| --- | --- |
| `apps/jbolabs/` | The jbolabs.com site (Astro, no CMS): `alchemy.run.ts` (stack `jbolabs`), `site.config.ts`, copy in `src/content/*.ts`, leads in D1. Imported from `sites` with its history |
| `stacks/studio.ts` | jbolabs.com registrar, zone, `mail.jbolabs.com` sending subdomain (the client sites send from it too), Email Routing. Stack `studio`, stage `shared` |
| `stacks/mail.ts` | Mailflare at inbox.jbolabs.com: Worker, D1, R2, queues, catch-all routing, apex sending + DMARC for each domain in `mailDomains`. Stack `mail`, stage `prod` |
| `stacks/github.ts` | CI control plane: GitHub environments, `main` ruleset, `preview` label, scoped deploy tokens. Stack `jbolabs-ci`, stage `ci` |
| `stacks/config.ts` | Account, repository, studio addresses, Mailflare host and domains |
| `mailflare/` | Upstream Mailflare as a git submodule, unmodified. Built with its own toolchain, uploaded with `bundle: false` |
| `packages/cloudflare-kit` | Effect server services, Web Analytics, Alchemy helpers. Forked from `sites` without its EmDash modules |
| `packages/control-app` | `bun run app -- …`: run, screenshot, record, smoke-test, SEO-audit the site |
| `packages/config` | tsconfig + strict oxlint/oxfmt presets + local lint rules |
| `scripts/` | Worktree setup and CI helpers |

`packages/*` came from the `sites` repo and are meant to become the shared `@jakebodea/*` toolkit: keep changes easy to port back, and never import from `apps/` into `packages/`.

## Commands

```bash
bun run app -- start        # alchemy dev for this worktree (own stage + port), warmed up (~15 s)
bun run app -- restart      # after server/island edits
bun run app -- smoke        # every sitemap page, 404, images, contact action, cron
bun run app -- seo          # technical SEO audit
bun run app -- screenshot / /contact      # full-page PNGs at 1280 and 375
bun run ci                  # lint (zero warnings) + typecheck + tests
bun run build               # credential-free production build of the site
bun run fix                 # format + autofix
ALCHEMY_PROFILE=admin bun run plan:studio | plan:mail | plan:github   # read-only diffs
```

The Alchemy profile comes from `ALCHEMY_PROFILE` (e.g. `ALCHEMY_PROFILE=admin`). See the `deploy` and `control-app` skills in `.agents/skills/`.

## Agent secrets (Infisical)

- Secrets come from Infisical through Alchemy (`Infisical.Secrets` in each stack). `stacks/secrets.ts` holds the project ids and maps stage → source: `prod` reads `jbolabs-prod`, `pr-*`/CI previews read nothing from Infisical, everything else reads `jbolabs-dev`.
- Who can read what: Alchemy `default` profile = `agent-dev` (`*-dev` only); `admin` profile = `operator` (all; the owner's Mac only, pass `--profile admin`); CI = `ci-prod` via GitHub OIDC, only in jobs using the `production` environment (main only).
- Agent setup, once per machine: export `INFISICAL_CLIENT_ID`/`INFISICAL_CLIENT_SECRET`, then `bun run setup:infisical`.
- Never add prod values to `jbolabs-dev`, never give a PR job the `production` environment, and never read secrets via `process.env` in stacks (use `Config`).
- `stacks/studio.ts` (stage `shared`, reads `FORWARD_TO`) also reads `jbolabs-prod`: plan and deploy it with `--profile admin` (`ALCHEMY_PROFILE=admin bun run plan:studio`). It is the only stack with `secrets: stageSecrets` today; the site, mail and github stacks read no Infisical values (`docs/adr/0002-infisical-secrets.md`).

## Never

- Never export `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` locally: use `alchemy profile`.
- Never deploy the site's `prod` from a shell. It deploys from CI on merge to `main`; the stack refuses otherwise.
- Never deploy, destroy, or change cloud resources without Jake's explicit go-ahead for that action.
- Never touch infrastructure outside Alchemy: no dashboard, `wrangler`, Cloudflare MCP write tools, or raw API writes. Mailflare's own runtime token (`CF_TOKEN`, minted in `stacks/mail.ts`) is the one exception: its domain onboarding writes the same settings `stacks/mail.ts` declares.
- Never rename the `studio` or `jbolabs` stacks or their stages: their state predates this repo.
- Never print or commit secrets, or keep them in `.env`: they live in Infisical, and stacks read them through `stacks/secrets.ts`.
- Never modify `mailflare/`. Update it with `git -C mailflare pull origin main`, mirror any new bindings from its `wrangler.jsonc` in `stacks/mail.ts`, then deploy.
- Never add `@cloudflare/vite-plugin`, wrangler config, or an Astro `adapter` to the site: Alchemy owns that.
- Never run Effect in islands. Islands are plain React; Effect stays on the server.
- Never disable a lint rule inline without a `-- reason`.

## Tests

Test behavior, not implementation. Assert a literal expected value from an independent source, never one recomputed the way the code computes it. Fake only real system boundaries. `packages/config/oxlint-plugin-test-quality.ts` enforces the mechanical cases.

## Definition of done

1. `bun run ci` passes (zero lint warnings).
2. Verify on the running site (`bun run app -- start`, then `smoke`, `seo`, `screenshot` at both widths for visible changes). For stacks, a clean `plan`.
3. Report what you verified and anything you could not.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
