import Dashboard from "@/components/dashboard/dashboard";
import { DashboardSettingsProvider } from "@/hooks/use-dashboard-settings";
import { ShowsProvider } from "@/hooks/use-shows";

export default function Home() {
  return (
    <DashboardSettingsProvider>
      <ShowsProvider>
        <main>
          <Dashboard />
        </main>
      </ShowsProvider>
    </DashboardSettingsProvider>
  );
}
