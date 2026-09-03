"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, X, ShieldAlert, Sparkles } from "lucide-react";
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

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<NotificationPayload | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const tl = useRef<gsap.core.Timeline>(null);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      gsap.set(panelRef.current, {
        autoAlpha: 0,
        y: -10,
        scale: 0.98,
        transformOrigin: "top right",
      });

      tl.current = gsap.timeline({ paused: true }).to(panelRef.current, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: "power2.out",
      });
    },
    { scope: panelRef },
  );

  useEffect(() => {
    if (isOpen) {
      tl.current?.play();
    } else {
      tl.current?.reverse();
    }
  }, [isOpen]);

  const togglePanel = () => setIsOpen(!isOpen);

  // Handlers for Invites
  const handleInvite = async (token: string, action: "accept" | "decline") => {
    if (action === "accept") {
      await fetch(`/api/invites/accept`, {
        method: "POST",
        body: JSON.stringify({ token }),
        headers: { "Content-Type": "application/json" },
      });
      // Optionally route to dashboard
      window.location.href = "/workspaces";
    }
    // Need to bust cache on backend, then reload UI
    await loadNotifications();
  };

  return (
    <div className="relative z-50">
      <button
        ref={bellRef}
        onClick={togglePanel}
        className="relative p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors rounded-none group active:scale-[0.98]"
      >
        <Bell className="h-4 w-4 text-zinc-400 group-hover:text-white" />
        {data && data.totalCount > 0 && (
          <div className="absolute top-1 right-1 h-2 w-2 rounded-none bg-emerald-500 animate-pulse border border-black" />
        )}
      </button>

      <div
        ref={panelRef}
        className="absolute top-full right-0 mt-2 w-80 bg-black border border-zinc-800 rounded-none shadow-2xl overflow-hidden invisible"
      >
        <div className="p-3 border-b border-zinc-800 bg-zinc-950 flex justify-between items-center">
          <span className="text-[10px] font-mono text-zinc-500 font-semibold tracking-widest uppercase">
            Action Center
          </span>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800 rounded-none">
            {data?.totalCount || 0} PENDING
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!data || data.totalCount === 0 ? (
            <div className="p-6 text-center text-zinc-600 text-xs font-mono">
              All caught up.
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Invites */}
              {data.invites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 border-b border-zinc-800/50 hover:bg-zinc-950/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-none shrink-0">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                        {inv.title}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInvite(inv.token, "accept")}
                          className="flex-1 py-1.5 bg-white hover:bg-zinc-200 text-black text-[10px] font-mono font-bold border border-transparent rounded-none active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                        >
                          <Check className="h-3 w-3" /> ACCEPT
                        </button>
                        <button
                          onClick={() => handleInvite(inv.token, "decline")}
                          className="flex-1 py-1.5 bg-transparent hover:bg-zinc-900 text-zinc-400 text-[10px] font-mono border border-zinc-800 hover:text-white rounded-none active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                        >
                          <X className="h-3 w-3" /> DECLINE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Hotfix Approvals */}
              {data.actionItems.map((item) => (
                <a
                  key={item.id}
                  href={`/incidents/${item.incidentId}`}
                  className="block p-3 border-b border-zinc-800/50 hover:bg-zinc-950 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-none shrink-0 group-hover:bg-amber-500/20 transition-colors">
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-zinc-200 font-sans leading-relaxed">
                        {item.title}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500">
                        Requires ADMIN review
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
