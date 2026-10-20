import { describe, expect, it } from "vitest";

import { environments } from "./github.ts";

describe("GitHub environments", () => {
  it("lets only main deploy to production", () => {
    const production = environments.filter(
      (environment) => environment.name === "production"
    );
    expect(production).toHaveLength(1);
    expect(production[0]?.branches).toStrictEqual({
      customBranchPolicies: ["main"],
    });
  });
});
