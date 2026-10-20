# 2. Secrets: Infisical through Alchemy, one project per trust tier

- Status: accepted
- Date: 2026-10-20

## Context

Stacks used to read secrets through `siteSecrets()` (cloudflare-kit): the main checkout's gitignored `.env`, then the process environment. Worktrees got the `.env` as a symlink. Agents in sandboxes or fresh clones had no `.env` and no other way to get values. CI gets GitHub environment secrets that `stacks/github.ts` mints.

The Infisical free plan has no environment-scoped roles, so a project is the only access boundary. This ADR follows the standard shared by every jbolabs repo.

## Decision

### Projects and identities

| Project | Envs | Readers |
| --- | --- | --- |
| `jbolabs-dev` (`c67ee6b5-31a8-41ac-ad0b-69740dfd2808`) | `dev` | `agent-dev`, `operator` |
| `jbolabs-prod` (`1c276d13-9f86-4b7e-9248-5d2cf041f06e`) | `preview`, `prod` | `ci-prod`, `operator` |

- **`agent-dev`** (Universal Auth) is the Alchemy `default` profile on agent machines. To set it up, export `INFISICAL_CLIENT_ID`/`INFISICAL_CLIENT_SECRET`, then run `bun run setup:infisical`.
- **`operator`** is Jake's `admin` profile, on his Mac only. Pass `--profile admin` or set `ALCHEMY_PROFILE=admin`.
- **`ci-prod`** (`23fa16cc-a7a1-4e35-8011-2f24b0e037ba`) logs in with GitHub OIDC, audience `https://github.com/jbolabs`. It trusts only `repo:jbolabs@305914027/*:environment:production`.

### `stacks/secrets.ts` is the only place with ids and the mapping

It exports `infisical` (the project ids), `ciProd` (the CI identity), and `stageSecrets` (the value for a stack's `secrets` option). It maps each stage to a source:

| Stage | Source |
| --- | --- |
| `prod`, and `shared` (the studio domain's only stage) | `jbolabs-prod` / `prod` |
| `pr-*`, and any other non-production stage in GitHub Actions | nothing from Infisical |
| everything else (local `dev_*`, named previews) | `jbolabs-dev` / `dev` |

`stacks/secrets.test.ts` proves that `pr-*` stages never map to `jbolabs-prod`. Alchemy loads the values into Effect Config, not `process.env`, so stacks read them with `Config`. The process environment stays the last, winning layer, so a CI-injected value still works.

### GitHub

`stacks/github.ts` manages exactly one environment for prod secrets: `production`, deployable from `main` only (`stacks/github.test.ts`). It writes two variables there:

- `INFISICAL_IDENTITY_ID`: the `ci-prod` id.
- `INFISICAL_OIDC_AUDIENCE`: `https://github.com/jbolabs`.

No CI job reads Infisical yet. A future job that reads `*-prod` must:

- declare `environment: production`;
- set `permissions: id-token: write`;
- pass `INFISICAL_IDENTITY_ID: ${{ vars.INFISICAL_IDENTITY_ID }}` and `INFISICAL_OIDC_AUDIENCE: ${{ vars.INFISICAL_OIDC_AUDIENCE }}` in its `env`.

No PR job ever gets the `production` environment.

### Which stacks read what

| Stack | Deployed by | `secrets` | Reads |
| --- | --- | --- | --- |
| `stacks/studio.ts` (`shared`) | operator, `--profile admin` | `stageSecrets` | `FORWARD_TO` (required), from `jbolabs-prod`/`prod` |
| `apps/jbolabs` (`prod`, `pr-*`, local) | CI, `alchemy dev` | none | `CF_ANALYTICS_API_TOKEN` on prod (optional), from the process env: a `production` GitHub secret minted by `stacks/github.ts` |
| `stacks/mail.ts` (`prod`) | operator | none | nothing; Mailflare's `CF_TOKEN` is minted in the stack |
| `stacks/github.ts` (`ci`) | operator | none | nothing; needs a GitHub login (`gh auth login` or `GITHUB_TOKEN`) |

The site stack does not use `stageSecrets` yet, even though `pr-*` previews would safely read nothing. Its prod deploy runs in CI. With `stageSecrets`, that deploy would need the `ci-prod` OIDC login above to succeed on every merge. That depends on the operator first deploying `stacks/github.ts` (for the variables) and on `ci-prod` trusting the `environment:production` subject. All of that risk would be taken for zero values, because the site reads nothing from Infisical. Switch it to `stageSecrets` together with the CI `env`/`id-token` change once it needs an Infisical value.

### What `jbolabs-prod` holds

- `prod`: `FORWARD_TO`.
- `preview`: nothing.

Not in Infisical:

- `CLOUDFLARE_API_TOKEN` and `CF_ANALYTICS_API_TOKEN` are minted and rotated by `stacks/github.ts`. Copying them in by hand would break "GitHub never holds a token a human pasted".
- `CLOUDFLARE_ACCOUNT_ID` is committed in `stacks/config.ts`.
- Mailflare's optional keys (Resend, SES, B2, S3, `GITHUB_UPDATE_*`, `AI_MODEL`) are unused.
- The Turnstile secret is created per stage by the site stack.

### No `.env`

No stack needs one, so `scripts/setup-worktree.ts` no longer links it, and there is no `.infisical.json`. The Alchemy CLI still reads a `.env` in the working directory for stacks without a `secrets` list, so keep none around.

## Consequences

- An agent with only `agent-dev` can run every dev-tier stack without a `.env`. It cannot plan or deploy `studio`, which needs `jbolabs-prod`.
- Leaked agent credentials expose dev values only.
- A PR job can never reach prod values: it has no Infisical source, and `ci-prod` trusts only the `main`-only `production` environment.
- Prod values live in two places: Infisical for operator-deployed stacks, and GitHub for the tokens `stacks/github.ts` mints for CI.
