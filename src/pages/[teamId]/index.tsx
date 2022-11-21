import { BoardsOverview } from "@/components/boards/BoardsOverview";
import { CreateBoardAction } from "@/components/boards/CreateBoardAction";
import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";

export default function TeamPage() {
  const router = useRouter();
  const teamId = router.query.teamId as string | null;

  if (!teamId) {
    return null;
  }

  return (
    <Layout>
      <CreateBoardAction teamId={teamId} />
      <BoardsOverview teamId={teamId} />
    </Layout>
  );
}
