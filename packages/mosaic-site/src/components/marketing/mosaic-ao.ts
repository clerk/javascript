import { bakeVertexSource, compile, setUniform } from '@/components/marketing/mosaic-bake';
import type { Uniforms } from '@/components/shader';

export type AoOptions = {
  radius: number;
  falloff: number;
  relief: number;
  bias: number;
  directional: number;
  light: { x: number; y: number };
};
export type AoQuality = { directions: number; steps: number };
export type AoFrame = { width: number; height: number; margin: number; scale: number };

export const AO_PREVIEW: AoQuality = { directions: 96, steps: 6 };
export const AO_BAKE: AoQuality = { directions: 128, steps: 8 };

const STRIP_ROWS = 64;

const quadVertexSource = `#version 300 es
precision highp float;
in vec2 coordinates;

void main(void) {
  gl_Position = vec4(coordinates, 0.0, 1.0);
}
`;

const aoFragmentSource = ({ directions, steps }: AoQuality) => `#version 300 es
precision highp float;

#define DIRECTIONS ${directions}
#define STEPS ${steps}
#define GOLDEN_ANGLE 2.39996323

uniform sampler2D u_height;
uniform vec2 u_size;
uniform float u_scale;
uniform float u_radius;
uniform float u_falloff;
uniform float u_relief;
uniform float u_bias;
uniform float u_directional;
uniform vec2 u_light;

out vec4 outColor;

float heightAt(vec2 texel) {
  return texture(u_height, texel / u_size).r * u_relief * u_scale;
}

void main() {
  vec2 at = gl_FragCoord.xy;
  if (texture(u_height, at / u_size).a <= 0.0) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  float height = heightAt(at);
  vec3 normal = normalize(vec3(
    heightAt(at - vec2(1.0, 0.0)) - heightAt(at + vec2(1.0, 0.0)),
    heightAt(at - vec2(0.0, 1.0)) - heightAt(at + vec2(0.0, 1.0)),
    2.0
  ));
  vec3 helper = abs(normal.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(helper, normal));
  vec3 bitangent = cross(normal, tangent);

  float radius = u_radius * u_scale;
  float falloff = radius * u_falloff * 0.2;
  float bias = u_bias * u_scale;
  vec3 origin = vec3(at, height);
  vec2 toLight = normalize(u_light - at);
  float occluded = 0.0;
  float total = 0.0;
  for (int d = 0; d < DIRECTIONS; d++) {
    float k = float(d) + 0.5;
    float r = sqrt(k / float(DIRECTIONS));
    float theta = k * GOLDEN_ANGLE;
    vec3 direction = tangent * (r * cos(theta)) + bitangent * (r * sin(theta)) + normal * sqrt(1.0 - r * r);
    float jitter = fract(float(d) * 0.61803399);
    float weight = max(0.0, 1.0 + u_directional * dot(direction.xy, toLight));
    total += weight * float(STEPS);
    for (int s = 0; s < STEPS; s++) {
      vec3 point = origin + direction * radius * ((float(s) + jitter) / float(STEPS));
      float above = heightAt(point.xy) - point.z;
      occluded += weight * step(bias, above) * smoothstep(0.0, 1.0, falloff / max(abs(above), 0.0001));
    }
  }
  occluded /= max(total, 0.0001);
  outColor = vec4(vec3(sqrt(occluded)), 1.0);
}
`;

function link(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.bindAttribLocation(program, 0, 'coordinates');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'Program link failed');
  }
  return program;
}

