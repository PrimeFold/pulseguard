'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getTelemetryLogs } from '@/app/api/action/telemetry';


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
  const router = useRouter();
  const [logs, setLogs] = useState<TelemetryLogItem[]>(initialLogs);
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFilter = () => {
    startTransition(async () => {
      const res = await getTelemetryLogs({
        organizationId,
        service: selectedService,
        level: selectedLevel,
        search: searchQuery,
      });
      setLogs(res.logs);
    });
  };

  const getLevelBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case 'FATAL':
      case 'ERROR':
        return (
          <Badge variant="destructive" className="gap-1 font-mono text-[10px]">
            <AlertOctagon className="h-3 w-3" /> {level}
          </Badge>
        );
      case 'WARN':
        return (
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 gap-1 font-mono text-[10px]">
            <AlertTriangle className="h-3 w-3" /> {level}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 font-mono text-[10px] text-zinc-300">
            <Info className="h-3 w-3" /> {level}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-card/40 border border-border/60 rounded-xl backdrop-blur">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search error messages or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            className="pl-9 text-sm bg-background/50 border-border/60"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedService} onValueChange={(val) => setSelectedService(val || 'ALL')}>
            <SelectTrigger className="w-[140px] text-xs bg-background/50 border-border/60">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Services</SelectItem>
              {availableServices.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={(val) => setSelectedLevel(val || 'ALL')}>
            <SelectTrigger className="w-[110px] text-xs bg-background/50 border-border/60">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="ERROR">ERROR</SelectItem>
              <SelectItem value="WARN">WARN</SelectItem>
              <SelectItem value="INFO">INFO</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={handleFilter} disabled={isPending} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
            Apply
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="border border-border/60 rounded-xl overflow-hidden bg-card/30 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/30 border-b border-border/40 text-muted-foreground uppercase font-mono">
              <tr>
                <th className="p-3 w-8"></th>
                <th className="p-3 w-40">Timestamp</th>
                <th className="p-3 w-28">Level</th>
                <th className="p-3 w-36">Service</th>
                <th className="p-3">Message</th>
                <th className="p-3 w-32 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground font-sans">
                    No telemetry logs found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const isError = log.level === 'ERROR' || log.level === 'FATAL';

                  return (
                    <tr key={log.id} className="group hover:bg-muted/20 transition-colors">
                      <td className="p-3 cursor-pointer" onClick={() => setExpandedLogId(isExpanded ? null : log.id)}>
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                      </td>
                      <td className="p-3 text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3">{getLevelBadge(log.level)}</td>
                      <td className="p-3 font-semibold text-foreground/90">{log.service}</td>
                      <td className="p-3 max-w-md truncate font-sans text-foreground/80">
                        {log.message}
                        {isExpanded && (
                          <div className="mt-3 p-3 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-300 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(log.metadata || {}, null, 2)}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isError && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => router.push(`/dashboard/incidents/new?service=${log.service}&message=${encodeURIComponent(log.message)}`)}
                            className="h-7 text-[11px] gap-1 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/20"
                          >
                            <Sparkles className="h-3 w-3 text-purple-400" /> Investigate
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}