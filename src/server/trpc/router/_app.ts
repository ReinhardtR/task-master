import { router } from "../trpc";
import { boardsRouter } from "./boards";
import { teamsRouter } from "./teams";

export const appRouter = router({
  teams: teamsRouter,
  boards: boardsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
