class Container {
    constructor (windowTitle = "", flex = "100%", className = "window") {
        this.flex = flex;

        const template = document.createElement("template");
        template.innerHTML = `
        <div class="${className}" style="flex: 0; margin: 30px; transform: skewX(30deg) skewY(50deg) scaleY(0.3); filter: blur(3px);">
            <div class="top-bar">
                <h1>${windowTitle}</h1>
            </div>
        </div>
        `;

        this.element = template.content.cloneNode(true).firstElementChild;
        this.topbar = this.element.querySelector(".top-bar");
        this.title = this.topbar.querySelector("h1");
    }

    append(parent) {
        parent.appendChild(this.element);

        setTimeout(() => {
            this.element.style.flex = this.flex;
            this.element.style.margin = "10px";
            this.element.style.transform = "";
            this.element.style.filter = "";
        }, 50);
    }

    destroy() {
        this.title.remove();
        this.topbar.remove();
        this.element.remove();
        this.element = null;
        this.topbar = null;
        this.title = null;
    }

    close() {
        this.element.style.flex = "0.1";
        this.element.style.margin = "15px";
        this.element.style.transform = "skewX(-30deg) skewY(-50deg) translateY(-5px) translateX(10px)";
        this.element.style.filter = "blur(20px)";
        setTimeout(()=>{this.destroy()}, 100);
    }
}

const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const pageCache = {};
const members = {};

const pageScripts = {
    chatroom: "/js/chat.js"
};

async function animateTyping(element, text) {
    let i = 0;
    let typed = "";
    const textLen = text.length;
    const typingInterval = setInterval(()=>{
        if (i < textLen) {
            element.innerHTML = typed;
            element.innerHTML += `${text[i]}|`;
            typed += text[i];
            i++;
        } else {
            clearInterval(typingInterval);
            element.innerHTML = typed;
        }
    }, 13);
    element.animate(
        [
          { opacity: "0" },
          { opacity: "1" }
        ],
        {
          duration: 500,
          easing: "ease",
          fill: "forwards"
        }
    );
}

async function cachePage(url) {
    if (pageCache[url]!=null) return;
    pageCache[url] = {loaded: false, html: null};
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.onload = () => {
        if (xhr.status != 200) return;
        pageCache[url].html = xhr.responseText;
    }
    xhr.send();
}

async function loadScript(title) {
    const script = pageScripts[title];
    if (script) {
        let module = await import(script);
        module.init(socket);
        return script;
    }
    return null;
}

async function loadPage(url) {
    const content = document.getElementById("content");
    let html = null;

    if (pageCache[url] === null) {
        if (pageCache[url].loaded === false) return;
        await cachePage(url);
    }

    html = pageCache[url].html;

    content.innerHTML = html;
    window.history.pushState({ path: url }, "", url);

    document.getElementById("main-window").animate(
        [
          { margin: "20px" },
          { margin: "10px" }
        ],
        {
          duration: 300,
          easing: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
          fill: "forwards"
        }
      );

    const title = document.getElementById("data-title");
    if (title!=null) {
        document.title = title.innerHTML;
        animateTyping(document.getElementById("page-title"), title.innerHTML);
    } else {
        animateTyping(document.getElementById("page-title"), "unknown");
    }

    loadScript(title.innerHTML);
}

window.onpopstate = (event) => {
    if (event.state && event.state.path) {
        loadPage(event.state.path);
    }
}

let cachedWindow = new Container("test", "100%", "window");

window.addEventListener("load", async ()=>{
    const windowsStack = [];
    let launched = false;

    const greeting = document.getElementById("greeting");
    const parent = document.getElementById("main-content");
    const mainWindow = document.getElementById("main-window");
    const clock = document.getElementById("clock");

    mainWindow.style.margin = "100px";

    const audio_bgm = document.getElementById("audio-bgm");
    const audio_launch = document.getElementById("audio-launch");
    const audio_notice = document.getElementById("audio-notice");
    const audio_notice_back = document.getElementById("audio-notice-back");
    
    const localeString = { hour: "numeric", minute: "numeric", hour12: true };

    const instantLoad = urlParams.get("instant");

    clock.innerText = (new Date()).toLocaleString("en-US", localeString);

    setInterval(() => {
        clock.innerText = (new Date()).toLocaleString("en-US", localeString);
    }, 2500);

    if (pageScripts[document.title]!==null) {
        loadScript(document.title);
    }

    function launch(instant) {
        if (launched==true) {return;}
        launched = true;
        greeting.style.opacity = 0;
        parent.style.opacity = 1;
        mainWindow.style.margin = "10px";

        audio_launch.play();

        webglFadeInFunc();

        setTimeout(()=>{
            greeting.remove();
            audio_bgm.play();
        }, 320);

        window.addEventListener("keydown", (event)=>{
            switch (event.key.toLowerCase()) {
                case "t":
                    if (cachedWindow == null) break;

                    cachedWindow.append(parent);
                    windowsStack.push(cachedWindow);

                    audio_notice.currentTime = 0;
                    audio_notice.play();
                    cachedWindow = new Container("test", "100%", "window");
                    break;
                case "w":
                    if (windowsStack.length<1) break;
                    audio_notice_back.currentTime = 0;
                    audio_notice_back.play();
                    windowsStack[windowsStack.length-1].close();
                    windowsStack.pop();
                    break;
            }
        });
    }

    window.addEventListener("click", launch);
    window.addEventListener("touchstart", launch);

    const links = document.getElementsByClassName("sidebar")[0].getElementsByTagName("a");

    for (let i=0; i<links.length; i++) {
        links[i].addEventListener("click", ()=>{
            audio_notice.currentTime = 0;
            audio_notice.play();
            loadPage(links[i].href);
        });

        links[i].addEventListener("mouseover", ()=>{
            cachePage(links[i].href);
        });
    }

    socket.on("stats", (stats)=>{
        if (document.title!=="homepage") return;
        document.getElementById("stats_online").innerText = stats.online;
        document.getElementById("stats_views").innerText = stats.views;
        document.getElementById("stats_memory").innerText = stats.memory;
        document.getElementById("stats_uptime").innerText = stats.uptime;
        document.getElementById("stats_elapsed").innerText = stats.elapsed;
    });
});