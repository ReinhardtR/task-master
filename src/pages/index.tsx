import { CreateTeamAction } from "@/components/teams/CreateTeamAction";
import { Layout } from "@/components/Layout";
import { TeamsOverview } from "@/components/teams/TeamsOverview";

export default function Home() {
  return (
    <Layout>
      <CreateTeamAction />
      <TeamsOverview />
    </Layout>
  );
}
