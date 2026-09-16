"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Flame,
  ShieldAlert,
} from "lucide-react";

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
    orgSlug?: string;
    createdAt: string;
  }>;
  totalCount: number;
}

interface NotificationPanelProps {
  align?: "left" | "right" | "auto";
  direction?: "down" | "up";
  toggleOnly?: boolean;
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

export function NotificationPanel({
  align = "auto",
  direction = "down",
  toggleOnly = false,
}: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<NotificationPayload | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "invites" | "approvals">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [processingToken, setProcessingToken] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch notifications on demand
  const loadNotifications = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      const url = forceRefresh ? "/api/notifications?refresh=true" : "/api/notifications";
      const res = await fetch(url, { cache: "no-store" });
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
    loadNotifications(true);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadNotifications(true);
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Click outside to close ONLY if toggleOnly is false
  useEffect(() => {
    if (toggleOnly) return; // Do not close on click outside if toggleOnly is true

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, toggleOnly]);

  const togglePanel = () => {
    if (!isOpen) {
      loadNotifications(true);
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
      await loadNotifications(true);
    } catch (e) {
      console.error("Invite action failed:", e);
    } finally {
      setProcessingToken(null);
    }
  };

  // Handler for Dismissing a Notification (Optimistic + Backend)
  const handleDismiss = async (id: string, type: "INVITE" | "INCIDENT_APPROVAL") => {
    // Optimistic UI Removal
    setData((prev) => {
      if (!prev) return null;
      const nextInvites = type === "INVITE" ? prev.invites.filter((item) => item.id !== id) : prev.invites;
      const nextActions = type === "INCIDENT_APPROVAL" ? prev.actionItems.filter((item) => item.id !== id) : prev.actionItems;
      return {
        invites: nextInvites,
        actionItems: nextActions,
        totalCount: nextInvites.length + nextActions.length,
      };
    });

    try {
      await fetch("/api/notifications/dismiss", {
        method: "POST",
        body: JSON.stringify({ id, type }),
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
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

  // Compute dropdown positioning classes
  const isUpwards = direction === "up";
  const positionClasses = isUpwards
    ? "absolute bottom-full mb-3 right-0 w-[245px] sm:w-[250px]"
    : `absolute top-full mt-2 w-[340px] sm:w-[380px] max-w-[calc(100vw-24px)] ${
        align === "left" ? "left-0" : "right-0"
      }`;

  return (
    <div ref={containerRef} className="relative z-50 inline-block">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={togglePanel}
        aria-expanded={isOpen}
        title="Notifications & Action Items"
        className={`relative p-2 transition-colors rounded-none group active:scale-[0.98] cursor-pointer ${
          isOpen
            ? "bg-zinc-900 text-white border border-zinc-700"
            : "text-zinc-400 hover:text-white hover:bg-zinc-900/80 border border-zinc-800 bg-zinc-950"
        }`}
      >
        <Bell className="h-4 w-4 transition-transform group-hover:rotate-12 duration-200" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-none bg-emerald-500 font-mono text-[9px] font-bold text-black shadow-sm">
            {totalCount}
          </span>
        )}
      </button>

      {/* Upwards / Downwards Floating Dropdown Panel */}
      {isOpen && (
        <div
          className={`${positionClasses} bg-zinc-950 border border-zinc-800 shadow-2xl shadow-black/90 rounded-none overflow-hidden z-50 flex flex-col font-sans animate-in fade-in-0 zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-900/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-none bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-white font-bold tracking-widest uppercase">
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
                onClick={() => loadNotifications(true)}
                title="Refresh notifications"
                className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`}
                />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close panel"
                className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Tab Filters */}
          {(invites.length > 0 && actionItems.length > 0) && (
            <div className="flex items-center border-b border-zinc-900 bg-black/60 px-3 py-1.5 text-[10px] font-mono gap-2 shrink-0">
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
          <div className="max-h-[320px] overflow-y-auto divide-y divide-zinc-900 scrollbar-thin">
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
              <div className="flex flex-col divide-y divide-zinc-900">
                {/* Organization Invitations */}
                {filteredInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 hover:bg-zinc-900/40 transition-colors group relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-6 w-6 rounded-none bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <div className="flex items-center justify-between gap-2 pr-5">
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

                      {/* Top Right Remove X Button */}
                      <button
                        type="button"
                        onClick={() => handleDismiss(inv.id, "INVITE")}
                        title="Remove notification"
                        className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 hover:bg-zinc-900 p-1 rounded-none transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Hotfix Approvals */}
                {filteredActions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 hover:bg-zinc-900/50 transition-colors group relative"
                  >
                    <Link
                      href={item.orgSlug ? `/${item.orgSlug}/incidents/${item.incidentId}` : `/incidents/${item.incidentId}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 cursor-pointer"
                    >
                      <div className="mt-0.5 h-6 w-6 rounded-none bg-amber-950/40 border border-amber-800/50 flex items-center justify-center text-amber-400 shrink-0">
                        <Flame className="h-3.5 w-3.5 animate-pulse" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2 pr-5">
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
                    </Link>

                    {/* Top Right Remove X Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDismiss(item.id, "INCIDENT_APPROVAL");
                      }}
                      title="Remove notification"
                      className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 hover:bg-zinc-900 p-1 rounded-none transition-colors cursor-pointer z-10"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-zinc-950 border-t border-zinc-900 text-center shrink-0">
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
              PulseGuard Action Center • Live Stream
            </span>
          </div>
        </div>
      )}
    </div>
  );
}