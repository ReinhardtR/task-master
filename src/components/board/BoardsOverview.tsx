import { trpc } from "@/utils/trpc";
import Link from "next/link";

type Props = {
  teamId: string;
};

export function BoardsOverview({ teamId }: Props) {
  const boardsQuery = trpc.boards.findForTeam.useQuery({
    teamId,
  });

  if (boardsQuery.status === "loading") {
    return <div>Loading...</div>;
  }

  if (boardsQuery.status === "error") {
    return <div>{boardsQuery.error.message}</div>;
  }

  const boards = boardsQuery.data;

  return (
    <div>
      <h1 className="text-4xl font-bold text-white">Boards</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {boards.map((board) => (
          <Link key={board.id} href={`/${teamId}/${board.id}`}>
            <div className="bg-black border border-gray-border rounded p-4 text-white">
              {board.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
