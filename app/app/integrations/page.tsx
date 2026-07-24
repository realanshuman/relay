import { getCurrentUser, getCurrentWorkspace } from "@/lib/session";
import { getGithubApp } from "@/lib/github-app";
import { PageHeader } from "@/components/ui";
import { IntegrationsView } from "@/components/integrations-view";

export const metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

function errorText(code: string): string {
  switch (code) {
    case "state":
      return "That GitHub link expired or didn't match. Please start again.";
    case "setup":
      return "Couldn't finish creating the GitHub app. Please try again.";
    case "install":
      return "Couldn't complete the installation. Please try again.";
    default:
      return "Something went wrong connecting GitHub. Please try again.";
  }
}

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: { installed?: string; setup?: string; error?: string };
}) {
  const user = await getCurrentUser();
  const app = user ? await getGithubApp() : null;
  const ws = user ? await getCurrentWorkspace() : null;

  const notice = searchParams?.error
    ? { tone: "error" as const, text: errorText(searchParams.error) }
    : searchParams?.installed
      ? { tone: "success" as const, text: "GitHub connected. Choose the repositories to import below." }
      : null;

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Connect the tools Relay works with. GitHub is a one-click setup — no tokens, no config files."
        icon="Blocks"
      />
      <IntegrationsView
        github={{
          hasApp: Boolean(app),
          installed: Boolean(ws?.githubInstallationId),
          accountLogin: ws?.githubAccountLogin ?? null,
        }}
        notice={notice}
      />
    </div>
  );
}
