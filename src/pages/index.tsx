import { CreateTeamAction } from "@/components/forms/CreateTeamAction";
import { TeamsOverview } from "@/components/teams/TeamsOverview";

export default function Home() {
  return (
    <div className="bg-gray-background min-h-screen">
      <div className="max-w-7 xl mx-auto text-white py-8 px-6">
        <CreateTeamAction />
        <TeamsOverview />
      </div>
    </div>
  );
}
