import type { Icon } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
  Globe,
  Github,
  Youtube,
  Code,
  Server,
  Database,
  Mail,
  MessageSquare,
  Folder,
  Book,
  Monitor,
  Cloud,
  FileText,
  Terminal,
  GitBranch,
  HardDrive,
  Link,
  Home,
  Bot,
  LayoutPanelLeft,
  Briefcase,
  Settings,
  Shield,
  Palette,
  Music,
  Film,
  ShoppingCart
} from 'lucide-react';

export const ICONS: Icon[] = [
  { name: 'Globe', icon: Globe },
  { name: 'Github', icon: Github },
  { name: 'Youtube', icon: Youtube },
  { name: 'Code', icon: Code },
  { name: 'Terminal', icon: Terminal },
  { name: 'Server', icon: Server },
  { name: 'Database', icon: Database },
  { name: 'Mail', icon: Mail },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'Folder', icon: Folder },
  { name: 'Book', icon: Book },
  { name: 'FileText', icon: FileText },
  { name: 'Monitor', icon: Monitor },
  { name: 'Cloud', icon: Cloud },
  { name: 'GitBranch', icon: GitBranch },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Link', icon: Link },
  { name: 'Home', icon: Home },
  { name: 'Bot', icon: Bot },
  { name: 'LayoutPanelLeft', icon: LayoutPanelLeft },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Settings', icon: Settings },
  { name: 'Shield', icon: Shield },
  { name: 'Palette', icon: Palette },
  { name: 'Music', icon: Music },
  { name: 'Film', icon: Film },
  { name: 'ShoppingCart', icon: ShoppingCart },
];

export const findIcon = (name: string): LucideIcon => {
    const found = ICONS.find((icon) => icon.name === name);
    return found ? found.icon : Link;
};
