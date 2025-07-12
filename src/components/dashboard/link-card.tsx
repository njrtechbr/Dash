'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { findIcon } from '@/lib/icons';
import type { LinkItem } from '@/types';
import { cn } from '@/lib/utils';

interface LinkCardProps {
  link: LinkItem;
  onEdit: () => void;
  onDelete: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export function LinkCard({ link, onEdit, onDelete, isDragging, isDragOver }: LinkCardProps) {
  const Icon = findIcon(link.icon);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group relative block transition-opacity duration-300',
        isDragging && 'opacity-50'
      )}
      draggable="false"
    >
      <Card
        className={cn(
            'h-32 w-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-primary',
            isDragOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
        )}
      >
        <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
          <Icon className="h-8 w-8 text-primary" />
          <p className="font-semibold text-foreground truncate w-full px-2">{link.title}</p>
        </CardContent>
      </Card>
      <div className="absolute top-2 right-2" onClick={handleMenuClick}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </a>
  );
}
