let webglFadeInFunc = null;
window.addEventListener("load", async function() {
    const fpsElem = document.getElementById("fps");
    const FRAGMENT_SHADER = "./assets/shaders/bg2.frag";
    const baseWidth = 640;
    const baseHeight = 360;
    let aspectRatio = window.innerWidth / window.innerHeight;
    let mouseX = 0;
    let mouseY = 0;
    let shaderSpeed = 0.00025;

    function updateSize(canvas, gl, uRes) {
        aspectRatio = window.innerWidth / window.innerHeight;
        const renderWidth = Math.floor(baseWidth * Math.min(1, aspectRatio));
        const renderHeight = Math.floor(renderWidth / aspectRatio);
        canvas.width = renderWidth;
        canvas.height = renderHeight;
        gl.viewport(0, 0, renderWidth, renderHeight);
        
        if (uRes) gl.uniform2f(uRes, renderWidth, renderHeight);
    }

    async function loadShader(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Could not fetch shader from ${url}: ${response.statusText}`);
        }
        return await response.text();
    }

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        }
        console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", {antialias:true});
    canvas.className = "bg-canvas";
    updateSize(canvas, gl);
    document.body.appendChild(canvas);

    const vertexShaderSource = `
        attribute vec4 a_position;
        void main() {
            gl_Position = a_position;
        }
    `;

    const fragmentShaderSource = await loadShader(FRAGMENT_SHADER);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "time");
    const uRes = gl.getUniformLocation(program, "resolution");
    const uMouse = gl.getUniformLocation(program, "mouse");
    const uIter = gl.getUniformLocation(program, "iterations");

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1i(uIter, 64);

    webglFadeInFunc = (instant) => {
        if (instant) {
            gluniform1i(uIter, 128);
            shaderSpeed = 0.0025;
            return;
        }
        for (let i = 0; i < 256; i++) {
            setTimeout(()=>{
                gl.uniform1i(uIter, Math.min(i+64,128));
                shaderSpeed = 0.00025 * Math.pow(10, 1 - Math.pow(1 - (i / 256), 2));
            }, 5 * i);
        };
    };

    let lastTime = 0;

    function animate(time) {
        const deltaTime = time - lastTime;

        lastTime = time;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uTime, time * shaderSpeed);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        if (time % 2 == 0) {
            fpsElem.innerHTML = Math.floor(1000 / deltaTime) + "FPS";
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", (event) => {
        mouseX = event.clientX / window.innerWidth;
        mouseY = -event.clientY / window.innerHeight;
        gl.uniform2f(uMouse, mouseX, mouseY);
    });

    window.addEventListener("resize", () => {
        updateSize(canvas, gl, uRes);
    });

    gl.clearColor(0, 0, 0, 1);
    animate(0);
});