import { Board, getBoardShape } from "@/components/board/Board";
import { trpc } from "@/utils/trpc";

import { useRouter } from "next/router";

export default function BoardPage() {
  const router = useRouter();
  const { boardId } = router.query;

  const createTaskMutation = trpc.boards.createTask.useMutation();

  const boardQuery = trpc.boards.findById.useQuery(
    {
      boardId: boardId as string,
    },
    {
      enabled: !!boardId,
    }
  );

  if (!boardId) {
    return null;
  }

  if (boardQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (boardQuery.isError) {
    return <div>Error</div>;
  }

  const boardQueryData = boardQuery.data;

  const boardShape = getBoardShape(boardQueryData.tasks);

  return (
    <div>
      <button
        onClick={async () => {
          await createTaskMutation.mutateAsync({
            boardId: boardId as string,
            name: "New task",
          });
        }}
      >
        Create Task
      </button>
      <Board boardId={boardId as string} boardShape={boardShape} />
    </div>
  );
}
