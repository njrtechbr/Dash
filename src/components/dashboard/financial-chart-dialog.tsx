'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { FinancialInfo } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface FinancialChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: FinancialInfo;
}

export function FinancialChartDialog({ open, onOpenChange, data }: FinancialChartDialogProps) {
  if (!data) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Data
              </span>
              <span className="font-bold text-muted-foreground">{label}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Valor
              </span>
              <span className="font-bold text-foreground">
                 {payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const min = Math.min(...(data.history?.map(d => d.value) || [0]));
  const max = Math.max(...(data.history?.map(d => d.value) || [0]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de {data.name}</DialogTitle>
          <DialogDescription>
            Cotação dos últimos {data.history?.length || 0} dias.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 text-2xl font-bold py-4">
            <span>{data.value}</span>
             <span className={cn(
                "flex items-center gap-1 font-semibold text-base",
                data.isPositive ? "text-green-500" : "text-red-500"
            )}>
                {data.isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" /> }
                {data.change}
            </span>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.history}
              margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `R$${value.toFixed(2)}`}
                domain={[min * 0.995, max * 1.005]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '3 3' }} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
