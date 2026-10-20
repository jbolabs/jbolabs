/**
 * Runs a command with the `jbolabs-dev` Infisical project's `dev` secrets in
 * its environment, so agents and fresh worktrees need no `.env`. Stacks read
 * them through `siteSecrets()`, whose process-environment layer wins over any
 * `.env`.
 *
 *   bun run with-secrets -- bun run plan:studio
 *
 * Auth: an existing `INFISICAL_TOKEN`, else a Universal Auth login with
 * `INFISICAL_CLIENT_ID`/`INFISICAL_CLIENT_SECRET` (the `agent-dev` identity).
 * The token is passed to the child through the environment, never printed.
 *
 * Dev only, by construction: the project id comes from `.infisical.json` and
 * the environment is fixed. Prod/preview values live in `jbolabs-prod`, which
 * agents cannot read (docs/adr/0002-infisical-secrets.md).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { Schema } from "effect";

const DEV_ENVIRONMENT = "dev";

const root = path.join(import.meta.dirname, "..");

const InfisicalConfig = Schema.Struct({ workspaceId: Schema.NonEmptyString });
const decodeConfig = Schema.decodeUnknownSync(
  Schema.fromJsonString(InfisicalConfig)
);

/** The dev project id, kept in one place: the committed `.infisical.json`. */
export const devProjectId = (repoRoot: string): string =>
  decodeConfig(readFileSync(path.join(repoRoot, ".infisical.json"), "utf-8"))
    .workspaceId;

const present = (value: string | undefined): value is string =>
  value !== undefined && value !== "";

const accessToken = (env: NodeJS.ProcessEnv): string => {
  if (present(env.INFISICAL_TOKEN)) {
    return env.INFISICAL_TOKEN;
  }
  const clientId = env.INFISICAL_CLIENT_ID;
  const clientSecret = env.INFISICAL_CLIENT_SECRET;
  if (!(present(clientId) && present(clientSecret))) {
    throw new Error(
      "Set INFISICAL_TOKEN, or INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET (agent-dev Universal Auth)."
    );
  }
  return execFileSync(
    "infisical",
    [
      "login",
      "--method=universal-auth",
      `--client-id=${clientId}`,
      `--client-secret=${clientSecret}`,
      "--silent",
      "--plain",
    ],
    { encoding: "utf-8", stdio: ["ignore", "pipe", "inherit"] }
  ).trim();
};

if (import.meta.main) {
  const command = process.argv.slice(2);
  if (command.length === 0) {
    process.stderr.write(
      "Usage: bun run with-secrets -- <command> [args...]\n"
    );
    process.exit(2);
  }
  const result = spawnSync(
    "infisical",
    [
      "run",
      `--projectId=${devProjectId(root)}`,
      `--env=${DEV_ENVIRONMENT}`,
      "--silent",
      "--",
      ...command,
    ],
    {
      env: { ...process.env, INFISICAL_TOKEN: accessToken(process.env) },
      stdio: "inherit",
    }
  );
  process.exit(result.status ?? 1);
}
