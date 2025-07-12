'use client';

import * as React from 'react';
import { Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ICONS, findIcon } from '@/lib/icons';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filteredIcons = ICONS.filter((icon) =>
    icon.name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = findIcon(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start"
        >
          <SelectedIcon className="mr-2 h-4 w-4 shrink-0" />
          {value || 'Selecionar ícone...'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <div className="p-2">
            <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar ícones..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                />
            </div>
        </div>
        <ScrollArea className="h-72">
          <div className="grid grid-cols-5 gap-1 p-2">
            {filteredIcons.map(({ name, icon: IconComponent }) => (
              <Button
                key={name}
                variant="outline"
                size="icon"
                className={cn(
                  'h-12 w-full',
                  value === name && 'border-primary ring-2 ring-primary'
                )}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
              >
                <IconComponent className="h-6 w-6" />
                <span className="sr-only">{name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
