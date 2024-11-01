module.exports = async (fastify, opts) => {
    const MAIN_LAYOUT = "./layouts/layout.ejs";
    const DATA_LAYOUT = "./layouts/data.ejs";

    function isAjax(req) {return req.headers["x-requested-with"] === "XMLHttpRequest"};

    fastify.setNotFoundHandler(async (req, rep) => {
        const data = { title:"404" };

        if (isAjax(req)) {
            return rep.viewAsync("404", data, { layout: DATA_LAYOUT} );
        } else {
            return rep.viewAsync("404", data, { layout: MAIN_LAYOUT });
        }
    });

    fastify.get("/", async (req, rep) => {
        const data = { title:"homepage" };

        if (isAjax(req)) {
            return rep.viewAsync("index", data, { layout: DATA_LAYOUT} );
        } else {
            return rep.viewAsync("index", data, { layout: MAIN_LAYOUT });
        }
    });
    
    fastify.get("/test", async (req, rep) => {
        const data = { title:"testpage" };

        if (isAjax(req)) {
            return rep.viewAsync("test", data, { layout: DATA_LAYOUT} );
        } else {
            return rep.viewAsync("test", data, { layout: MAIN_LAYOUT });
        }
    });

    fastify.get("/chat", async (req, rep) => {
        const data = { title:"chatroom" };

        if (isAjax(req)) {
            return rep.viewAsync("chat", data, { layout: DATA_LAYOUT} );
        } else {
            return rep.viewAsync("chat", data, { layout: MAIN_LAYOUT });
        }
    });
};