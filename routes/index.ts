import { FastifyPluginCallback, FastifyRequest } from "fastify";
import jobRoute from "./jobRoute";
import env from "../helpers/env";


const baseRoute: FastifyPluginCallback = (server, opts, next) => {
  server.get('/ping', async (req, rep) => {
    rep.send("pong")
  })
  server.post('/auth', async (req: FastifyRequest<{ Body: { apiKey: string } }>, rep) => {
    const { apiKey } = req.body
    if (apiKey !== env.APP_KEY) rep.code(400).send({ message: "invalid key" })
    else {
      const token = req.server.jwt.sign({ apiKey }, { expiresIn: "1d" })
      rep.code(200).send({ token })
    }
  })
  server.register(jobRoute, { prefix: 'job' })
  next()
}


export default baseRoute