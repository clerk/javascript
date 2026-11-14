'use client';

import type * as React from 'react';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export const vertexShaderSource = `#version 300 es
precision mediump float;
in vec2 coordinates;

uniform vec2 u_resolution;

out vec2 fragCoord;

void main(void) {
  gl_Position = vec4(coordinates, 0.0, 1.0);
  fragCoord = (coordinates + 1.0) * 0.5 * u_resolution;
  fragCoord.y = u_resolution.y - fragCoord.y;
}
`;

type Uniform =
  | { type: 'uniform1f'; value: number }
  | { type: 'uniform3f'; value: [number, number, number] }
  | { type: 'uniform4f'; value: [number, number, number, number] }
  | { type: 'uniform1fv'; value: Array<number> }
  | { type: 'uniform3fv'; value: Array<[number, number, number]> }
  | { type: 'uniform1i'; value: number };

export type Uniforms = Record<string, Uniform>;

type TextureUnit =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31;

interface ShaderProps {
  source: string;
  uniforms?: Uniforms;
  maxFps?: number;
  textures?: Array<string>;
  initialState?: 'playing' | 'paused';
  onRender?: (time: number) => void;
  liveUniforms?: () => Uniforms;
  shouldRender?: () => boolean;
  premultiplied?: boolean;
  pixelRatio?: () => number;
}

function loadImageAndCreateTextureInfo(
  gl: WebGL2RenderingContext | null,
  shaderProgram: WebGLProgram | null,
  url: string,
  number: TextureUnit,
): Promise<{
  width: number;
  height: number;
  texture: WebGLTexture;
  location: WebGLUniformLocation | null;
}> {
  return new Promise((resolve, reject) => {
    if (!gl || !shaderProgram) {
      return reject();
    }
    const tex = gl.createTexture();
    if (!tex) {
      return reject();
    }
    gl.activeTexture(gl[`TEXTURE${number}`]);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const textureInfo = {
      width: 1,
      height: 1,
      texture: tex,
      location: gl.getUniformLocation(shaderProgram, `u_texture_${number}`),
    };
    const img = new Image();
    img.addEventListener('load', () => {
      if (!gl) {
        return reject();
      }

      textureInfo.width = img.width;
      textureInfo.height = img.height;

      gl.activeTexture(gl[`TEXTURE${number}`]);
      gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      resolve(textureInfo);
    });
    img.src = url;
  });
}

export interface ShaderHandle {
  play: () => void;
  pause: () => void;
  fireEvent: () => number;
}

