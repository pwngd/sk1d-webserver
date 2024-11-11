const fastify = require("fastify");
const path = require("path");
const fastifyStatic = require("@fastify/static");
const pov = require("@fastify/view");
const rateLimit = require("@fastify/rate-limit");
const ejs = require("ejs");
const socketioPlugin = require("fastify-socket.io");
const socketHandlerPlugin = require("./plugins/socketHandlerPlugin.js");
const renderPlugin = require("./plugins/renderPlugin.js");
const ytdlPlugin = require("./plugins/ytdlPlugin.js");

const server = fastify({ logger: true });

server.register(rateLimit, {
  max: 100,
  timeWindow: 1000*60
});

server.register(socketioPlugin);
server.register(socketHandlerPlugin);
server.register(renderPlugin);
server.register(ytdlPlugin);

server.decorate("uniqueIPs", new Set());

server.register(fastifyStatic, {
  root: path.join(__dirname, "public")
});

server.register(pov, {
  engine: { ejs },
  root: path.join(__dirname, "views")
});

server.get("/api/online", (req, rep)=>{
  rep.send(server.io.engine.clientsCount);
});

server.get("/api/views", (req, rep)=>{
  rep.send(server.uniqueIPs.size);
});

server.addHook("onRequest", async (req, rep)=>{
  server.uniqueIPs.add(req.ip);
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();