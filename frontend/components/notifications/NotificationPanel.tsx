"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Inbox,
  Flame,
  UserCheck,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface NotificationPayload {
  invites: Array<{
    id: string;
    type: "INVITE";
    title: string;
    token: string;
    role: string;
    createdAt: string;
  }>;
  actionItems: Array<{
    id: string;
    type: "INCIDENT_APPROVAL";
    title: string;
    incidentId: string;
    createdAt: string;
  }>;
  totalCount: number;
}

interface NotificationPanelProps {
  align?: "left" | "right" | "auto";
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function NotificationPanel({ align = "auto" }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<NotificationPayload | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "invites" | "approvals">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [processingToken, setProcessingToken] = useState<string | null>(null);
  const [detectedAlign, setDetectedAlign] = useState<"left" | "right">("right");

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const tl = useRef<gsap.core.Timeline>(null);

  // Auto-detect optimal screen alignment if not explicitly set
  const effectiveAlign =
    align === "auto" ? detectedAlign : align;

  // Fetch notifications on demand
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // Silently catch drops
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    loadNotifications();

    // Revalidate once when user returns to this browser tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadNotifications();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Screen boundary check on open
  useEffect(() => {
    if (isOpen && bellRef.current && align === "auto") {
      const rect = bellRef.current.getBoundingClientRect();
      // If opening from the right would overflow the left edge of the viewport
      if (rect.right - 380 < 16) {
        setDetectedAlign("left");
      } else {
        setDetectedAlign("right");
      }
    }
  }, [isOpen, align]);

  // Click outside to close & Escape key handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // GSAP animation configuration
  useGSAP(
    () => {
      gsap.set(panelRef.current, {
        autoAlpha: 0,
        y: -8,
        scale: 0.98,
        transformOrigin: effectiveAlign === "left" ? "top left" : "top right",
      });

      tl.current = gsap.timeline({ paused: true }).to(panelRef.current, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    },
    { scope: containerRef, dependencies: [effectiveAlign] }
  );

  useEffect(() => {
    if (isOpen) {
      tl.current?.play();
    } else {
      tl.current?.reverse();
    }
  }, [isOpen]);

  const togglePanel = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  // Handlers for Invites
  const handleInvite = async (token: string, action: "accept" | "decline") => {
    try {
      setProcessingToken(token);
      if (action === "accept") {
        await fetch(`/api/invites/accept`, {
          method: "POST",
          body: JSON.stringify({ token }),
          headers: { "Content-Type": "application/json" },
        });
        window.location.href = "/workspaces";
        return;
      }

      await fetch(`/api/invites/decline`, {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
      });
      await loadNotifications();
    } catch (e) {
      console.error("Invite action failed:", e);
    } finally {
      setProcessingToken(null);
    }
  };

  const invites = data?.invites || [];
  const actionItems = data?.actionItems || [];
  const totalCount = data?.totalCount || 0;

  const filteredInvites =
    activeTab === "all" || activeTab === "invites" ? invites : [];
  const filteredActions =
    activeTab === "all" || activeTab === "approvals" ? actionItems : [];
  const hasItems = filteredInvites.length > 0 || filteredActions.length > 0;

  return (
    <div ref={containerRef} className="relative z-50">
      {/* Bell Trigger Button */}
      <button
        ref={bellRef}
        type="button"
        onClick={togglePanel}
        aria-expanded={isOpen}
        title="Notifications & Action Items"
        className={`relative p-2.5 transition-colors rounded-none group active:scale-[0.98] cursor-pointer ${
          isOpen
            ? "bg-zinc-900 text-white"
            : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
        }`}
      >
        <Bell className="h-4 w-4 transition-transform group-hover:rotate-12 duration-200" />
        {totalCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        )}
      </button>

      {/* Floating Notification Dropdown */}
      <div
        ref={panelRef}
        className={`absolute top-full mt-2 w-[340px] sm:w-[380px] max-w-[calc(100vw-24px)] bg-zinc-950 border border-zinc-800 shadow-2xl shadow-black/90 rounded-none overflow-hidden invisible ${
          effectiveAlign === "left" ? "left-0" : "right-0"
        }`}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-none bg-emerald-400" />
            <span className="text-[10px] font-mono text-zinc-300 font-bold tracking-widest uppercase">
              Action Center
            </span>
            {totalCount > 0 && (
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded-none">
                {totalCount} PENDING
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={loadNotifications}
              title="Refresh notifications"
              className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`h-3 w-3 ${isLoading ? "animate-spin text-emerald-400" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close panel"
              className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Filters (if multiple categories present) */}
        {(invites.length > 0 && actionItems.length > 0) && (
          <div className="flex items-center border-b border-zinc-900 bg-black/40 px-3 py-1.5 text-[10px] font-mono gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2 py-0.5 transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "bg-zinc-800 text-white font-bold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              ALL ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("invites")}
              className={`px-2 py-0.5 transition-colors cursor-pointer ${
                activeTab === "invites"
                  ? "bg-zinc-800 text-white font-bold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              INVITES ({invites.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("approvals")}
              className={`px-2 py-0.5 transition-colors cursor-pointer ${
                activeTab === "approvals"
                  ? "bg-zinc-800 text-white font-bold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              HOTFIXES ({actionItems.length})
            </button>
          </div>
        )}

        {/* Notification List Container */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-900 scrollbar-thin">
          {!hasItems ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
              <div className="h-8 w-8 rounded-none border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-600">
                <CheckCircle2 className="h-4 w-4 text-zinc-500" />
              </div>
              <p className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wide">
                All Caught Up
              </p>
              <p className="text-[11px] font-sans text-zinc-500 max-w-[220px] leading-relaxed">
                No pending organization invites or incident hotfixes awaiting your review.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Organization Invitations */}
              {filteredInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 hover:bg-zinc-900/40 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-none bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-950/50 px-1 py-0.5 border border-purple-800/40">
                            ROLE: {inv.role}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500">
                            {formatTimeAgo(inv.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-white font-sans mt-1 leading-snug">
                          {inv.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={processingToken === inv.token}
                          onClick={() => handleInvite(inv.token, "accept")}
                          className="flex-1 py-1.5 bg-white hover:bg-zinc-200 text-black text-[10px] font-mono font-bold uppercase tracking-wider rounded-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" />
                          {processingToken === inv.token ? "JOINING..." : "ACCEPT"}
                        </button>
                        <button
                          type="button"
                          disabled={processingToken === inv.token}
                          onClick={() => handleInvite(inv.token, "decline")}
                          className="flex-1 py-1.5 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white text-[10px] font-mono uppercase tracking-wider border border-zinc-800 rounded-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <X className="h-3 w-3" /> DECLINE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Hotfix Approvals */}
              {filteredActions.map((item) => (
                <Link
                  key={item.id}
                  href={`/incidents/${item.incidentId}`}
                  onClick={() => setIsOpen(false)}
                  className="p-3.5 hover:bg-zinc-900/50 transition-colors group block cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-none bg-amber-950/40 border border-amber-800/50 flex items-center justify-center text-amber-400 shrink-0">
                      <Flame className="h-3.5 w-3.5 animate-pulse" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/50 px-1 py-0.5 border border-amber-800/40">
                          HOTFIX APPROVAL
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-zinc-200 font-sans leading-snug group-hover:text-white transition-colors truncate">
                        {item.title}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-0.5">
                        <span>Requires ADMIN review</span>
                        <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                          Review Diff →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-zinc-950 border-t border-zinc-900 text-center">
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
            PulseGuard Action Center • Event-Driven
          </span>
        </div>
      </div>
    </div>
  );
}