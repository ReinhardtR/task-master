import { router } from "../trpc";
import { teamsRouter } from "./teams";

export const appRouter = router({
  teams: teamsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
