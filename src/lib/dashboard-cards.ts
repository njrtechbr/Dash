import { DollarSign, Euro, Bitcoin, Landmark, Activity, Globe, Thermometer, Calendar } from 'lucide-react';
import type { DashboardCard } from '@/types';

export const AVAILABLE_CARDS: DashboardCard[] = [
  { id: 'USD-BRL', title: 'Dólar', icon: DollarSign, category: 'financial' },
  { id: 'EUR-BRL', title: 'Euro', icon: Euro, category: 'financial' },
  { id: 'BTC-BRL', title: 'Bitcoin', icon: Bitcoin, category: 'financial' },
  { id: 'weather', title: 'Clima', icon: Thermometer, category: 'utility' },
  { id: 'time', title: 'Data & Hora', icon: Calendar, category: 'utility' },
];
