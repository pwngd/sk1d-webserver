let iterationsUniform = 64;
let shaderSpeed = 0.00025;

window.addEventListener("load", async function() {
    const FRAGMENT_SHADER = "./assets/shaders/bg2.frag";

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

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener("mousemove", (event) => {
        mouseX = event.clientX / window.innerWidth;
        mouseY = -event.clientY / window.innerHeight;
    });

    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.className = "bg-canvas";
    document.body.appendChild(canvas);

    const gl = canvas.getContext("webgl");

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

    gl.uniform1i(uIter, iterationsUniform);

    // avoid cooking cpu by limiting fps!!
    const fps = 120;
    const interval = 1000 / fps;
    let lastTime = 0;

    function animate(time) {
        const deltaTime = time - lastTime;

        if (deltaTime > interval) {
            lastTime = time - (deltaTime % interval);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            gl.uniform1f(uTime, time * shaderSpeed);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform2f(uMouse, mouseX, mouseY);
            gl.uniform1i(uIter, iterationsUniform);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        requestAnimationFrame(animate);
    }

    

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    });

    animate(0);
});