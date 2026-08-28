"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertOctagon,
  Flame,
  CheckCircle2,
  Clock,
  Server,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";
import { getIncidentsList } from "@/app/api/action/incident";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface IncidentItem {
  id: string;
  title: string;
  service: string;
  severity: string;
  status: string;
  createdAt: Date;
}

interface Props {
  organizationId: string;
  orgSlug: string;
  initialIncidents: IncidentItem[];
  initialCounts: {
    ALL: number;
    OPEN: number;
    INVESTIGATING: number;
    RESOLVED: number;
  };
}

export function IncidentListClient({
  organizationId,
  orgSlug,
  initialIncidents,
  initialCounts,
}: Props) {
  const router = useRouter();
  const [incidents, setIncidents] = useState<IncidentItem[]>(initialIncidents);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (status: string) => {
    setActiveTab(status);
    startTransition(async () => {
      // Fade out
      if (listRef.current) {
        gsap.to(".incident-row", {
          opacity: 0,
          y: 10,
          duration: 0.2,
          stagger: 0.02,
          onComplete: async () => {
            const res = await getIncidentsList({
              organizationId,
              status,
            });
            setIncidents(res.incidents);
          },
        });
      } else {
        const res = await getIncidentsList({
          organizationId,
          status,
        });
        setIncidents(res.incidents);
      }
    });
  };

  useGSAP(
    () => {
      gsap.fromTo(
        ".incident-row",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
      );
    },
    { scope: listRef, dependencies: [incidents] },
  );

  const filteredIncidents = incidents.filter(
    (inc) =>
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.service.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[9px] uppercase tracking-widest">
            <Flame className="h-3 w-3 animate-pulse" /> OPEN
          </div>
        );
      case "INVESTIGATING":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[9px] uppercase tracking-widest">
            <Sparkles className="h-3 w-3" /> AI ACTIVE
          </div>
        );
      case "RESOLVED":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] uppercase tracking-widest">
            <CheckCircle2 className="h-3 w-3" /> RESOLVED
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 font-mono text-[9px] uppercase tracking-widest">
            {status}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Status Pills & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            placeholder="Search by trace or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-zinc-800 text-white placeholder-zinc-600 text-xs font-mono h-10 pl-10 pr-4 rounded-none focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-black border border-zinc-900 rounded-none overflow-x-auto w-full sm:w-auto">
          {(["ALL", "OPEN", "INVESTIGATING", "RESOLVED"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`
                relative px-4 py-2 text-[10px] font-mono tracking-widest font-semibold transition-all rounded-none uppercase
                ${
                  activeTab === tab
                    ? "bg-zinc-900 text-white border border-zinc-800"
                    : "text-zinc-500 hover:text-white border border-transparent hover:bg-zinc-950"
                }
              `}
              >
                {tab}{" "}
                <span
                  className={`ml-1 ${activeTab === tab ? "text-zinc-400" : "text-zinc-600"}`}
                >
                  ({initialCounts[tab as keyof typeof initialCounts]})
                </span>
              </button>
            ),
          )}
        </div>
      </div>

      {/* Grid of Incidents */}
      <div
        ref={listRef}
        className={
          isPending
            ? "opacity-50 pointer-events-none transition-opacity duration-300"
            : "transition-opacity duration-300"
        }
      >
        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-zinc-900 bg-black/50">
            <AlertOctagon className="h-8 w-8 text-zinc-700 mb-4" />
            <h3 className="text-xs font-mono font-semibold tracking-widest uppercase text-white mb-1">
              No Signals Detected
            </h3>
            <p className="text-[11px] font-mono text-zinc-500">
              No incidents match the current criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 border border-zinc-900 divide-y divide-zinc-900 bg-black">
            {filteredIncidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/${orgSlug}/incidents/${incident.id}`}
                prefetch={true}
                onMouseEnter={() =>
                  router.prefetch(`/${orgSlug}/incidents/${incident.id}`)
                }
                className="incident-row flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-zinc-950 transition-colors group cursor-pointer"
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    {getStatusIndicator(incident.status)}
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                      <Server className="h-3 w-3" /> {incident.service}
                    </div>
                  </div>

                  <h3 className="text-sm font-sans font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                    {incident.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 mt-2 sm:mt-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase" suppressHydrationWarning>
                    <Clock className="h-3 w-3 text-zinc-600" />
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </div>
                  <div className="h-8 w-8 bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center transition-all group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
