import Dashboard from "@/components/dashboard/dashboard";
import { ShowsProvider } from "@/hooks/use-shows";

export default function Home() {
  return (
    <ShowsProvider>
      <Dashboard />
    </ShowsProvider>
  );
}
