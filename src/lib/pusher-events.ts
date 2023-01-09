import { z } from "zod";
import { BoardSchema } from "./board-store";

export type PusherEvent<T> = {
  channelName: string;
  eventName: string;
  schema: z.ZodSchema<T>;
};

type PusherEventsMap = {
  [key: string]: PusherEvent<any>;
};

export const PUBLIC_PUSHER_EVENTS = {};

export const PRIVATE_PUSHER_EVENTS = {
  BOARD_UPDATE: {
    channelName: "private-board",
    eventName: "update",
    schema: z.object({
      board: BoardSchema,
    }),
  },
};
