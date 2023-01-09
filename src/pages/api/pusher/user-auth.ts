import { getServerAuthSession } from "@/server/auth/get-server-auth-session";
import { pusherServer } from "@/server/pusher/client";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const RequestBodySchema = z.object({
  socket_id: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { socket_id: socketId } = RequestBodySchema.parse(req.body);

  const session = await getServerAuthSession({
    req,
    res,
  });

  if (!socketId || !session || !session.user) {
    return res.status(403).send("Unauthorized");
  }

  const user = {
    id: session.user.id,
    user_info: {
      name: session.user.name,
      email: session.user.email,
    },
  };

  const authResponse = pusherServer.authenticateUser(socketId, user);
  res.send(authResponse);
}
