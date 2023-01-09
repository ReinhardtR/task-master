import { PusherEvent } from "@/lib/pusher-events";
import { env } from "@/env/server.mjs";
import PusherServer from "pusher";

export const pusherServer = new PusherServer({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true,
});

export const sendPusherEvent = async <T extends any>(
  event: PusherEvent<T>,
  data: T,
  exlucdedsSocketId?: string
) => {
  const parsedData = event.schema.parse(data);

  await pusherServer.trigger(event.channelName, event.eventName, parsedData, {
    socket_id: exlucdedsSocketId,
  });
};

export const sendPrivatePusherEvent = async <T extends any>(
  privateId: string,
  event: PusherEvent<T>,
  data: T,
  exlucdedsSocketId?: string
) => {
  const parsedData = event.schema.parse(data);

  await pusherServer.trigger(
    `${event.channelName}-${privateId}`,
    event.eventName,
    parsedData,
    {
      socket_id: exlucdedsSocketId,
    }
  );
};
