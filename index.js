import fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import path from 'node:path'

const server = fastify({ logger: true })

server.register(fastifyStatic, {
  root: path.join(import.meta.dirname, 'public')
})

const start = async () => {
  try {
    await server.listen({ port: 80 })
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}
start()