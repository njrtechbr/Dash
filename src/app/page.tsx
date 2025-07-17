'use client'

import Dashboard from "@/components/dashboard/dashboard";
import { AppSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";

export default function Home() {
    const { settings, isLoaded } = useDashboardSettings();

    if (!isLoaded) {
        return <div>Carregando...</div>;
    }

    return (
        <main
            style={{ backgroundImage: settings.backgroundUrl ? `url(${settings.backgroundUrl})` : 'none' }}
            className="bg-background bg-cover bg-center bg-no-repeat"
        >
            <div className="backdrop-blur-sm bg-background/50 min-h-screen">
                 <SidebarProvider>
                    <AppSidebar />
                    <Dashboard />
                </SidebarProvider>
            </div>
        </main>
    );
}
