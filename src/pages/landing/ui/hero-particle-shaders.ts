const SURFACE_GLSL = `
const float PI = 3.14159265359;
const float TAU = 6.28318530718;

mat3 rotateX(float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);
  return mat3(1.0, 0.0, 0.0, 0.0, cosine, -sine, 0.0, sine, cosine);
}

mat3 rotateY(float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);
  return mat3(cosine, 0.0, sine, 0.0, 1.0, 0.0, -sine, 0.0, cosine);
}

vec3 foldedRibbon(vec2 uv, float time) {
  float u = (uv.x * 2.0 - 1.0) * PI;
  float v = (uv.y * 2.0 - 1.0) * 0.42;
  float fold = sin(u * 2.0 + time * 0.18) * 0.28;
  return vec3(sin(u) * (0.72 + v), v + fold, cos(u) * (0.48 + v));
}

vec3 asymmetricKnot(vec2 uv, float time) {
  float u = uv.x * TAU;
  float v = (uv.y * 2.0 - 1.0) * 0.16;
  vec3 center = vec3(
    sin(u) + 0.38 * sin(3.0 * u),
    0.56 * sin(2.0 * u + time * 0.05),
    cos(u) - 0.26 * cos(3.0 * u)
  );
  return center * 0.58 + vec3(v * cos(u), v * sin(u), v * sin(2.0 * u));
}

vec3 waveSaddle(vec2 uv, float time) {
  vec2 point = (uv * 2.0 - 1.0) * vec2(1.15, 0.72);
  float z =
    (point.x * point.x - point.y * point.y) * 0.34 +
    sin(point.x * 4.0 + time * 0.2) * 0.08;
  return vec3(point.x, point.y, z);
}

vec3 doubleLoop(vec2 uv, float time) {
  float u = uv.x * TAU;
  float tube = (uv.y * 2.0 - 1.0) * 0.2;
  vec3 center = vec3(sin(u), 0.5 * sin(2.0 * u + time * 0.05), 0.55 * cos(u));
  return center * 0.78 + vec3(tube * cos(u), tube, tube * sin(u));
}

vec3 sampleSurface(int index, vec2 uv, float time) {
  if (index == 0) return foldedRibbon(uv, time);
  if (index == 1) return asymmetricKnot(uv, time);
  if (index == 2) return waveSaddle(uv, time);
  return doubleLoop(uv, time);
}

vec3 morphSurface(int fromIndex, int toIndex, vec2 uv, float time, float morph) {
  float easedMorph = morph * morph * (3.0 - 2.0 * morph);
  vec3 fromPoint = sampleSurface(fromIndex, uv, time);
  vec3 toPoint = sampleSurface(toIndex, uv, time);
  vec3 position = mix(fromPoint, toPoint, easedMorph);
  position = rotateY(time * 0.055) * rotateX(sin(time * 0.11) * 0.14) * position;
  return position;
}

vec2 projectSurface(vec3 position, float aspect) {
  float perspective = 1.88 / max(2.85 - position.z, 1.4);
  vec2 projected = position.xy * perspective;
  projected.x /= max(aspect, 1.0);
  projected.y *= 1.04;
  return projected;
}
`;

export const HERO_POINTER_RESPONSE = {
  radialImpulse: 0.0035,
  radiusMax: 0.105,
  radiusMin: 0.055,
  tangentImpulse: 0.0005,
} as const;

export const DISPLACEMENT_VERTEX_SHADER = `#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  vec2 position = vec2(
    float((gl_VertexID << 1) & 2),
    float(gl_VertexID & 2)
  );
  vUv = position;
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const DISPLACEMENT_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;

uniform sampler2D uPreviousField;
uniform vec4 uPointerTrail[24];
uniform int uPointerCount;
uniform float uAspect;
uniform float uDamping;

out vec4 outColor;

void main() {
  vec2 field = texture(uPreviousField, vUv).rg * uDamping;
  vec2 ndc = vUv * 2.0 - 1.0;

  for (int index = 0; index < 24; index += 1) {
    if (index >= uPointerCount) break;
    vec4 samplePoint = uPointerTrail[index];
    vec2 delta = ndc - samplePoint.xy;
    delta.x *= uAspect;
    float distanceFromPointer = length(delta);
    float radius = mix(${HERO_POINTER_RESPONSE.radiusMin}, ${HERO_POINTER_RESPONSE.radiusMax}, samplePoint.z);
    float influence = exp(-distanceFromPointer * distanceFromPointer / (radius * radius));
    vec2 direction = delta / max(distanceFromPointer, 0.001);
    direction.x /= uAspect;
    vec2 tangent = vec2(-direction.y, direction.x);
    field += direction * influence * samplePoint.z * samplePoint.w * ${HERO_POINTER_RESPONSE.radialImpulse};
    field += tangent * influence * samplePoint.z * samplePoint.w * ${HERO_POINTER_RESPONSE.tangentImpulse};
  }

  outColor = vec4(clamp(field, vec2(-0.16), vec2(0.16)), 0.0, 1.0);
}
`;

