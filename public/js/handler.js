class Container {
    constructor (windowTitle = "", flex = "100%", className = "window") {
        this.flex = flex;

        this.element = document.createElement("div");
        this.element.className = className;
        this.element.style.flex = "0";
        this.element.style.margin = "30px";
        

        this.topbar = document.createElement("div");
        this.topbar.className = "top-bar";
        this.title = document.createElement("h1");
        this.title.innerText = windowTitle;
        this.topbar.appendChild(this.title);
        this.element.appendChild(this.topbar);
    }

    append(parent) {
        parent.appendChild(this.element);

        setTimeout(() => {
            this.element.style.flex = this.flex;
            this.element.style.margin = "10px";
        }, 50);
    }
}

let launched = false;
let cachedWindow = new Container("test", "100%", "window");
let currentDepth = 0;

window.addEventListener("load", async ()=>{
    const greeting = document.getElementById("greeting");
    const parent = document.getElementById("main-content");
    const mainWindow = document.getElementById("main-window");
    const clock = document.getElementById("clock");

    mainWindow.style.margin = "100px";

    const audio_bgm = document.getElementById("audio-bgm");
    const audio_launch = document.getElementById("audio-launch");
    const audio_notice = document.getElementById("audio-notice");
    
    const localeString = { hour: "numeric", minute: "numeric", hour12: true };

    clock.innerText = (new Date()).toLocaleString("en-US", localeString);

    setInterval(() => {
        clock.innerText = (new Date()).toLocaleString("en-US", localeString);
    }, 2500);

    function launch() {
        if (launched==true) {return;}
        launched = true;
        greeting.style.opacity = 0;
        parent.style.opacity = 1;
        mainWindow.style.margin = "10px";

        audio_launch.play();

        for (let i = 0; i < 256; i++) {
            setTimeout(()=>{
                iterationsUniform = Math.min(i+64,128);
                shaderSpeed = 0.00025 * Math.pow(10, 1 - Math.pow(1 - (i / 256), 2));
            }, 5 * i);
        }

        setTimeout(()=>{
            greeting.remove();
            audio_bgm.play();
        }, 320);

        window.addEventListener("keydown", (event)=>{
            switch (event.key.toLowerCase()) {
                case "t":
                    if (cachedWindow == null) break;
                    cachedWindow.append(parent);
                    audio_notice.currentTime = 0;
                    audio_notice.play();
                    cachedWindow = new Container("test", "100%", "window");
                    cachedWindow.element.style.flexDirection = (currentDepth % 2 === 0) ? "row" : "column";
                    currentDepth += 1;
                    break;
            }
        });
    }

    window.addEventListener("click", launch);
    window.addEventListener("touchstart", launch);
});