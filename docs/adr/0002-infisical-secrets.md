# 2. Secrets: Infisical through Alchemy, one project per trust tier

- Status: accepted
- Date: 2026-10-20

## Context

Stacks used to read secrets through `siteSecrets()` (cloudflare-kit): the main checkout's gitignored `.env`, then the process environment. Worktrees got the `.env` as a symlink. Agents in sandboxes or fresh clones had no `.env` and no other way to get values. CI gets GitHub environment secrets that `stacks/github.ts` mints.

The Infisical free plan has no environment-scoped roles, so a project is the only access boundary.

## Decision

**Two Infisical projects, one per trust tier.**

| Project | Envs | Readers |
| --- | --- | --- |
| `jbolabs-dev` (`c67ee6b5-31a8-41ac-ad0b-69740dfd2808`) | `dev` | `agent-dev` (Universal Auth, agents' default Alchemy profile), `operator` |
| `jbolabs-prod` (`1c276d13-9f86-4b7e-9248-5d2cf041f06e`) | `preview`, `prod` | `ci-prod` (GitHub OIDC, `main` only), `operator` (Jake's `admin` profile) |

**Stacks read Infisical with Alchemy's native provider.** `stacks/secrets.ts` holds the ids and the stage mapping. `prod` and `shared` read `jbolabs-prod`/`prod`. Every other stage reads `jbolabs-dev`/`dev`. `stacks/secrets.test.ts` checks that PR preview stages never map to `jbolabs-prod`. A stack that reads secrets declares `secrets: stackSecrets()`. Alchemy loads the values into Effect Config, not `process.env`, and keeps the process environment as the last, winning layer.

**Credentials come from the Alchemy profile.** Alchemy mints a token on every run.

- Agents run `bun run setup:agent` once per machine. It adds `agent-dev` (from `INFISICAL_CLIENT_ID`/`INFISICAL_CLIENT_SECRET`) to the default profile.
- Jake's `admin` profile carries the `operator` identity, so operator commands are just `ALCHEMY_PROFILE=admin bun run plan:studio` or `deploy:studio`.
- In CI, Alchemy would use `INFISICAL_IDENTITY_ID` with the job's GitHub OIDC token. `INFISICAL_TOKEN` overrides all of these.

**No `.env`.** No stack needs one, so `scripts/setup-worktree.ts` no longer links it into worktrees. (The Alchemy CLI still reads a `.env` in the working directory for stacks without a `secrets` list, so keep none around.)

### Which stacks read what

| Stack | Deployed by | Reads | Source |
| --- | --- | --- | --- |
| `stacks/studio.ts` (`shared`) | operator shell | `FORWARD_TO` (required) | Infisical `jbolabs-prod`/`prod` |
| `apps/jbolabs` (`prod`) | CI on `main` | `CF_ANALYTICS_API_TOKEN` (optional; warns if missing) | process env: `production` GitHub environment secret minted by `stacks/github.ts` |
| `apps/jbolabs` (previews, local) | CI on labelled PRs, `alchemy dev` | nothing |  |
| `stacks/mail.ts` (`prod`) | operator shell | nothing; Mailflare's `CF_TOKEN` is minted in the stack |  |
| `stacks/github.ts` (`ci`) | operator shell | nothing; needs a GitHub login (`gh auth login` or `GITHUB_TOKEN`) |  |

The site stack declares no Infisical secrets on purpose. Its preview deploys run in CI under an identity that may not read `jbolabs-dev`, and they must never read `jbolabs-prod`. CI therefore needs no Infisical identity yet. The first CI-deployed stack that needs an Infisical value should add these to its `main`-only job: `INFISICAL_IDENTITY_ID` (the `ci-prod` id, as a GitHub variable written by `stacks/github.ts`), `INFISICAL_OIDC_AUDIENCE=https://github.com/jbolabs`, and `id-token: write`.

### What `jbolabs-prod` holds

- `prod`: `FORWARD_TO`.
- `preview`: nothing.

Not in Infisical:

- `CLOUDFLARE_API_TOKEN` and `CF_ANALYTICS_API_TOKEN` are minted and rotated by `stacks/github.ts`. Copying them in by hand would break "GitHub never holds a token a human pasted".
- `CLOUDFLARE_ACCOUNT_ID` is committed in `stacks/config.ts`.
- Mailflare's optional keys (Resend, SES, B2, S3, `GITHUB_UPDATE_*`, `AI_MODEL`) are unused.
- The Turnstile secret is created per stage by the site stack.

## Consequences

- An agent with only `agent-dev` credentials can run every dev-tier stack without a `.env`. It cannot plan or deploy `studio`, which needs `jbolabs-prod`.
- Leaked agent credentials expose dev values only.
- Prod values live in two places: Infisical for operator-deployed stacks, and GitHub for the tokens `stacks/github.ts` mints for CI.
