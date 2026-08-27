'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  Flame,
  CheckCircle2,
  Clock,
  Server,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getIncidentsList } from '@/app/api/action/incident';
import { Input } from 'react-aria-components';


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
  initialIncidents,
  initialCounts,
}: Props) {
  const [incidents, setIncidents] = useState<IncidentItem[]>(initialIncidents);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (status: string) => {
    setActiveTab(status);
    startTransition(async () => {
      const res = await getIncidentsList({
        organizationId,
        status,
      });
      setIncidents(res.incidents);
    });
  };

  const filteredIncidents = incidents.filter(
    (inc) =>
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <Badge variant="destructive" className="gap-1 font-mono text-[10px] tracking-wide">
            <Flame className="h-3 w-3" /> ACTIVE CRASH
          </Badge>
        );
      case 'INVESTIGATING':
        return (
          <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-300 gap-1 font-mono text-[10px]">
            <Sparkles className="h-3 w-3" /> AGENT ACTIVE
          </Badge>
        );
      case 'RESOLVED':
        return (
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 font-mono text-[10px]">
            <CheckCircle2 className="h-3 w-3" /> RESOLVED
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Status Pills & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-none backdrop-blur">
          {(['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-none text-xs font-mono transition-all ${
                activeTab === tab
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab}
              <span className="ml-1.5 text-[9px] font-mono opacity-80">
                ({initialCounts[tab] ?? 0})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            placeholder="Search service or outage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700 font-mono"
          />
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center rounded-none border border-dashed border-zinc-800 bg-zinc-950/40">
            <AlertOctagon className="h-6 w-6 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs font-mono font-semibold uppercase text-zinc-300">No active incidents found</p>
            <p className="text-xs text-zinc-500 font-sans mt-1 leading-relaxed">
              All infrastructure layers are operating within healthy latency thresholds.
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <Card
              key={incident.id}
              className="border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/40 backdrop-blur rounded-none transition-all duration-150 group"
            >
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getStatusBadge(incident.status)}
                    <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                      <Server className="h-3 w-3" /> {incident.service}
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(incident.createdAt).toLocaleDateString()} at{' '}
                      {new Date(incident.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-foreground group-hover:text-white transition-colors">
                      {incident.title}
                    </h2>                
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    size="sm"
                    asChild
                    className="gap-1.5 text-xs bg-white hover:bg-zinc-200 text-black border border-transparent font-medium"
                  >
                    <Link href={`/dashboard/incidents/${incident.id}`}>
                      <Sparkles className="h-3.5 w-3.5" />
                      Enter War Room
                      <ArrowRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}