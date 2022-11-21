import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";
import { router } from "../trpc";

export const teamsRouter = router({
  findMany: protectedProcedure.query(async ({ ctx }) => {
    try {
      const teams = await ctx.prisma.team.findMany({
        where: {
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      return teams;
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      });
    }
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).max(30),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const team = await ctx.prisma.team.create({
          data: {
            name: input.name,
            members: {
              create: {
                userId: ctx.session.user.id,
              },
            },
          },
        });

        return team;
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
});
