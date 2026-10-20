# 2. Secrets: Infisical projects per trust tier, `.env` for dev only

- Status: accepted
- Date: 2026-10-20

## Context

Stacks read secrets through Alchemy's `secrets` option. `siteSecrets()` (cloudflare-kit) loads the main checkout's gitignored `.env`, then the process environment, which always wins. CI gets GitHub environment secrets that `stacks/github.ts` mints. Agents in fresh worktrees or sandboxes often have no `.env`, so they had no way to get even dev values.

The Infisical free plan has no environment-scoped roles, so a project is the only access boundary.

## Decision

Two Infisical projects, one per trust tier:

| Project | Envs | Read by | Holds |
| --- | --- | --- | --- |
| `jbolabs-dev` (`c67ee6b5-31a8-41ac-ad0b-69740dfd2808`) | `dev` | `agent-dev` (Universal Auth), Jake | Development values only |
| `jbolabs-prod` (`1c276d13-9f86-4b7e-9248-5d2cf041f06e`) | `preview`, `prod` | `ci-prod` (GitHub OIDC, `main` only), Jake | Values deployed infrastructure is built from |

- **Agents** run commands with `bun run with-secrets -- <cmd>` (`scripts/with-dev-secrets.ts`). It reads the dev project id from the committed `.infisical.json`, fixes the env to `dev`, and logs in with `INFISICAL_CLIENT_ID`/`INFISICAL_CLIENT_SECRET` when `INFISICAL_TOKEN` is unset. The values reach the stack through the process environment, so no `.env` is needed, and they override one if present.
- **Operators** run shell deploys of the shared stacks with prod values:

  ```bash
  ALCHEMY_PROFILE=admin infisical run --projectId 1c276d13-9f86-4b7e-9248-5d2cf041f06e --env prod -- bun run deploy:studio
  ```

- **`.env`** in the main checkout stays a dev-only convenience. Never put a value there that only `jbolabs-prod` should hold.
- **CI** is unchanged for now: deploy jobs still read GitHub environment secrets.

## What `jbolabs-prod` needs

From the stacks as of this decision:

| Key | Env | Read by | Current source |
| --- | --- | --- | --- |
| `FORWARD_TO` | `prod` | `stacks/studio.ts` (`Config.String`, required) | main checkout `.env` (and `jbolabs-dev`) |
| `CF_ANALYTICS_API_TOKEN` | `prod` | site prod deploy, cloudflare-kit `webAnalytics` (optional; warns if missing) | `production` GitHub environment secret, minted by `stacks/github.ts` |

Not for Infisical:

- `CLOUDFLARE_API_TOKEN` (preview, prod) and `CF_ANALYTICS_API_TOKEN` are minted and rotated by `stacks/github.ts`. Copying them into Infisical by hand would break "GitHub never holds a token a human pasted". If CI moves to `ci-prod`, the stack should write them to `jbolabs-prod` instead of GitHub.
- `CLOUDFLARE_ACCOUNT_ID` is committed in `stacks/config.ts`.
- `stacks/mail.ts` reads no secrets. Mailflare's `CF_TOKEN` is minted in the stack. Its optional `.dev.vars.example` keys (Resend, SES, B2, S3, `GITHUB_UPDATE_*`, `AI_MODEL`) are unused.
- `stacks/github.ts` needs a GitHub login (`gh auth login` or `GITHUB_TOKEN`) and an Alchemy profile, both operator credentials, not stack values.
- The Turnstile secret is created per stage by the site stack. Local credentials come from `alchemy profile`. `CI` and `ALLOW_PROD_DEPLOY` are flags.

## Consequences

- An agent with only `agent-dev` credentials can run any dev-tier command without a `.env`.
- Leaking an agent's credentials exposes dev values only.
- Until CI moves to `ci-prod`, prod values live in two places: GitHub for CI, and `jbolabs-prod` for operator shells.
