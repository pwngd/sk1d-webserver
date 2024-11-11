module.exports = async (fastify, opts) => {
    const fs = require("fs");
    const ytdl = require("@distube/ytdl-core");
    const HttpsProxyAgent = require("https-proxy-agent").HttpsProxyAgent;

    fastify.get("/api/video", (req, rep)=>{
        const videoUrl = req.query.url;
        if (!videoUrl || !ytdl.validateURL(videoUrl)) {
            rep.status(400).send({ error: "Invalid YT URL" });
            return;
        }

        const proxyUrl = "http://103.153.149.49:1111";
        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.youtube.com/",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "DNT": "1",
            "Host": "www.youtube.com",
            "Pragma": "no-cache"
        };          

        rep.header("Content-Type", "video/mp4");
        rep.header("Content-Disposition", "attachment; filename=\"video.mp4\"");

        const videoStream = ytdl(videoUrl, {
            quality: "lowest",
            filter: "videoonly",
            requestOptions: {
              headers: headers
            },
        });

        // Track download progress
        let downloadedBytes = 0;
        let totalBytes = 0;

        // Fetch content length to calculate percentage
        videoStream.on("response", (res) => {
            totalBytes = parseInt(res.headers["content-length"], 10);
            console.log(`Total file size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
        });

        // Track data chunks to calculate progress
        videoStream.on("data", (chunk) => {
            downloadedBytes += chunk.length;
            const percent = ((downloadedBytes / totalBytes) * 100).toFixed(2);
            console.log(`Downloaded: ${percent}%`);
        });

        videoStream.pipe(rep.raw);

        videoStream.on("error", (error) => {
            console.error("Error streaming video:", error);
            rep.status(500).send({ error: "Error streaming video" });
        });

        videoStream.on("end", () => {
            console.log("Download completed");
            rep.raw.end();
        });
    });
}