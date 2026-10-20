/**
 * Where every stack's secrets come from: Infisical, through Alchemy's native
 * provider (docs/adr/0002-infisical-secrets.md). One project per trust tier,
 * because the free plan's only access boundary is the project.
 *
 * Production stages read `jbolabs-prod`; every other stage, PR previews
 * included, reads `jbolabs-dev`. Agents' Alchemy profile can only read
 * `jbolabs-dev`, so they can never load prod values.
 */
import * as Infisical from "alchemy/Infisical";

export const infisicalProjects = {
  dev: { environment: "dev", project: "c67ee6b5-31a8-41ac-ad0b-69740dfd2808" },
  prod: {
    environment: "prod",
    project: "1c276d13-9f86-4b7e-9248-5d2cf041f06e",
  },
} as const;

/**
 * Stages that run production infrastructure: the site's and Mailflare's
 * `prod`, and the studio domain's `shared`.
 */
const productionStages: ReadonlySet<string> = new Set(["prod", "shared"]);

/** The Infisical project and environment a stage reads. */
export const infisicalFor = (stage: string) =>
  productionStages.has(stage) ? infisicalProjects.prod : infisicalProjects.dev;

/** The `secrets` option for a stack that reads secrets. */
export const stackSecrets = () => [
  Infisical.Secrets(({ stage }) => infisicalFor(stage)),
];
