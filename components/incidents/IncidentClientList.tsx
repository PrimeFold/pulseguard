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
        <div className="flex items-center gap-1.5 p-1 bg-card/40 border border-border/60 rounded-lg backdrop-blur">
          {(['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span className="ml-1.5 text-[10px] font-mono opacity-80">
                ({initialCounts[tab] ?? 0})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search service or outage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs bg-card/30 border-border/60"
          />
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-border/60 bg-card/20">
            <AlertOctagon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No incidents found.</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Everything is operating normally across all services.
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <Card
              key={incident.id}
              className="border-border/60 bg-card/30 hover:bg-card/50 backdrop-blur transition-all duration-200 group"
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
                    <h2 className="text-sm font-semibold text-foreground group-hover:text-purple-300 transition-colors">
                      {incident.title}
                    </h2>                
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    size="sm"
                    asChild
                    className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20"
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