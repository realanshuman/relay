"use client";

import { useFormStatus } from "react-dom";
import { Icon } from "./ui";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  icon,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn-brand", className)}>
      {pending ? (
        <Icon name="Loader2" size={15} className="animate-spin" />
      ) : (
        icon && <Icon name={icon} size={15} />
      )}
      {children}
    </button>
  );
}
