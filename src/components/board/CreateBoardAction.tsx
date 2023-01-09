import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useZodForm } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { trpc } from "@/utils/trpc";
import { SubmitHandler } from "react-hook-form";
import { z } from "zod";

const CreateBoardSchema = z.object({
  name: z.string().min(3).max(30),
});

type CreateBoardFormValues = z.infer<typeof CreateBoardSchema>;

type Props = {
  teamId: string;
};

export function CreateBoardAction({ teamId }: Props) {
  const form = useZodForm({
    schema: CreateBoardSchema,
  });

  const trpcUtils = trpc.useContext();
  const createBoard = trpc.boards.create.useMutation();

  const onCreateBoard: SubmitHandler<CreateBoardFormValues> = async (
    values
  ) => {
    await createBoard.mutateAsync({
      teamId,
      name: values.name,
    });

    trpcUtils.boards.findForTeam.invalidate({
      teamId,
    });
  };

  return (
    <Dialog
      title="Create a board"
      description="Create a board for this team"
      form={form}
      onSubmit={onCreateBoard}
      submitLabel="Create"
      trigger={<Button>Create Board</Button>}
    >
      <Input label="Board name" {...form.register("name")} />
    </Dialog>
  );
}
