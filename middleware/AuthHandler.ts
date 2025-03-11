import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify"
import env from "../helpers/env"

export default async (req: FastifyRequest,rep: FastifyReply, throwErr: HookHandlerDoneFunction) => {
  try {
    await req.jwtVerify()
    if (req.user.apiKey !== env.APP_KEY) throw "invalid"
  } catch (e) {
    const err = new Error("Invalid token")
    // @ts-ignore
    err.statusCode = 400
    throwErr(err)
  }
    
}