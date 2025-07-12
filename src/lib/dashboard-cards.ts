import { DollarSign, Euro, Bitcoin, Landmark, Activity, Globe, Thermometer, Calendar } from 'lucide-react';
import type { DashboardCard } from '@/types';

export const AVAILABLE_CARDS: DashboardCard[] = [
  { id: 'USD-BRL', title: 'Dólar', icon: DollarSign, category: 'financial' },
  { id: 'EUR-BRL', title: 'Euro', icon: Euro, category: 'financial' },
  { id: 'BTC-BRL', title: 'Bitcoin', icon: Bitcoin, category: 'financial' },
  { id: '^BVSP', title: 'Ibovespa', icon: Landmark, category: 'financial' },
  { id: 'IXIC', title: 'NASDAQ', icon: Activity, category: 'financial' },
  { id: 'GSPC', title: 'S&P 500', icon: Globe, category: 'financial' },
  { id: 'weather', title: 'Clima', icon: Thermometer, category: 'utility' },
  { id: 'time', title: 'Data & Hora', icon: Calendar, category: 'utility' },
];
