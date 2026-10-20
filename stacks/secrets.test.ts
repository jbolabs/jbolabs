import { describe, expect, it } from "vitest";

import { infisicalFor } from "./secrets.ts";

const DEV_PROJECT = "c67ee6b5-31a8-41ac-ad0b-69740dfd2808";
const PROD_PROJECT = "1c276d13-9f86-4b7e-9248-5d2cf041f06e";

describe(infisicalFor, () => {
  it("reads jbolabs-prod for production stages", () => {
    expect(infisicalFor("prod")).toStrictEqual({
      environment: "prod",
      project: PROD_PROJECT,
    });
    expect(infisicalFor("shared")).toStrictEqual({
      environment: "prod",
      project: PROD_PROJECT,
    });
  });

  it("never reads jbolabs-prod for previews or local stages", () => {
    for (const stage of ["pr-12", "preview", "dev_jake", "staging"]) {
      expect(infisicalFor(stage)).toStrictEqual({
        environment: "dev",
        project: DEV_PROJECT,
      });
    }
  });
});
