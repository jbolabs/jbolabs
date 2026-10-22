# Maintained Mailflare fork

## Decision

Mailflare application changes belong to the JBO-owned `jbolabs/mailflare` fork. This repository keeps it as a pinned `mailflare/` git submodule and owns the installation's infrastructure in `stacks/mail.ts`. Publishing changes to `hieunc229/mailflare` is optional and is not part of our implementation or release process.

Keep the existing application toolchain separate from the studio site's Bun workspace. The fork preserves upstream history and licensing, supports Cloudflare and Node, and can import upstream fixes through reviewed merges. We do not copy its application into `apps/` or make infrastructure changes outside Alchemy.

## Update and release

1. Implement and verify a PR against `jbolabs/mailflare:main`. Its CI checks OAuth, backup and admin integration behavior, TypeScript, and both production builds without credentials.
2. After merging it, update the submodule URL/pin here through a separate PR. Mirror any changed runtime bindings in `stacks/mail.ts` and review the Alchemy plan.
3. Deploy Mailflare only with explicit operator authorization. A source merge or submodule-pin merge does not deploy Mailflare. Apply pending migrations through the existing operator-controlled database update flow.

The fork disables its inherited dashboard tree-replacement workflow, which could otherwise erase maintained features. Import upstream by merging selected revisions into the fork, never by resetting its main branch or replacing its tracked tree.

## Initial change

The OAuth implementation starts from upstream `4738250` (v0.5.2), replacing the previously pinned `83ade98` (v0.5.0). It adds browser consent, scoped mailbox access, PKCE, optional offline access, revocation and connected-app management. Existing browser send approval remains required. The newer upstream baseline also adds a device-login rate limiter, mirrored in the Alchemy bindings.

See the fork's `JBO-FORK.md` and `docs/mcp-oauth.md` for its source workflow and protocol details. No upstream contribution or production deployment is implied by this decision.
