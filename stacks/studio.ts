import * as Cloudflare from "@alchemy.run/cloudflare";
/**
 * The studio domain: the jbolabs.com zone, its registrar settings, the
 * `mail.` sending subdomain the marketing sites send from, and Email Routing.
 * Inbound mail for every address is handled by Mailflare (`stacks/mail.ts`
 * claims the catch-all).
 *
 *   ALCHEMY_PROFILE=admin bun alchemy deploy stacks/studio.ts --stage shared
 *
 * Moved here from `sites/stacks/studio.ts` on 2026-10-09. The stack name and
 * stage are unchanged, so it keeps the same state in the Cloudflare state
 * store: don't rename either.
 *
 * The domain was bought once with `cf registrar registrations create`;
 * Alchemy cannot register domains. Needs `FORWARD_TO` (your real inbox) from
 * Infisical `jbolabs-prod` (`stacks/secrets.ts`), so deploy and plan with the
 * operator profile: it stays a verified Email Routing destination so Mailflare
 * accounts can forward copies to it.
 */
import * as Alchemy from "alchemy";
import * as RemovalPolicy from "alchemy/RemovalPolicy";
import { Config, Effect } from "effect";

import { studio } from "./config.ts";
import { stageSecrets } from "./secrets.ts";

export default Alchemy.Stack(
  "studio",
  {
    providers: Cloudflare.providers(),
    secrets: stageSecrets,
    state: Cloudflare.state(),
  },
  Effect.gen(function* studioDomain() {
    yield* Cloudflare.Registrar.Domain("Registration", {
      autoRenew: true,
      domainName: studio.domain,
      locked: true,
      privacy: true,
    });
    const zone = yield* Cloudflare.Zone.Zone("Zone", {
      name: studio.domain,
    }).pipe(RemovalPolicy.retain());
    const sending = yield* Cloudflare.Email.SendingSubdomain("Sending", {
      name: studio.sendingSubdomain,
      zoneId: zone.zoneId,
    });
    yield* Cloudflare.Email.Routing("Routing", { zone: studio.domain });
    const inbox = yield* Config.String("FORWARD_TO");
    yield* Cloudflare.Email.Address("Inbox", { email: inbox });
    return {
      nameServers: zone.nameServers,
      sendingEnabled: sending.enabled,
    };
  })
);