export const Shader = forwardRef(function Shader(
  {
    source: fragmentShaderSource,
    uniforms = {},
    textures = [],
    maxFps = Infinity,
    initialState = 'playing',
    onRender,
    liveUniforms,
    shouldRender,
    premultiplied = false,
    pixelRatio,
  }: ShaderProps,
  ref: React.ForwardedRef<ShaderHandle>,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef(initialState);
  const currentTime = useRef(0);
  const eventTime = useRef(0);
  const uniformsRef = useRef(uniforms);
  const liveUniformsRef = useRef(liveUniforms);
  const renderRef = useRef<((timestamp: number) => void) | null>(null);
  const runRef = useRef(0);
  const dirtyRef = useRef(true);
  const shouldRenderRef = useRef(shouldRender);
  const pixelRatioRef = useRef(pixelRatio);

  const frameRef = useRef(0);
  const startLoopRef = useRef<() => void>(() => {});

  useEffect(() => {
    const loop = (timestamp: number) => {
      renderRef.current?.(timestamp);
      frameRef.current = state.current === 'playing' ? requestAnimationFrame(loop) : 0;
    };
    startLoopRef.current = () => {
      if (!frameRef.current) {
        frameRef.current = requestAnimationFrame(loop);
      }
    };
    if (state.current === 'playing') {
      startLoopRef.current();
    }
    return () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };
  }, []);
  useEffect(() => {
    uniformsRef.current = uniforms;
    liveUniformsRef.current = liveUniforms;
    shouldRenderRef.current = shouldRender;
    pixelRatioRef.current = pixelRatio;
    dirtyRef.current = true;
  }, [uniforms, liveUniforms, shouldRender, pixelRatio]);

  useImperativeHandle(ref, () => {
    return {
      play() {
        state.current = 'playing';
        startLoopRef.current();
      },
      pause() {
        state.current = 'paused';
      },
      fireEvent() {
        eventTime.current = currentTime.current;
        return eventTime.current;
      },
    };
  }, []);

  useEffect(() => {
    const run = ++runRef.current;
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const scale = Math.round(Math.max(1, Math.min(window.devicePixelRatio ?? 1, 2)));
    let ratio = pixelRatioRef.current?.() ?? scale;
    const surface: HTMLCanvasElement = canvas;

    canvas.width = Math.round(canvas.offsetWidth * ratio);
    canvas.height = Math.round(canvas.offsetHeight * ratio);

    let gl = canvas.getContext('webgl2');

    if (!gl) {
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      gl = null;
      return;
    }

    const shaderProgram = createProgram(gl, vertexShader, fragmentShader);

    if (!shaderProgram) {
      gl = null;
      return;
    }

    gl.useProgram(shaderProgram);

    const vertexBuffer = gl.createBuffer();
    const vertices = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const coord = gl.getAttribLocation(shaderProgram, 'coordinates');
    gl.enableVertexAttribArray(coord);
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

    const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'u_resolution');
    const timeUniformLocation = gl.getUniformLocation(shaderProgram, 'u_time');
    const scrollUniformLocation = gl.getUniformLocation(shaderProgram, 'u_scroll');
    let scrollY = 0;
    let onScroll: (() => void) | null = null;
    if (scrollUniformLocation !== null) {
      scrollY = window.scrollY;
      onScroll = () => {
        scrollY = window.scrollY;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    const eventTimeUniformLocation = gl.getUniformLocation(shaderProgram, 'u_event_time');
    const customUniformLocations = new Map<string, WebGLUniformLocation | null>();

    for (const name in uniforms) {
      const location = gl.getUniformLocation(shaderProgram, name);
      customUniformLocations.set(name, location);
    }

    gl.uniform2f(resolutionUniformLocation, canvas.offsetWidth, canvas.offsetHeight);
    if (premultiplied) {
      gl.disable(gl.BLEND);
    } else {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }

    gl.disable(gl.DEPTH_TEST);

    let startTime: number | null = null;
    let lastTimestamp = 0;

    const textureInfo: Array<{
      width: number;
      height: number;
      texture: WebGLTexture;
      location: WebGLUniformLocation | null;
    }> = [];

    function drawImage(tex: WebGLTexture, loc: WebGLUniformLocation, unit: TextureUnit) {
      if (!gl) {
        return;
      }
      gl.uniform1i(loc, unit);
      gl.activeTexture(gl[`TEXTURE${unit}`]);
      gl.bindTexture(gl.TEXTURE_2D, tex);
    }

    function render(timestamp: number) {
      if (!gl) {
        return;
      }
      if (state.current === 'paused') {
        return;
      }

      const now = timestamp / 1000.0;
      if (startTime === null) {
        startTime = now;
      }

      if (maxFps !== Infinity) {
        const timestep = 1000 / maxFps;
        if (timestamp - lastTimestamp < timestep) {
          return;
        }
        lastTimestamp = timestamp;
      }

      currentTime.current = now - startTime;
      onRender?.(currentTime.current);
      const nextRatio = pixelRatioRef.current?.() ?? scale;
      if (nextRatio !== ratio) {
        ratio = nextRatio;
        surface.width = Math.round(surface.offsetWidth * ratio);
        surface.height = Math.round(surface.offsetHeight * ratio);
        dirtyRef.current = true;
      }
      const wanted = shouldRenderRef.current;
      if (wanted && !dirtyRef.current && !wanted()) {
        return;
      }
      dirtyRef.current = false;

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      gl.uniform1f(timeUniformLocation, currentTime.current);
      if (scrollUniformLocation !== null) {
        gl.uniform1f(scrollUniformLocation, scrollY);
      }
      gl.uniform1f(eventTimeUniformLocation, eventTime.current);
      const live = liveUniformsRef.current?.();
      const currentUniforms = live ? { ...uniformsRef.current, ...live } : uniformsRef.current;
      for (const name in currentUniforms) {
        const location = customUniformLocations.get(name) ?? null;
        const uniform = currentUniforms[name];
        switch (uniform.type) {
          case 'uniform1f':
            gl.uniform1f(location, uniform.value);
            break;
          case 'uniform3f':
            gl.uniform3f(location, uniform.value[0], uniform.value[1], uniform.value[2]);
            break;
          case 'uniform4f':
            gl.uniform4f(location, uniform.value[0], uniform.value[1], uniform.value[2], uniform.value[3]);
            break;
          case 'uniform1fv':
            gl.uniform1fv(location, uniform.value);
            break;
          case 'uniform3fv':
            gl.uniform3fv(location, uniform.value.flat());
            break;
          case 'uniform1i':
            gl.uniform1i(location, uniform.value);
            break;
          default: {
            const _exhaustiveCheck: never = uniform;
            return _exhaustiveCheck;
          }
        }
      }

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      for (let i = 0; i < textureInfo.length; i++) {
        const info = textureInfo[i];
        if (info.location) {
          drawImage(info.texture, info.location, i as TextureUnit);
        }
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    async function start() {
      for (let i = 0; i < textures.length; i++) {
        try {
          textureInfo.push(await loadImageAndCreateTextureInfo(gl, shaderProgram, textures[i], i as TextureUnit));
        } catch {
          return;
        }
      }
      if (gl) {
        renderRef.current = render;
      }
    }

    start();

    function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) {
        return null;
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
      }

      return program;
    }

    const observer = new window.ResizeObserver(() => {
      canvas.width = Math.round(canvas.offsetWidth * ratio);
      canvas.height = Math.round(canvas.offsetHeight * ratio);
      gl?.uniform2f(resolutionUniformLocation, canvas.offsetWidth, canvas.offsetHeight);
      dirtyRef.current = true;
    });
    observer.observe(canvas);

    return () => {
      renderRef.current = null;
      observer.disconnect();
      if (onScroll) {
        window.removeEventListener('scroll', onScroll);
      }
      if (gl) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteProgram(shaderProgram);
        gl.deleteBuffer(vertexBuffer);
        for (const { texture } of textureInfo) {
          gl.deleteTexture(texture);
        }
        const context = gl;
        setTimeout(() => {
          if (runRef.current === run) {
            context.getExtension('WEBGL_lose_context')?.loseContext();
          }
        });
        gl = null;
      }
    };
  }, [fragmentShaderSource, maxFps, textures.join(''), premultiplied]);

  return (
    <canvas
      ref={canvasRef}
      className='absolute inset-0 h-full w-full'
      aria-hidden
    />
  );
});
