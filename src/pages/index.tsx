import { CreateTeamAction } from "@/components/teams/CreateTeamAction";
import { Layout } from "@/components/Layout";
import { TeamsOverview } from "@/components/teams/TeamsOverview";
import { SideBar } from "@/components/layout/SideBar";
import { useSideMenuActions } from "@/lib/sidemenu-store";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const { toggle } = useSideMenuActions();

  return (
    <Layout>
      <Button onClick={toggle}>Toggle SideMenu</Button>
      <CreateTeamAction />
      <TeamsOverview />
    </Layout>
  );
}
