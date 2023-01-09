import { BoardSchema } from "@/lib/board-store";
import { PUSHER_EVENTS } from "@/lib/pusher-events";
import { sendPusherEvent } from "@/server/pusher/client";
import { ColumnStatus, PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";
import { router } from "../trpc";

const getTeamIfMember = async (
  prisma: PrismaClient,
  teamId: string,
  userId: string
) => {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      members: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (!team) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not a member of this team",
    });
  }

  return team;
};

export const boardsRouter = router({
  findForTeam: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const team = await getTeamIfMember(
        ctx.prisma,
        input.teamId,
        ctx.session.user.id
      );

      try {
        const boards = await ctx.prisma.board.findMany({
          where: {
            teamId: team.id,
          },
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            team: {
              select: {
                members: {
                  select: {
                    user: {
                      select: {
                        name: true,
                        image: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        return boards;
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
        teamId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const team = await getTeamIfMember(
        ctx.prisma,
        input.teamId,
        ctx.session.user.id
      );

      try {
        const board = await ctx.prisma.board.create({
          data: {
            name: input.name,
            team: {
              connect: {
                id: team.id,
              },
            },
          },
        });

        return board;
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),
  createTask: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.create({
        data: {
          boardId: input.boardId,
          name: input.name,
          status: ColumnStatus.BACKLOG,
          index: 0,
        },
      });

      return task;
    }),
  findById: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const board = await ctx.prisma.board.findFirst({
        where: {
          id: input.boardId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          team: {
            select: {
              members: {
                select: {
                  user: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
          tasks: {
            select: {
              id: true,
              name: true,
              index: true,
              status: true,
            },
          },
        },
      });

      if (!board) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      return board;
    }),
  taskDragged: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        board: BoardSchema,
        socketId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tasks = Object.entries(input.board).flatMap(
        ([columnStatus, tasks]) =>
          tasks.map((task, index) => ({
            ...task,
            status: columnStatus as ColumnStatus,
            index,
          }))
      );

      await Promise.all(
        tasks.map((task) =>
          ctx.prisma.task.update({
            where: {
              id: task.id,
            },
            data: {
              status: task.status,
              index: task.index,
            },
          })
        )
      );

      await sendPusherEvent(
        PUSHER_EVENTS.BOARD_SHAPE_CHANGED,
        {
          boardId: input.boardId,
          board: input.board,
        },
        input.socketId
      );
    }),
});
