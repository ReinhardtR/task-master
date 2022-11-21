import { trpc } from "@/utils/trpc";
import Link from "next/link";

export function TeamsOverview() {
  const teamsQuery = trpc.teams.findMany.useQuery();

  if (teamsQuery.status === "loading") {
    return <div>Loading...</div>;
  }

  if (teamsQuery.status === "error") {
    return <div>{teamsQuery.error.message}</div>;
  }

  const teams = teamsQuery.data;

  return (
    <div>
      <h1 className="text-4xl font-bold text-white">Teams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {teams.map((team) => (
          <Link key={team.id} href={`/${team.id}`}>
            <div className="bg-black border border-gray-border rounded p-4 text-white">
              {team.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