const PARTICLE_VERTEX_HEADER = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aUv;
layout(location = 1) in float aSeed;

uniform float uAspect;
uniform float uDpr;
uniform float uMorph;
uniform float uTime;
uniform int uFromSurface;
uniform int uToSurface;
uniform sampler2D uDisplacementTexture;

${SURFACE_GLSL}
`;

export const DENSITY_VERTEX_SHADER = `${PARTICLE_VERTEX_HEADER}
void main() {
  vec3 surface = morphSurface(uFromSurface, uToSurface, aUv, uTime, uMorph);
  vec2 projected = projectSurface(surface, uAspect);
  vec2 screenUv = projected * 0.5 + 0.5;
  projected += texture(uDisplacementTexture, screenUv).rg;
  gl_Position = vec4(projected, 0.0, 1.0);
  gl_PointSize = 1.35;
}
`;

export const DENSITY_FRAGMENT_SHADER = `#version 300 es
precision highp float;

out vec4 outColor;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float disc = smoothstep(0.5, 0.12, length(point));
  if (disc <= 0.01) discard;
  outColor = vec4(vec3(disc * 0.055), disc * 0.055);
}
`;

export const MAIN_VERTEX_SHADER = `${PARTICLE_VERTEX_HEADER}
out float vDepth;
out float vSeed;
out vec2 vScreenUv;

void main() {
  vec3 surface = morphSurface(uFromSurface, uToSurface, aUv, uTime, uMorph);
  vec2 projected = projectSurface(surface, uAspect);
  vec2 screenUv = projected * 0.5 + 0.5;
  projected += texture(uDisplacementTexture, screenUv).rg;

  float depth = clamp(0.5 + surface.z * 0.42, 0.0, 1.0);
  gl_Position = vec4(projected, mix(0.45, -0.45, depth), 1.0);
  gl_PointSize = mix(0.72, 2.5, depth) * uDpr;

  vDepth = depth;
  vSeed = aSeed;
  vScreenUv = projected * 0.5 + 0.5;
}
`;

export const MAIN_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in float vDepth;
in float vSeed;
in vec2 vScreenUv;

uniform sampler2D uDensityTexture;

out vec4 outColor;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float distanceFromCenter = length(point);
  float disc = smoothstep(0.5, 0.07, distanceFromCenter);
  if (disc <= 0.01) discard;

  float density = texture(uDensityTexture, vScreenUv).r;
  float densityLight = min(log(1.0 + density * 6.0) * 0.18, 0.7);
  vec3 farColor = vec3(0.12, 0.35, 0.43);
  vec3 nearColor = vec3(0.5, 0.78, 0.8);
  vec3 color = mix(farColor, nearColor, vDepth);
  color = mix(color, vec3(0.74, 0.93, 0.91), densityLight + vSeed * 0.04);
  float alpha = disc * mix(0.2, 0.72, vDepth) * (0.82 + densityLight * 0.7);
  outColor = vec4(color * alpha, alpha);
}
`;

export const EMITTER_VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aUv;
layout(location = 1) in float aSeed;
layout(location = 2) in vec3 aDirection;

uniform float uAspect;
uniform float uDpr;
uniform float uMorph;
uniform float uTime;
uniform float uPointerEnergy;
uniform vec2 uPointer;
uniform int uFromSurface;
uniform int uToSurface;

out float vEmitterAlpha;

${SURFACE_GLSL}

void main() {
  vec3 surface = morphSurface(uFromSurface, uToSurface, aUv, uTime, uMorph);
  vec2 baseProjected = projectSurface(surface, uAspect);
  vec2 pointerDelta = baseProjected - uPointer;
  pointerDelta.x *= uAspect;
  float pointerInfluence = smoothstep(0.48, 0.02, length(pointerDelta)) * uPointerEnergy;
  float phase = fract(uTime * 0.2 + aSeed);
  vec3 direction = normalize(surface + aDirection * 0.58 + vec3(0.001));
  vec3 emitted = surface + direction * phase * 0.62 * pointerInfluence;
  vec2 projected = projectSurface(emitted, uAspect);

  gl_Position = vec4(projected, 0.0, 1.0);
  gl_PointSize = mix(1.4, 0.55, phase) * uDpr;
  vEmitterAlpha = (1.0 - phase) * (1.0 - phase) * pointerInfluence;
}
`;

export const EMITTER_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in float vEmitterAlpha;
out vec4 outColor;

void main() {
  float disc = smoothstep(0.5, 0.08, length(gl_PointCoord - 0.5));
  float alpha = disc * vEmitterAlpha * 0.64;
  if (alpha <= 0.01) discard;
  vec3 color = vec3(0.58, 0.88, 0.86);
  outColor = vec4(color * alpha, alpha);
}
`;
