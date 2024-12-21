const VS_LOGO = "\nattribute vec4 a_Position;\nattribute vec2 a_TexCoord;\nvarying vec2 v_TexCoord;\nvoid main() {\n    gl_Position = a_Position;  \n    v_TexCoord = a_TexCoord;\n}",
    FS_LOGO = "\nprecision mediump float;\nuniform sampler2D u_Sampler;\nvarying vec2 v_TexCoord;\nvoid main() {\n    gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n}",
    options = {
        alpha: !1,
        antialias: !0,
        depth: !0,
        stencil: !0,
        premultipliedAlpha: !1,
        preserveDrawingBuffer: !1,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: !1
    };
let gl = null,
    image = null,
    program = null,
    rafHandle = null,
    texture = null,
    vertexBuffer = null,
    afterTick = null;

function initShaders(e, r) {
    return createProgram(e, r)
}

function createProgram(e, r) {
    var t = loadShader(gl.VERTEX_SHADER, e),
        l = loadShader(gl.FRAGMENT_SHADER, r),
        a = gl.createProgram();
    if (gl.attachShader(a, t), gl.attachShader(a, l), gl.linkProgram(a), !gl.getProgramParameter(a, gl.LINK_STATUS)) {
        gl.getProgramInfoLog(a);
        gl.deleteProgram(a), a = null
    }
    return gl.deleteShader(l), gl.deleteShader(t), a
}

function loadShader(e, r) {
    var t = gl.createShader(e);
    if (gl.shaderSource(t, r), gl.compileShader(t), !gl.getShaderParameter(t, gl.COMPILE_STATUS)) {
        gl.getShaderInfoLog(t);
        return gl.deleteShader(t), null
    }
    return t
}

function initVertexBuffer() {
    const e = 2 / canvas.width,
        r = 2 / canvas.height,
        t = new Float32Array([e, r, 1, 1, e, r, 1, 0, -e, r, 0, 1, -e, r, 0, 0]);
    vertexBuffer = gl.createBuffer(), gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer), gl.bufferData(gl.ARRAY_BUFFER, t, gl.STATIC_DRAW)
}

function updateVertexBuffer() {
    const e = canvas.width / image.width * image.height / canvas.height,
        r = new Float32Array([1, -e, 1, 1, 1, e, 1, 0, -1, -e, 0, 1, -1, e, 0, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer), gl.bufferData(gl.ARRAY_BUFFER, r, gl.STATIC_DRAW)
}

function loadImage(e) {
    return new Promise(((r, t) => {
        image = new Image, image.premultiplyAlpha = !1, image.onload = function() {
            r(image)
        }, image.onerror = function(e) {
            t(e)
        }, image.src = e.replace("#", "%23")
    }))
}

function initTexture() {
    texture = gl.createTexture(), gl.activeTexture(gl.TEXTURE0), gl.bindTexture(gl.TEXTURE_2D, texture), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255]))
}

function updateTexture() {
    gl.activeTexture(gl.TEXTURE0), gl.bindTexture(gl.TEXTURE_2D, texture), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
}

function draw() {
    gl.disable(gl.SCISSOR_TEST), gl.disable(gl.CULL_FACE), gl.disable(gl.DEPTH_TEST), gl.clearColor(0, 0, 0, 0), gl.clear(gl.COLOR_BUFFER_BIT), gl.useProgram(program), gl.activeTexture(gl.TEXTURE0), gl.bindTexture(gl.TEXTURE_2D, texture);
    var e = gl.getUniformLocation(program, "u_Sampler");
    gl.uniform1i(e, 0), gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var r = gl.getAttribLocation(program, "a_Position");
    gl.enableVertexAttribArray(r), gl.vertexAttribPointer(r, 2, gl.FLOAT, !1, 16, 0);
    var t = gl.getAttribLocation(program, "a_TexCoord");
    gl.enableVertexAttribArray(t), gl.vertexAttribPointer(t, 2, gl.FLOAT, !1, 16, 8), gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

function tick() {
    rafHandle = requestAnimationFrame((() => {
        draw(), tick(), afterTick && (afterTick(), afterTick = null)
    }))
}

function end() {
    return setProgress(1).then((() => {
        cancelAnimationFrame(rafHandle), gl.enable(gl.SCISSOR_TEST), gl.enable(gl.CULL_FACE), gl.enable(gl.DEPTH_TEST)
    }))
}

function setProgress(e) {
    return new Promise(((e, r) => {
        afterTick = () => {
            e()
        }
    }))
}

function start(e, r, t) {
    return options.alpha = "true" === e, options.antialias = "false" !== r, "true" === t && (gl = window.canvas.getContext("webgl2", options)), gl ? window.WebGL2RenderingContext = !0 : (window.WebGL2RenderingContext = !1, gl = window.canvas.getContext("webgl", options)), initVertexBuffer(), initTexture(), program = initShaders(VS_LOGO, FS_LOGO), tick(), loadImage("splash.png").then((() => (updateVertexBuffer(), updateTexture(), setProgress(0))))
}
module.exports = {
    start: start,
    end: end,
    setProgress: setProgress
};