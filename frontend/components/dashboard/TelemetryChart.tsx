"use client";

import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TelemetryPoint {
  time: string;
  errors: number;
  warnings: number;
  info: number;
}

interface TelemetryChartProps {
  data: TelemetryPoint[];
}

const chartConfig = {
  errors: {
    label: "Errors & Fatal",
    color: "hsl(0, 84%, 60%)",
  },
  warnings: {
    label: "Warnings",
    color: "hsl(38, 92%, 50%)",
  },
  info: {
    label: "Info / Normal",
    color: "hsl(263, 70%, 50%)",
  },
} satisfies ChartConfig;

export function TelemetryChart({ data }: TelemetryChartProps) {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      {/* Legend */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-900 font-mono text-[10px]">
        <span className="text-zinc-500 uppercase tracking-widest">
          REALTIME STREAM
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="h-1.5 w-1.5 rounded-none bg-red-500" /> ERRORS
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-none bg-amber-500" /> WARN
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="h-1.5 w-1.5 rounded-none bg-purple-500" /> INFO
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full pt-2">
        <ChartContainer config={chartConfig} className="h-56 w-full">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillErrors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="fillWarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="fillInfo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              fontFamily="monospace"
            />
            <YAxis
              stroke="#52525b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              fontFamily="monospace"
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Area
              type="monotone"
              dataKey="info"
              stroke="#a855f7"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#fillInfo)"
            />
            <Area
              type="monotone"
              dataKey="warnings"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#fillWarnings)"
            />
            <Area
              type="monotone"
              dataKey="errors"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#fillErrors)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
