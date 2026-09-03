"use client";

import { useState, useTransition, useRef } from "react";
import {
  Search,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  AlertOctagon,
  AlertTriangle,
  Info,
  TerminalSquare,
} from "lucide-react";
import { getTelemetryLogs } from "@/app/api/action/telemetry";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface TelemetryLogItem {
  id: string;
  service: string;
  level: string;
  message: string;
  metadata?: any;
  timestamp: Date;
}

interface Props {
  organizationId: string;
  initialLogs: TelemetryLogItem[];
  availableServices: string[];
}

export function TelemetryExplorerClient({
  organizationId,
  initialLogs,
  availableServices,
}: Props) {
  const [logs, setLogs] = useState<TelemetryLogItem[]>(initialLogs);
  const [selectedService, setSelectedService] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const handleFilter = () => {
    startTransition(async () => {
      // Fade out logs
      if (listRef.current) {
        gsap.to(".log-row", {
          opacity: 0,
          y: -5,
          duration: 0.15,
          stagger: 0.01,
          onComplete: async () => {
            const res = await getTelemetryLogs({
              organizationId,
              service: selectedService,
              level: selectedLevel,
              search: searchQuery,
            });
            setLogs(res.logs);
          },
        });
      } else {
        const res = await getTelemetryLogs({
          organizationId,
          service: selectedService,
          level: selectedLevel,
          search: searchQuery,
        });
        setLogs(res.logs);
      }
    });
  };

  useGSAP(
    () => {
      gsap.fromTo(
        filterRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      );
      gsap.fromTo(
        ".log-row",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.02, ease: "power2.out" },
      );
    },
    { scope: listRef, dependencies: [logs] },
  );

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getLevelBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case "FATAL":
      case "ERROR":
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[9px] uppercase tracking-widest shrink-0">
            <AlertOctagon className="h-3 w-3" /> {level}
          </div>
        );
      case "WARN":
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] uppercase tracking-widest shrink-0">
            <AlertTriangle className="h-3 w-3" /> {level}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 font-mono text-[9px] uppercase tracking-widest shrink-0">
            <Info className="h-3 w-3" /> {level}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div
        ref={filterRef}
        className="flex flex-col sm:flex-row items-center gap-0 border border-zinc-900 bg-black overflow-hidden relative"
      >
        <div className="relative flex-1 w-full border-b sm:border-b-0 sm:border-r border-zinc-900">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            placeholder="Search payload signatures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            className="w-full bg-transparent text-white placeholder:text-zinc-600 text-xs font-mono h-10 pl-10 pr-4 rounded-none focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center w-full sm:w-auto divide-x divide-zinc-900">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="h-10 bg-black text-zinc-300 text-[10px] font-mono uppercase tracking-widest px-3 border-none focus:ring-0 appearance-none rounded-none cursor-pointer hover:bg-zinc-950 transition-colors"
          >
            <option value="ALL">ALL SERVICES</option>
            {availableServices.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="h-10 bg-black text-zinc-300 text-[10px] font-mono uppercase tracking-widest px-3 border-none focus:ring-0 appearance-none rounded-none cursor-pointer hover:bg-zinc-950 transition-colors"
          >
            <option value="ALL">ALL LEVELS</option>
            <option value="ERROR">ERROR / FATAL</option>
            <option value="WARN">WARNINGS</option>
            <option value="INFO">INFO / DEBUG</option>
          </select>

          <button
            onClick={handleFilter}
            disabled={isPending}
            className="h-10 px-4 bg-white hover:bg-zinc-200 text-black text-[10px] font-mono font-bold tracking-widest uppercase transition-colors active:scale-[0.98] flex items-center gap-2 rounded-none"
          >
            <RefreshCw
              className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`}
            />
            Query
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div
        ref={listRef}
        className={`border border-zinc-900 bg-black relative ${isPending ? "opacity-50 pointer-events-none" : ""} transition-opacity duration-300`}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <TerminalSquare className="h-8 w-8 text-zinc-800 mb-3" />
            <h3 className="text-xs font-mono font-semibold tracking-widest uppercase text-white">
              No Telemetry Found
            </h3>
            <p className="text-[11px] font-mono text-zinc-600 mt-1">
              Adjust query parameters to scan broader timespans.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-900/50">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  className="log-row group flex flex-col transition-colors hover:bg-zinc-950/50"
                >
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-1 sm:mt-0 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>

                      {getLevelBadge(log.level)}

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest shrink-0 hidden sm:inline">
                          [{log.service}]
                        </span>
                        <span className="text-xs text-zinc-200 font-mono truncate">
                          {log.message}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end shrink-0 pl-10 sm:pl-0">
                      <span className="text-[10px] font-mono text-zinc-600">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          fractionalSecondDigits: 3,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Expanded JSON Payload */}
                  {isExpanded && (
                    <div className="border-t border-zinc-900 bg-zinc-950/80 p-4 pl-10 overflow-x-auto">
                      <pre className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                        {JSON.stringify(
                          {
                            id: log.id,
                            timestamp: log.timestamp,
                            service: log.service,
                            level: log.level,
                            metadata: log.metadata || {},
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
