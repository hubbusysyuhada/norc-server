import fastify from 'fastify'
import "reflect-metadata"
import bcrypt from 'fastify-bcrypt'
import jwt from '@fastify/jwt'
import cors from '@fastify/cors'
import routes from './routes'
import MikroOrmInstance from './database'
import Scheduler from './scheduler'
import env from './helpers/env'

export default async function startServer() {
  const server = fastify()
  const orm = await MikroOrmInstance.init()
  const scheduler = await Scheduler.init(orm)
  const em = await orm.getEm()
  server.register(routes, { prefix: 'api' })
  server.register(jwt, { secret: env.JWT_KEY })
  server.addHook("onRequest", (req, rep, next) => {
    req.em = em
    req.scheduler = scheduler
    next()
  })
  server.register(cors, {
    origin: (origin, cb) => {
      if (!origin || new URL(origin).hostname === 'localhost') cb(null, true)
    }
  })

  server.listen({ port: 8080 }, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
  return server
}

startServer()