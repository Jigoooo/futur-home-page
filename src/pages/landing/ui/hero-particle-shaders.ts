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

vec3 braidedFlow(vec2 uv, float time) {
  float lane = min(floor(uv.y * 3.0), 2.0);
  float across = (fract(uv.y * 3.0) - 0.5) * 2.0;
  float compactAcross = sign(across) * pow(abs(across), 1.45);
  float laneOffset = lane - 1.0;
  float phase = lane * TAU / 3.0;
  float x = (uv.x * 2.0 - 1.0) * 2.62;
  float crossing = laneOffset * cos(uv.x * PI) * 0.74;
  float y = crossing + sin(uv.x * TAU + phase) * 0.1 + compactAcross * 0.28;
  float z = sin(uv.x * TAU + phase + time * 0.1) * 0.44 + across * 0.09;
  return vec3(x, y, z);
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

vec3 fitSurfaceToFrame(int index, vec3 position) {
  if (index == 0) return position;
  if (index == 1) return position * vec3(2.05, 1.85, 1.2);
  if (index == 2) return position * vec3(1.62, 1.68, 1.12);
  return position * vec3(2.08, 1.82, 1.22);
}

vec3 sampleSurface(int index, vec2 uv, float time) {
  vec3 position;
  if (index == 0) position = braidedFlow(uv, time);
  else if (index == 1) position = asymmetricKnot(uv, time);
  else if (index == 2) position = waveSaddle(uv, time);
  else position = doubleLoop(uv, time);
  return fitSurfaceToFrame(index, position);
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
  seedFlight: 0.28,
  surfaceLift: 0.035,
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
out float vContact;
out float vSeed;
out vec2 vScreenUv;

void main() {
  vec3 surface = morphSurface(uFromSurface, uToSurface, aUv, uTime, uMorph);
  vec2 projected = projectSurface(surface, uAspect);
  vec2 screenUv = projected * 0.5 + 0.5;
  vec2 contactField = texture(uDisplacementTexture, screenUv).rg;
  float contact = smoothstep(0.002, 0.022, length(contactField));
  vec2 contactOffset = clamp(contactField * 0.72, vec2(-0.035), vec2(0.035));
  projected += contactOffset;

  float depth = clamp(0.5 + surface.z * 0.42, 0.0, 1.0);
  gl_Position = vec4(projected, mix(0.45, -0.45, depth), 1.0);
  gl_PointSize = mix(0.9, 2.45, depth) * mix(1.0, 1.22, contact) * uDpr;

  vDepth = depth;
  vContact = contact;
  vSeed = aSeed;
  vScreenUv = screenUv;
}
`;

export const MAIN_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in float vDepth;
in float vContact;
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
  vec3 farColor = vec3(0.18, 0.42, 0.5);
  vec3 nearColor = vec3(0.5, 0.78, 0.8);
  vec3 color = mix(farColor, nearColor, vDepth);
  color = mix(color, vec3(0.74, 0.93, 0.91), densityLight + vSeed * 0.04);
  color = mix(color, vec3(0.82, 0.96, 0.94), vContact * 0.42);
  float alpha = disc * mix(0.3, 0.68, vDepth) * (0.82 + densityLight * 0.7);
  alpha *= 1.0 + vContact * 0.18;
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
uniform sampler2D uDisplacementTexture;
uniform int uFromSurface;
uniform int uToSurface;

out float vEmitterAlpha;
out float vEmitterAngle;

${SURFACE_GLSL}

void main() {
  vec3 surface = morphSurface(uFromSurface, uToSurface, aUv, uTime, uMorph);
  vec2 baseProjected = projectSurface(surface, uAspect);
  vec2 baseScreenUv = baseProjected * 0.5 + 0.5;
  vec2 contactField = texture(uDisplacementTexture, baseScreenUv).rg;
  float trailContact = smoothstep(0.0015, 0.018, length(contactField));
  vec2 pointerDelta = baseProjected - uPointer;
  pointerDelta.x *= uAspect;
  float pointerInfluence = max(
    smoothstep(0.42, 0.02, length(pointerDelta)) * uPointerEnergy,
    trailContact
  );
  float phase = fract(uTime * 0.34 + aSeed);
  float pulse = pow(sin(phase * PI), 2.0);
  vec3 surfaceU = morphSurface(
    uFromSurface,
    uToSurface,
    aUv + vec2(0.002, 0.0),
    uTime,
    uMorph
  );
  vec3 surfaceV = morphSurface(
    uFromSurface,
    uToSurface,
    aUv + vec2(0.0, 0.002),
    uTime,
    uMorph
  );
  vec3 surfaceNormal = normalize(cross(surfaceU - surface, surfaceV - surface));
  if (surfaceNormal.z < 0.0) surfaceNormal *= -1.0;
  float lift = pulse * pointerInfluence * ${HERO_POINTER_RESPONSE.surfaceLift};
  float seedFlight = pow(phase, 0.78) * pointerInfluence * ${HERO_POINTER_RESPONSE.seedFlight};
  vec3 flightDirection = normalize(surfaceNormal * 0.78 + aDirection * 0.42);
  vec3 drift = vec3(aDirection.y, -aDirection.x, aDirection.z * 0.25) * sin(phase * PI) * 0.045;
  vec3 emitted = surface + surfaceNormal * lift + flightDirection * seedFlight + drift;
  vec2 projected = projectSurface(emitted, uAspect);
  vec2 projectedDirection = projectSurface(surface + flightDirection * 0.08, uAspect) - baseProjected;

  gl_Position = vec4(projected, 0.0, 1.0);
  gl_PointSize = mix(4.2, 2.5, phase) * uDpr;
  vEmitterAlpha = (1.0 - smoothstep(0.72, 1.0, phase)) * pointerInfluence;
  vEmitterAngle = atan(projectedDirection.y, projectedDirection.x);
}
`;

export const EMITTER_FRAGMENT_SHADER = `#version 300 es
precision highp float;

in float vEmitterAlpha;
in float vEmitterAngle;
out vec4 outColor;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float sine = sin(-vEmitterAngle);
  float cosine = cos(-vEmitterAngle);
  point = mat2(cosine, -sine, sine, cosine) * point;
  float seedHead = smoothstep(0.16, 0.025, length(point - vec2(0.19, 0.0)));
  float seedStem = smoothstep(0.045, 0.012, abs(point.y)) *
    smoothstep(-0.34, -0.06, point.x) * (1.0 - smoothstep(0.08, 0.3, point.x));
  float seedTuft = smoothstep(0.23, 0.06, length(point + vec2(0.14, 0.0))) * 0.48;
  float alpha = max(seedHead, max(seedStem, seedTuft)) * vEmitterAlpha * 0.9;
  if (alpha <= 0.01) discard;
  vec3 color = vec3(0.72, 0.94, 0.9);
  outColor = vec4(color * alpha, alpha);
}
`;
