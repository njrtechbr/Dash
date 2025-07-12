
'use client';

import * as React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { BatchLinkDialog } from './batch-link-dialog';
import { CustomizeDashboardDialog } from './customize-dashboard-dialog';
import { AddShowDialog } from './add-show-dialog';
import { AddMovieDialog } from './add-movie-dialog';
import { LinkDialog } from './link-dialog';
import { useLinks } from '@/hooks/use-links';
import { Film, Home, Layers, Plus, Settings, Tv } from 'lucide-react';
import type { LinkItem } from '@/types';
import { useToast } from '../ui/use-toast';

export function AppSidebar() {
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [batchDialogOpen, setBatchDialogOpen] = React.useState(false);
  const [addShowDialogOpen, setAddShowDialogOpen] = React.useState(false);
  const [addMovieDialogOpen, setAddMovieDialogOpen] = React.useState(false);
  const [customizeDialogOpen, setCustomizeDialogOpen] = React.useState(false);
  const [linkToEdit, setLinkToEdit] = React.useState<LinkItem | null>(null);

  const { addLink, updateLink, addMultipleLinks, setLinkToEdit: setGlobalLinkToEdit, setLinkDialogOpen: setGlobalLinkDialogOpen } = useLinks.getState();
  const { toast } = useToast();

  React.useEffect(() => {
    return useLinks.subscribe(state => {
        setLinkToEdit(state.linkToEdit);
        setLinkDialogOpen(state.isLinkDialogOpen);
    });
  }, []);

  const handleSaveLink = (data: Omit<LinkItem, 'id' | 'isFavorite'>, id?: string) => {
    if (id) {
      updateLink(id, data);
      toast({ title: "Link Atualizado", description: "Seu link foi atualizado com sucesso." });
    } else {
      addLink(data);
      toast({ title: "Link Adicionado", description: "Seu novo link foi adicionado ao painel." });
    }
  };

  const handleSaveBatchLinks = (links: Omit<LinkItem, 'id' | 'isFavorite'>[]) => {
    addMultipleLinks(links);
    toast({ title: "Links Adicionados", description: `${links.length} novos links foram adicionados ao painel.` });
  };
  
  return (
    <>
      <Sidebar variant="floating" collapsible="icon">
        <SidebarHeader>
           <Button variant="ghost" className='h-12 w-full justify-start px-2' asChild>
                <a href="#">
                    <Home />
                    <span className="text-lg font-bold text-primary">FluxDash</span>
                </a>
           </Button>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => useLinks.getState().handleAddNewLink()}
                      tooltip="Adicionar Novo Link"
                    >
                      <Plus />
                      <span>Novo Link</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setBatchDialogOpen(true)}
                      tooltip="Adicionar Links em Lote"
                    >
                      <Layers />
                      <span>Links em Lote</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setAddMovieDialogOpen(true)}
                      tooltip="Adicionar Filme"
                    >
                      <Film />
                      <span>Adicionar Filme</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setAddShowDialogOpen(true)}
                      tooltip="Adicionar Série"
                    >
                      <Tv />
                      <span>Adicionar Série</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                         onClick={() => setCustomizeDialogOpen(true)}
                         tooltip="Configurações"
                    >
                        <Settings />
                        <span>Configurações</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="md:hidden fixed top-2 left-2 z-50">
        <SidebarTrigger />
      </div>

       <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setGlobalLinkDialogOpen}
        onSave={handleSaveLink}
        linkToEdit={linkToEdit}
      />
      <BatchLinkDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        onSave={handleSaveBatchLinks}
      />
      <AddShowDialog
        open={addShowDialogOpen}
        onOpenChange={setAddShowDialogOpen}
      />
      <AddMovieDialog
        open={addMovieDialogOpen}
        onOpenChange={setAddMovieDialogOpen}
      />
      <CustomizeDashboardDialog
        open={customizeDialogOpen}
        onOpenChange={setCustomizeDialogOpen}
      />
    </>
  );
}
