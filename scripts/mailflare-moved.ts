/** Fail closed so old release commands cannot update the former submodule pin. */
console.error(
  "Mailflare is deployed from https://github.com/jbolabs/mailflare. " +
    "Use that repository's production workflow and ownership handoff instructions. " +
    "Do not deploy or destroy the former mail stack from jbolabs."
);
process.exitCode = 1;
