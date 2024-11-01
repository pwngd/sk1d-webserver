module.exports = async (fastify, opts) => {
    const MAX_CONNECTIONS_PER_IP = 3;
    const connections = {};

    fastify.ready(err => {
        if (err) {
            fastify.log.error(err);
            return;
        }

        if (fastify.io === null) return;

        fastify.io.on("connection", (socket)=>{
            socket.request = null;

            const clientIp = socket.handshake.address;
            connections[clientIp] = (connections[clientIp] || 0) + 1;

            if (connections[clientIp] > MAX_CONNECTIONS_PER_IP) {
                socket.disconnect();
                connections[clientIp]--;
                return;
            }

            fastify.log.info("WS Connected");

            socket.on("disconnect", ()=>{
                fastify.log.info("WS Disconnected");
                connections[clientIp]--;
            });
        });
    });
};