export function createAoRenderer(sceneSource: string, quality: AoQuality) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: true, antialias: false });
  if (!gl) {
    throw new Error('WebGL2 unavailable');
  }
  if (!gl.getExtension('EXT_color_buffer_float')) {
    throw new Error('Float render targets unavailable');
  }
  const context = gl;
  const sceneProgram = link(context, bakeVertexSource, sceneSource);
  const aoProgram = link(context, quadVertexSource, aoFragmentSource(quality));
  const buffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), context.STATIC_DRAW);
  context.enableVertexAttribArray(0);
  context.vertexAttribPointer(0, 2, context.FLOAT, false, 0, 0);
  const heightTexture = context.createTexture();
  const framebuffer = context.createFramebuffer();
  context.disable(context.BLEND);
  context.disable(context.DEPTH_TEST);

  return {
    canvas,
    render(uniforms: Uniforms, frame: AoFrame, options: AoOptions) {
      const fullWidth = frame.width + frame.margin * 2;
      const fullHeight = frame.height + frame.margin * 2;
      const width = Math.round(fullWidth * frame.scale);
      const height = Math.round(fullHeight * frame.scale);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.activeTexture(context.TEXTURE0);
      context.bindTexture(context.TEXTURE_2D, heightTexture);
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA16F,
        width,
        height,
        0,
        context.RGBA,
        context.HALF_FLOAT,
        null,
      );
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
      context.bindTexture(context.TEXTURE_2D, null);
      context.bindFramebuffer(context.FRAMEBUFFER, framebuffer);
      context.framebufferTexture2D(
        context.FRAMEBUFFER,
        context.COLOR_ATTACHMENT0,
        context.TEXTURE_2D,
        heightTexture,
        0,
      );
      context.viewport(0, 0, width, height);
      context.clearColor(0, 0, 0, 0);
      context.clear(context.COLOR_BUFFER_BIT);
      context.useProgram(sceneProgram);
      context.uniform2f(context.getUniformLocation(sceneProgram, 'u_resolution'), frame.width, frame.height);
      context.uniform2f(context.getUniformLocation(sceneProgram, 'u_bake_view'), fullWidth, fullHeight);
      context.uniform2f(context.getUniformLocation(sceneProgram, 'u_bake_margin'), frame.margin, frame.margin);
      context.uniform1f(context.getUniformLocation(sceneProgram, 'u_time'), 0);
      for (const name in uniforms) {
        setUniform(context, context.getUniformLocation(sceneProgram, name), uniforms[name]);
      }
      context.uniform1i(context.getUniformLocation(sceneProgram, 'u_view'), 0);
      context.uniform1i(context.getUniformLocation(sceneProgram, 'u_bake'), 4);
      context.uniform1i(context.getUniformLocation(sceneProgram, 'u_ao_map'), 1);
      context.drawArrays(context.TRIANGLE_STRIP, 0, 4);

      context.bindFramebuffer(context.FRAMEBUFFER, null);
      context.bindTexture(context.TEXTURE_2D, heightTexture);
      context.useProgram(aoProgram);
      context.uniform1i(context.getUniformLocation(aoProgram, 'u_height'), 0);
      context.uniform2f(context.getUniformLocation(aoProgram, 'u_size'), width, height);
      context.uniform1f(context.getUniformLocation(aoProgram, 'u_scale'), frame.scale);
      context.uniform1f(context.getUniformLocation(aoProgram, 'u_radius'), options.radius);
      context.uniform1f(context.getUniformLocation(aoProgram, 'u_falloff'), options.falloff);
      context.uniform1f(context.getUniformLocation(aoProgram, 'u_relief'), options.relief);
      context.uniform1f(context.getUniformLocation(aoProgram, 'u_bias'), options.bias);
      context.uniform1f(context.getUniformLocation(aoProgram, 'u_directional'), options.directional);
      context.uniform2f(
        context.getUniformLocation(aoProgram, 'u_light'),
        (frame.margin + options.light.x) * frame.scale,
        height - (frame.margin + options.light.y) * frame.scale,
      );
      context.enable(context.SCISSOR_TEST);
      for (let y = 0; y < height; y += STRIP_ROWS) {
        context.scissor(0, y, width, Math.min(STRIP_ROWS, height - y));
        context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
        context.finish();
      }
      context.disable(context.SCISSOR_TEST);
      return canvas;
    },
    read() {
      const { width, height } = canvas;
      const raw = new Uint8Array(width * height * 4);
      context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, raw);
      const rowBytes = width * 4;
      const data = new Uint8Array(raw.length);
      for (let y = 0; y < height; y += 1) {
        data.set(raw.subarray((height - 1 - y) * rowBytes, (height - y) * rowBytes), y * rowBytes);
      }
      return { data, width, height };
    },
    dispose() {
      context.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
