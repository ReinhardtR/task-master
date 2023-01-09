import { getServerAuthSession } from "@/server/auth/get-server-auth-session";
import { pusherServer } from "@/server/pusher/client";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const RequestBodySchema = z.object({
  socket_id: z.string(),
  channel_name: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { socket_id: socketId, channel_name: channelName } =
    RequestBodySchema.parse(req.body);

  if (!socketId || !channelName) {
    return res.status(403).send("Unauthorized");
  }

  const session = await getServerAuthSession({
    req,
    res,
  });

  if (!session || !session.user) {
    return res.status(403).send("Unauthorized");
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channelName);

  res.send(authResponse);
}
