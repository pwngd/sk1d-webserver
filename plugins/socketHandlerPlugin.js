module.exports = async (fastify, opts) => {
    fastify.ready(err => {
        if (err) {
            fastify.log.error(err);
            return;
        }

        if (fastify.io === null) return;

        fastify.io.on("connection", (socket)=>{
            socket.request = null;

            fastify.log.info("WS Connected");

            socket.on("disconnect", ()=>{
                fastify.log.info("WS Disconnected");
            });
        });
    });
};