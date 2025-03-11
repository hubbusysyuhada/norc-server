import { FastifyPluginCallback, FastifyRequest } from "fastify";
import AuthHandler from "../middleware/AuthHandler";
import Job from "../database/entity/Job";


export type RegisterJobBody = {
  name: string;
  description?: string;
  pattern: string;
  definition: string;
}

const jobRoute: FastifyPluginCallback = (server, opts, next) => {
  server.get('/', { preHandler: [AuthHandler] }, async (req, rep) => {
    const data = await req.em.find(Job, {})
    rep.code(200).send({data})
  })
  server.post('/', { preHandler: [AuthHandler] }, async (req: FastifyRequest<{ Body: RegisterJobBody }>, rep) => {
    const job = new Job()
    for (const key in req.body) job[key] = req.body[key]
    req.scheduler.registerJob(job)
    await req.em.persistAndFlush(job)
    rep.code(201).send({ok: true})
  })

  next()
}


export default jobRoute
