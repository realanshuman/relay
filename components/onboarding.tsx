import Link from "next/link";
import { Icon } from "./ui";
import { SubmitButton } from "./submit-button";
import { addRepository } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface Props {
  firstName: string;
  repoCount: number;
  releaseCount: number;
  publishedCount: number;
}

function StepRow({
  done,
  index,
  title,
  children,
}: {
  done: boolean;
  index: number;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 px-5 py-4">
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          done ? "bg-emerald-500 text-white" : "border border-zinc-300 bg-white text-zinc-500",
        )}
      >
        {done ? <Icon name="Check" size={15} /> : index}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", done ? "text-zinc-400 line-through" : "text-zinc-900")}>
          {title}
        </p>
        {!done && children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

export function Onboarding({ firstName, repoCount, releaseCount, publishedCount }: Props) {
  const progress = [repoCount > 0, releaseCount > 0, publishedCount > 0].filter(Boolean).length;

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 text-white">
            <Icon name="Sparkles" size={13} />
          </span>
          <h2 className="text-base font-semibold text-zinc-900">Welcome to Relay, {firstName}</h2>
        </div>
        <p className="mt-1.5 text-sm text-zinc-500">
          Three steps to your first published release. You&apos;ve completed {progress} of 3.
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all"
            style={{ width: `${(progress / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-zinc-100">
        <StepRow done={repoCount > 0} index={1} title="Connect a repository">
          <form action={addRepository} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Icon
                name="Github"
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                name="fullName"
                placeholder="owner/repository"
                required
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5"
              />
            </div>
            <input type="hidden" name="targetBranch" value="main" />
            <SubmitButton icon="Plus">Connect</SubmitButton>
          </form>
        </StepRow>

        <StepRow done={releaseCount > 0} index={2} title="Detect your first release">
          <p className="text-sm text-zinc-500">
            Click <span className="font-medium text-zinc-700">New Release</span> in the top bar to
            simulate a merged pull request, or point a{" "}
            <Link href="/app/settings" className="font-medium text-zinc-700 underline underline-offset-2">
              GitHub webhook
            </Link>{" "}
            at Relay so releases appear automatically.
          </p>
        </StepRow>

        <StepRow done={publishedCount > 0} index={3} title="Generate, review, and publish">
          <p className="text-sm text-zinc-500">
            Open a release, hit <span className="font-medium text-zinc-700">Generate</span>, review
            the notes and posts, then publish to your changelog.
          </p>
        </StepRow>
      </div>
    </div>
  );
}
