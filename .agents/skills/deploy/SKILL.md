---
name: deploy
description: Deploy, preview, tear down, or rotate credentials for anything in this repo (the jbolabs site, the studio domain, Mailflare, CI). Use for any deploy, preview stage, cleanup, or CI credential question.
---

# Deploy

Always get Jake's go-ahead before deploying or destroying anything.

**Alchemy is the only way infrastructure changes.** Resources, their settings, and their data change only through a stack (`apps/jbolabs/alchemy.run.ts`, `stacks/`) and `alchemy deploy`/`destroy`. Never use the dashboard, Cloudflare MCP write tools, `wrangler`, or raw API calls to create, edit, or delete anything, including rows in a stage's D1. Reading (listing resources, `SELECT` queries, logs) is fine. If something needs to change, change the stack and redeploy.

## The site

| Stage | How | When |
| --- | --- | --- |
| `dev-<worktree>` | `bun run app -- start` | Local, emulated, any time |
| `pr-<n>` | CI on same-repo PRs labeled `preview` | Destroyed on label removal or PR close |
| named preview | `cd apps/jbolabs && ALCHEMY_PROFILE=admin bun alchemy deploy --stage <name>` | Ad-hoc demos; destroy when done |
| `prod` | CI on merge to `main` only | The stack refuses prod outside CI |

```bash
cd apps/jbolabs
ALCHEMY_PROFILE=admin bun alchemy plan --stage <stage>      # read-only diff first
ALCHEMY_PROFILE=admin bun alchemy deploy --stage <stage>
ALCHEMY_PROFILE=admin bun alchemy destroy --stage <stage>   # non-prod buckets are force-emptied
bun run app -- smoke --url "$(bun ../../scripts/ci/origin.ts <stage>)"
```

When a deployed stage misbehaves, read its logs (`ALCHEMY_PROFILE=admin bun alchemy logs --stage <stage> --since 1h`), fix the cause in code, and redeploy.

## Studio domain (from a shell, with go-ahead)

```bash
ALCHEMY_PROFILE=admin bun run plan:studio && ALCHEMY_PROFILE=admin bun run deploy:studio
```

Mailflare's runtime, production plan and deployment live in `jbolabs/mailflare`. Follow [the ownership handoff](../../../docs/adr/0004-mailflare-runtime-ownership.md). Never deploy or destroy its existing `mail` / `prod` stack from this repository.

## CI control plane (once, then to rotate)

```bash
ALCHEMY_PROFILE=admin bun run deploy:github   # environments, ruleset, preview label, deploy + analytics tokens
```

Rotate deploy tokens: bump `deployTokens.generation` in `stacks/config.ts`, redeploy `stacks/github.ts`.

## Restore

D1 Time Travel: `bunx wrangler d1 time-travel restore <database> --timestamp <iso>`. Older than 30 days: gunzip a `Backups` bucket dump and `bunx wrangler d1 execute <database> --remote --file restore.sql`.
