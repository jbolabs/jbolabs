# Mailflare owns its installation and releases

## Decision

`jbolabs/mailflare` owns the inbox application, its production workflow and the entire existing Alchemy `mail` stack at stage `prod`: Worker/custom domain, D1, bucket, queues, runtime token and Mailflare-specific mail routing/sending configuration. `jbolabs/jbolabs` owns the studio website and the `studio` / `shared` registrar, zone, sending subdomain and verified forwarding destination.

This supersedes the submodule/release arrangement in ADR 0003. Application releases no longer require a submodule-pin PR. The legacy `mailflare:build`, `plan:mail` and `deploy:mail` commands deliberately fail with the destination repository. Do not recreate the stack, import a second copy, or run destroy from this repository.

## State-preserving handoff

Moving a source file between repositories does not transfer or delete infrastructure. The destination must use the same Cloudflare account/state store, stack `mail`, stage `prod`, resource IDs, physical names, bindings and Alchemy version. Repository location is not part of the remote state key. Keep the complete stack together; splitting resources between new stack names would require a separate state migration.

1. Merge the destination infrastructure PR in `jbolabs/mailflare` first. Its production workflow remains disabled until an explicitly authorized cutover; no production credentials are available to PR jobs.
2. On the operator machine, inspect the destination's read-only production plan using the existing Alchemy `admin` profile and `--no-input`. Stop on any create, replacement or deletion of existing mail resources, or a request to bootstrap/upgrade the state store. Never approve a fresh state store or export state/secrets into Git.
3. Compare the old and new plans on the same application revision. An intended Worker code update is separate from the ownership move; database, bucket, queue and Durable Object identities must remain unchanged. Check the existing inbox, inbound mail and OAuth before and after the eventual authorized deployment.
4. Merge this parent retirement PR only after the destination is available and its plan has been checked. Retiring source here is not a cloud destroy. The submodule is removed from the index; local clones containing uncommitted work must be preserved by their owners.
5. Separately authorize the destination CI control-plane bootstrap and deployment enablement. Then production releases run directly from the fork. Keep the same runtime migration process: apply pending D1 migrations through Mailflare's existing operator-controlled update flow.

Rollback before cutover: revert the retirement PR, restore the old tracked stack/submodule, and leave destination deployments disabled. After cutover, first disable destination deployments and ensure only one release owner is active, then restore the old entry point against the same state. Never destroy either stack to roll back.

## Concurrent work

Mailflare PR #2 is merged. Parent PR #19 pins that merged permissions fix and can remain a transitional release; do not close it automatically. Mailflare PR #3 adds Drive/documents and is independent of the infrastructure move. Its UI audit remains on its own branch. Reconcile the production revision deliberately during cutover; the ownership change does not authorize merging or deploying either application PR.
