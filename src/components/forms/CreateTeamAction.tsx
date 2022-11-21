"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useZodForm } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { trpc } from "@/utils/trpc";
import { SubmitHandler } from "react-hook-form";
import { z } from "zod";

const CreateTeamSchema = z.object({
  name: z.string().min(3).max(30),
});

type CreateTeamFormValues = z.infer<typeof CreateTeamSchema>;

export function CreateTeamAction() {
  const form = useZodForm({
    schema: CreateTeamSchema,
  });

  const trpcUtils = trpc.useContext();
  const createTeam = trpc.teams.create.useMutation();

  const onCreateTeam: SubmitHandler<CreateTeamFormValues> = async (values) => {
    await createTeam.mutateAsync(values);
    trpcUtils.teams.findMany.invalidate();
  };

  return (
    <Dialog
      title="Create a team"
      description="Create a team to collaberate on your board"
      form={form}
      onSubmit={onCreateTeam}
      submitLabel="Create"
      trigger={<Button>Create Team</Button>}
    >
      <Input label="Team name" {...form.register("name")} />
    </Dialog>
  );
}
