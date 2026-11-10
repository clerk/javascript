const VERTEX = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
const FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform float uProgress;
uniform float uDpr;
void main() {
  float y = 1.0 - gl_FragCoord.y / uRes.y;
  float d = y - uProgress;
  float swept = step(d, 0.0);
  float line = exp(-abs(d) * 90.0);
  float trail = exp(-abs(d) * 9.0) * swept * 0.25;
  vec2 cell = gl_FragCoord.xy / (14.0 * uDpr);
  float dots = smoothstep(0.14, 0.0, length(fract(cell) - 0.5)) * 0.22 * swept;
  float scan = (sin(gl_FragCoord.y / uDpr * 1.6) * 0.5 + 0.5) * 0.025 * swept;
  vec3 violet = vec3(0.55, 0.36, 1.0);
  vec3 cyan = vec3(0.1, 0.8, 0.9);
  vec3 color = mix(violet, cyan, gl_FragCoord.x / uRes.x);
  float alpha = clamp(line * 0.95 + trail + dots + scan, 0.0, 1.0);
  gl_FragColor = vec4(color * alpha, alpha);
}
`;
const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
};
export type Sweep = {
  resize: (width: number, height: number) => void;
  draw: (progress: number) => void;
  dispose: () => void;
};
export function createSweep(canvas: HTMLCanvasElement): Sweep | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true });
  const vertex = gl && compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = gl && compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl?.createProgram();
  if (!gl || !vertex || !fragment || !program) {
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const res = gl.getUniformLocation(program, 'uRes');
  const progress = gl.getUniformLocation(program, 'uProgress');
  const dprUniform = gl.getUniformLocation(program, 'uDpr');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let current = 0;
  const render = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(res, canvas.width, canvas.height);
    gl.uniform1f(progress, current);
    gl.uniform1f(dprUniform, dpr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  return {
    resize: (width, height) => {
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      render();
    },
    draw: value => {
      current = value;
      render();
    },
    dispose: () => {
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    },
  };
}
