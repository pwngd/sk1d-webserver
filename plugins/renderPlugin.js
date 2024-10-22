module.exports = (server, opts, done) => {
    server.get("/", async (req, rep) => {
        return rep.viewAsync("index",  { title:"homepage" }, { layout: "./layouts/layout.ejs" });
    });
    
    server.get("/test", async (req, rep) => {
        return rep.viewAsync("test",  { title:"testpage" }, { layout: "./layouts/layout.ejs" });
    });

    done();
}