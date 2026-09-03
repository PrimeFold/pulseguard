"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

export function TeamFilterBar({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");

    startTransition(() => {
      router.push(`/${orgSlug}/settings/team?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        <Input
          placeholder="Search by name or email..."
          defaultValue={searchParams.get("q") || ""}
          onChange={(e) => updateQuery("q", e.target.value)}
          className="pl-9 text-xs bg-zinc-950 border-zinc-800 text-zinc-200 h-9"
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-zinc-500" />
        )}
      </div>

      <Select
        defaultValue={searchParams.get("role") || "ALL"}
        onValueChange={(val) => updateQuery("role", val as string)}
      >
        <SelectTrigger className="w-full sm:w-[150px] text-xs bg-zinc-950 border-zinc-800 text-zinc-200 h-9">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs">
          <SelectItem value="ALL">All Roles</SelectItem>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="MEMBER">Member</SelectItem>
          <SelectItem value="VIEWER">Viewer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
