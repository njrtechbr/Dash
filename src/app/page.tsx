import Dashboard from "@/components/dashboard/dashboard";
import { DashboardSettingsProvider } from "@/hooks/use-dashboard-settings";
import { MoviesProvider } from "@/hooks/use-movies";
import { ShowsProvider } from "@/hooks/use-shows";

export default function Home() {
  return (
    <DashboardSettingsProvider>
      <ShowsProvider>
        <MoviesProvider>
          <main>
            <Dashboard />
          </main>
        </MoviesProvider>
      </ShowsProvider>
    </DashboardSettingsProvider>
  );
}
