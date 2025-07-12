import type { LucideIcon } from 'lucide-react';

export type LinkItem = {
  id: string;
  title: string;
  url: string;
  icon: string;
  group: string;
};

export type Icon = {
  name: string;
  icon: LucideIcon;
};
