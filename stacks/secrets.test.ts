import { describe, expect, it } from "vitest";

import { secretSource } from "./secrets.ts";

const sources = (stages: readonly string[], inGitHubActions: boolean) =>
  Object.fromEntries(
    stages.map((stage) => [
      stage,
      secretSource(stage, inGitHubActions) ?? "none",
    ])
  );

describe(secretSource, () => {
  it("maps stages run from a shell", () => {
    expect(
      sources(["prod", "shared", "pr-1", "pr-12", "dev_jake", "demo"], false)
    ).toStrictEqual({
      demo: "dev",
      dev_jake: "dev",
      "pr-1": "none",
      "pr-12": "none",
      prod: "prod",
      shared: "prod",
    });
  });

  it("gives non-production stages in GitHub Actions no source", () => {
    expect(
      sources(["prod", "pr-1", "pr-999", "preview", "dev_runner"], true)
    ).toStrictEqual({
      dev_runner: "none",
      "pr-1": "none",
      "pr-999": "none",
      preview: "none",
      prod: "prod",
    });
  });
});
