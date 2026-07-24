// Plain, dependency-free types shared between the server actions in lib/integrations.ts
// and the client component. Kept out of the "use server" file so a client import never
// risks pulling server-only code into the browser bundle.

export type GithubRepoOption = {
  fullName: string;
  name: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
  description: string | null;
  pushedAt: string | null;
  stargazers: number;
  language: string | null;
  imported: boolean;
};

export type LoadReposError =
  | "not_signed_in"
  | "no_app"
  | "not_installed"
  | "token_failed"
  | "fetch_failed";
