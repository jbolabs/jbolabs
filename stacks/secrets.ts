/**
 * The only place that knows where secrets come from: the Infisical project
 * ids, the CI identity, and the stage → source mapping
 * (docs/adr/0002-infisical-secrets.md). One project per trust tier, because
 * the free plan's only access boundary is the project.
 *
 * - `prod` and `shared` (the studio domain) read `jbolabs-prod`/`prod`.
 * - `pr-*` stages, and any non-production stage running in GitHub Actions,
 *   read nothing from Infisical: no PR job may hold an Infisical identity.
 * - Everything else (local `dev_*`, named previews) reads `jbolabs-dev`/`dev`.
 */
import * as Infisical from "alchemy/Infisical";
import type { SecretsContext } from "alchemy/Secrets";

/** Infisical project ids: `jbolabs-dev` (env `dev`) and `jbolabs-prod` (env `prod`). */
export const infisical = {
  dev: "c67ee6b5-31a8-41ac-ad0b-69740dfd2808",
  prod: "1c276d13-9f86-4b7e-9248-5d2cf041f06e",
} as const;

/**
 * `ci-prod`: the machine identity CI logs in as with GitHub OIDC. It trusts
 * only jobs in the `production` GitHub environment (`stacks/github.ts`).
 */
export const ciProd = {
  identityId: "23fa16cc-a7a1-4e35-8011-2f24b0e037ba",
  oidcAudience: "https://github.com/jbolabs",
} as const;

export type SecretSource = keyof typeof infisical;

const productionStages: ReadonlySet<string> = new Set(["prod", "shared"]);

/** Which Infisical project a stage reads, or `undefined` for none. */
export const secretSource = (
  stage: string,
  inGitHubActions: boolean
): SecretSource | undefined => {
  if (productionStages.has(stage)) {
    return "prod";
  }
  if (stage.startsWith("pr-") || inGitHubActions) {
    return undefined;
  }
  return "dev";
};

/** The value for a stack's `secrets` option. */
export const stageSecrets = ({ stage }: SecretsContext) => {
  // Not a secret: GitHub sets it on every Actions runner.
  const source = secretSource(stage, process.env.GITHUB_ACTIONS === "true");
  return source === undefined
    ? []
    : [Infisical.Secrets({ environment: source, project: infisical[source] })];
};
