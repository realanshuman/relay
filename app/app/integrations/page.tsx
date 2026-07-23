import { getCurrentUser } from "@/lib/session";
import { githubConfigured, getGithubConnection } from "@/lib/github";
import { getBaseUrl } from "@/lib/base-url";
import { PageHeader } from "@/components/ui";
import { IntegrationsView } from "@/components/integrations-view";

export const metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: { error?: string; connected?: string };
}) {
  const user = await getCurrentUser();
  const configured = githubConfigured();
  const connection =
    user && configured ? await getGithubConnection(user.id) : { connected: false, login: null };

  const host = (process.env.BETTER_AUTH_URL || getBaseUrl()).replace(/\/$/, "");
  const callbackUrl = `${host}/api/auth/callback/github`;

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Connect the tools Relay works with. Start with GitHub to import repositories in one click — no more typing owner/repo by hand."
        icon="Blocks"
      />
      <IntegrationsView
        github={{
          configured,
          connected: connection.connected,
          login: connection.login,
          callbackUrl,
        }}
        connectError={searchParams?.error === "github" || searchParams?.error === "1"}
      />
    </div>
  );
}
