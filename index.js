require("dotenv").config();
const fastify = require("fastify");
const path = require("path");
const fastifyStatic = require("@fastify/static");
const pov = require("@fastify/view");
const rateLimit = require("@fastify/rate-limit");
const cors = require("@fastify/cors");
const fastifyHelmet = require("@fastify/helmet");
const ejs = require("ejs");
const socketioPlugin = require("fastify-socket.io");
const socketHandlerPlugin = require("./plugins/socketHandlerPlugin.js");
const renderPlugin = require("./plugins/renderPlugin.js");
const ytdlPlugin = require("./plugins/ytdlPlugin.js");

const server = fastify({ logger: true });

server.register(fastifyHelmet, {
  contentSecurityPolicy: false
});

server.register(cors, {
  origin: ["https://sk1d.org"]
});

server.register(rateLimit, {
  max: 75,
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

server.addHook("onRequest", async (req, rep)=>{
  const ip = req.headers["x-real-ip"];
  if (ip) server.uniqueIPs.add(ip);
});

const start = async () => {
  try {
    await server.listen({ port: process.env.PORT, host: "127.0.0.1" });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();