import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

describe("retired Mailflare release commands", () => {
  it.each(["mailflare:build", "plan:mail", "deploy:mail"])(
    "%s refuses to run the former stack",
    (command) => {
      const result = spawnSync("bun", ["run", command], {
        cwd: new URL("..", import.meta.url),
        encoding: "utf-8",
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("https://github.com/jbolabs/mailflare");
      expect(result.stderr).toContain("Do not deploy or destroy");
    }
  );
});
