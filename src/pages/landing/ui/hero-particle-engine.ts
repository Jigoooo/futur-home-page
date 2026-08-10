import {
  createArrayBuffer,
  createFloatRenderTarget,
  createProgram,
  deleteRenderTarget,
  type RenderTarget,
} from './hero-particle-gl';
import {
  DENSITY_FRAGMENT_SHADER,
  DENSITY_VERTEX_SHADER,
  DISPLACEMENT_FRAGMENT_SHADER,
  DISPLACEMENT_VERTEX_SHADER,
  EMITTER_FRAGMENT_SHADER,
  EMITTER_VERTEX_SHADER,
  HERO_POINTER_RESPONSE,
  MAIN_FRAGMENT_SHADER,
  MAIN_VERTEX_SHADER,
} from './hero-particle-shaders';

const FIELD_SIZE = 128;
const POINTER_TRAIL_SIZE = 24;
const SURFACE_COUNT = 4;
const SURFACE_HOLD_MS = 5_800;
const SURFACE_MORPH_MS = 520;
const SURFACE_CYCLE_MS = SURFACE_HOLD_MS + SURFACE_MORPH_MS;

export type HeroParticlePointer = {
  x: number;
  y: number;
  at: number;
};

type PointerSample = HeroParticlePointer & {
  velocity: number;
};

type ParticleTier = {
  dpr: number;
  emit: number;
  main: number;
};

type SurfaceUniforms = {
  aspect: WebGLUniformLocation | null;
  displacementTexture: WebGLUniformLocation | null;
  dpr: WebGLUniformLocation | null;
  fromSurface: WebGLUniformLocation | null;
  morph: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  toSurface: WebGLUniformLocation | null;
};

export type HeroParticleEngine = {
  clearPointer: () => void;
  destroy: () => void;
  resize: () => void;
  setPointer: (position: HeroParticlePointer) => void;
  start: () => void;
  stop: () => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothStep(value: number) {
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function halton(index: number, base: number) {
  let fraction = 1;
  let result = 0;
  let current = index;

  while (current > 0) {
    fraction /= base;
    result += fraction * (current % base);
    current = Math.floor(current / base);
  }

  return result;
}

function getParticleTier(width: number): ParticleTier {
  if (width < 720) return { main: 16_000, emit: 0, dpr: 1.2 };
  if (width < 1_180) return { main: 32_000, emit: 1_500, dpr: 1.35 };
  return { main: 55_000, emit: 3_000, dpr: 1.5 };
}

function createParticleData(mainCount: number, emitCount: number) {
  const random = createSeededRandom(0xf07a2);
  const uvs = new Float32Array(mainCount * 2);
  const seeds = new Float32Array(mainCount);
  const directions = new Float32Array(emitCount * 3);

  for (let index = 0; index < mainCount; index += 1) {
    uvs[index * 2] = halton(index + 1, 2);
    uvs[index * 2 + 1] = halton(index + 1, 3);
    seeds[index] = random();

    if (index >= emitCount) continue;
    const theta = random() * Math.PI * 2;
    const z = random() * 2 - 1;
    const radius = Math.sqrt(Math.max(0, 1 - z * z));
    directions[index * 3] = Math.cos(theta) * radius;
    directions[index * 3 + 1] = Math.sin(theta) * radius;
    directions[index * 3 + 2] = z;
  }

  return { directions, seeds, uvs };
}

function getSurfaceUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): SurfaceUniforms {
  return {
    aspect: gl.getUniformLocation(program, 'uAspect'),
    displacementTexture: gl.getUniformLocation(program, 'uDisplacementTexture'),
    dpr: gl.getUniformLocation(program, 'uDpr'),
    fromSurface: gl.getUniformLocation(program, 'uFromSurface'),
    morph: gl.getUniformLocation(program, 'uMorph'),
    time: gl.getUniformLocation(program, 'uTime'),
    toSurface: gl.getUniformLocation(program, 'uToSurface'),
  };
}

function bindParticleAttributes(
  gl: WebGL2RenderingContext,
  vertexArray: WebGLVertexArrayObject,
  uvBuffer: WebGLBuffer,
  seedBuffer: WebGLBuffer,
) {
  gl.bindVertexArray(vertexArray);
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);
}

function clearRenderTarget(gl: WebGL2RenderingContext, target: RenderTarget) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
  gl.viewport(0, 0, target.width, target.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

export function createHeroParticleEngine(canvas: HTMLCanvasElement): HeroParticleEngine | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    desynchronized: true,
    failIfMajorPerformanceCaveat: true,
    powerPreference: 'high-performance',
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    stencil: false,
  });

  if (
    !gl ||
    gl.isContextLost() ||
    (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float'))
  ) {
    return null;
  }

  const programs = {
    density: createProgram(gl, DENSITY_VERTEX_SHADER, DENSITY_FRAGMENT_SHADER),
    displacement: createProgram(gl, DISPLACEMENT_VERTEX_SHADER, DISPLACEMENT_FRAGMENT_SHADER),
    emitter: createProgram(gl, EMITTER_VERTEX_SHADER, EMITTER_FRAGMENT_SHADER),
    main: createProgram(gl, MAIN_VERTEX_SHADER, MAIN_FRAGMENT_SHADER),
  };

  if (!programs.density || !programs.displacement || !programs.emitter || !programs.main) {
    Object.values(programs).forEach((program) => {
      if (program) gl.deleteProgram(program);
    });
    return null;
  }

  const bounds = canvas.getBoundingClientRect();
  const tier = getParticleTier(Math.max(bounds.width, window.innerWidth));
  const particleData = createParticleData(tier.main, tier.emit);
  const uvBuffer = createArrayBuffer(gl, particleData.uvs);
  const seedBuffer = createArrayBuffer(gl, particleData.seeds);
  const directionBuffer = tier.emit > 0 ? createArrayBuffer(gl, particleData.directions) : null;
  const mainVertexArray = gl.createVertexArray();
  const emitterVertexArray = tier.emit > 0 ? gl.createVertexArray() : null;
  const fullscreenVertexArray = gl.createVertexArray();
  const displacementA = createFloatRenderTarget(gl, FIELD_SIZE, FIELD_SIZE);
  const displacementB = createFloatRenderTarget(gl, FIELD_SIZE, FIELD_SIZE);
  const densityTarget = createFloatRenderTarget(gl, FIELD_SIZE, FIELD_SIZE);

  const hasRequiredResources =
    uvBuffer &&
    seedBuffer &&
    mainVertexArray &&
    fullscreenVertexArray &&
    displacementA &&
    displacementB &&
    densityTarget &&
    (tier.emit === 0 || (directionBuffer && emitterVertexArray));

  if (!hasRequiredResources) {
    if (uvBuffer) gl.deleteBuffer(uvBuffer);
    if (seedBuffer) gl.deleteBuffer(seedBuffer);
    if (directionBuffer) gl.deleteBuffer(directionBuffer);
    if (mainVertexArray) gl.deleteVertexArray(mainVertexArray);
    if (emitterVertexArray) gl.deleteVertexArray(emitterVertexArray);
    if (fullscreenVertexArray) gl.deleteVertexArray(fullscreenVertexArray);
    if (displacementA) deleteRenderTarget(gl, displacementA);
    if (displacementB) deleteRenderTarget(gl, displacementB);
    if (densityTarget) deleteRenderTarget(gl, densityTarget);
    Object.values(programs).forEach((program) => gl.deleteProgram(program));
    return null;
  }

  bindParticleAttributes(gl, mainVertexArray, uvBuffer, seedBuffer);
  if (emitterVertexArray && directionBuffer) {
    bindParticleAttributes(gl, emitterVertexArray, uvBuffer, seedBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, directionBuffer);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
  }

  clearRenderTarget(gl, displacementA);
  clearRenderTarget(gl, displacementB);
  clearRenderTarget(gl, densityTarget);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  const densityUniforms = getSurfaceUniforms(gl, programs.density);
  const mainUniforms = {
    ...getSurfaceUniforms(gl, programs.main),
    densityTexture: gl.getUniformLocation(programs.main, 'uDensityTexture'),
  };
  const emitterUniforms = {
    aspect: gl.getUniformLocation(programs.emitter, 'uAspect'),
    dpr: gl.getUniformLocation(programs.emitter, 'uDpr'),
    fromSurface: gl.getUniformLocation(programs.emitter, 'uFromSurface'),
    morph: gl.getUniformLocation(programs.emitter, 'uMorph'),
    pointer: gl.getUniformLocation(programs.emitter, 'uPointer'),
    pointerEnergy: gl.getUniformLocation(programs.emitter, 'uPointerEnergy'),
    time: gl.getUniformLocation(programs.emitter, 'uTime'),
    toSurface: gl.getUniformLocation(programs.emitter, 'uToSurface'),
  };
  const displacementUniforms = {
    aspect: gl.getUniformLocation(programs.displacement, 'uAspect'),
    damping: gl.getUniformLocation(programs.displacement, 'uDamping'),
    pointerCount: gl.getUniformLocation(programs.displacement, 'uPointerCount'),
    pointerTrail: gl.getUniformLocation(programs.displacement, 'uPointerTrail'),
    previousField: gl.getUniformLocation(programs.displacement, 'uPreviousField'),
  };

  const pointerSamples: PointerSample[] = [];
  const pointerTrail = new Float32Array(POINTER_TRAIL_SIZE * 4);
  let lastPointer: HeroParticlePointer | null = null;
  let latestPointer = { x: 0, y: 0 };
  let pointerEnergy = 0;
  let pointerEnergyTarget = 0;
  let animationFrameId = 0;
  let elapsed = 0;
  let lastFrameAt: number | null = null;
  let running = false;
  let destroyed = false;
  let pixelRatio = 1;
  let displacementRead = displacementA;
  let displacementWrite = displacementB;
  let currentSurface = -1;

  const setSurfaceUniforms = (
    uniforms: SurfaceUniforms,
    fromSurface: number,
    toSurface: number,
    morph: number,
  ) => {
    gl.uniform1f(uniforms.aspect, canvas.width / Math.max(canvas.height, 1));
    gl.uniform1f(uniforms.dpr, pixelRatio);
    gl.uniform1i(uniforms.fromSurface, fromSurface);
    gl.uniform1i(uniforms.toSurface, toSurface);
    gl.uniform1f(uniforms.morph, morph);
    gl.uniform1f(uniforms.time, elapsed / 1_000);
    gl.uniform1i(uniforms.displacementTexture, 0);
  };

  const resize = () => {
    if (destroyed) return;
    const canvasBounds = canvas.getBoundingClientRect();
    pixelRatio = Math.min(window.devicePixelRatio || 1, tier.dpr);
    const width = Math.max(1, Math.round(canvasBounds.width * pixelRatio));
    const height = Math.max(1, Math.round(canvasBounds.height * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  const updatePointerTrail = (now: number) => {
    pointerEnergy += (pointerEnergyTarget - pointerEnergy) * 0.12;
    pointerTrail.fill(0);
    let activeCount = 0;

    for (const sample of pointerSamples) {
      const age = Math.max(0, now - sample.at);
      const freshness = Math.exp(-age / 230);
      if (freshness < 0.025 || activeCount >= POINTER_TRAIL_SIZE) continue;
      const offset = activeCount * 4;
      pointerTrail[offset] = sample.x;
      pointerTrail[offset + 1] = sample.y;
      pointerTrail[offset + 2] = clamp(0.2 + sample.velocity * 220, 0.2, 1);
      pointerTrail[offset + 3] = freshness;
      activeCount += 1;
    }

    while (pointerSamples.length > 0 && now - (pointerSamples.at(-1)?.at ?? now) > 1_000) {
      pointerSamples.pop();
    }
    canvas.dataset.pointerSamples = String(activeCount);
    return activeCount;
  };

  const renderDisplacement = (pointerCount: number) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, displacementWrite.framebuffer);
    gl.viewport(0, 0, FIELD_SIZE, FIELD_SIZE);
    gl.disable(gl.BLEND);
    gl.useProgram(programs.displacement);
    gl.bindVertexArray(fullscreenVertexArray);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, displacementRead.texture);
    gl.uniform1i(displacementUniforms.previousField, 0);
    gl.uniform1f(displacementUniforms.aspect, canvas.width / Math.max(canvas.height, 1));
    gl.uniform1f(displacementUniforms.damping, 0.96);
    gl.uniform1i(displacementUniforms.pointerCount, pointerCount);
    gl.uniform4fv(displacementUniforms.pointerTrail, pointerTrail);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    [displacementRead, displacementWrite] = [displacementWrite, displacementRead];
  };

  const renderDensity = (fromSurface: number, toSurface: number, morph: number) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, densityTarget.framebuffer);
    gl.viewport(0, 0, FIELD_SIZE, FIELD_SIZE);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(programs.density);
    gl.bindVertexArray(mainVertexArray);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, displacementRead.texture);
    setSurfaceUniforms(densityUniforms, fromSurface, toSurface, morph);
    gl.drawArrays(gl.POINTS, 0, tier.main);
  };

  const renderMain = (fromSurface: number, toSurface: number, morph: number) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(programs.main);
    gl.bindVertexArray(mainVertexArray);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, displacementRead.texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, densityTarget.texture);
    setSurfaceUniforms(mainUniforms, fromSurface, toSurface, morph);
    gl.uniform1i(mainUniforms.densityTexture, 1);
    gl.drawArrays(gl.POINTS, 0, tier.main);
  };

  const renderEmitter = (fromSurface: number, toSurface: number, morph: number) => {
    if (!emitterVertexArray || tier.emit === 0) return;
    gl.useProgram(programs.emitter);
    gl.bindVertexArray(emitterVertexArray);
    gl.uniform1f(emitterUniforms.aspect, canvas.width / Math.max(canvas.height, 1));
    gl.uniform1f(emitterUniforms.dpr, pixelRatio);
    gl.uniform1i(emitterUniforms.fromSurface, fromSurface);
    gl.uniform1i(emitterUniforms.toSurface, toSurface);
    gl.uniform1f(emitterUniforms.morph, morph);
    gl.uniform1f(emitterUniforms.time, elapsed / 1_000);
    gl.uniform1f(emitterUniforms.pointerEnergy, pointerEnergy);
    gl.uniform2f(emitterUniforms.pointer, latestPointer.x, latestPointer.y);
    gl.drawArrays(gl.POINTS, 0, tier.emit);
  };

  const render = (now: number) => {
    if (!running || destroyed) return;
    const previousFrameAt = lastFrameAt ?? now;
    elapsed += Math.min(now - previousFrameAt, 40);
    lastFrameAt = now;

    const cycleIndex = Math.floor(elapsed / SURFACE_CYCLE_MS);
    const fromSurface = cycleIndex % SURFACE_COUNT;
    const toSurface = (fromSurface + 1) % SURFACE_COUNT;
    const cycleElapsed = elapsed % SURFACE_CYCLE_MS;
    const morph = smoothStep((cycleElapsed - SURFACE_HOLD_MS) / SURFACE_MORPH_MS);

    if (fromSurface !== currentSurface) {
      currentSurface = fromSurface;
      canvas.dataset.particleSurface = `${fromSurface}-${toSurface}`;
    }

    const pointerCount = updatePointerTrail(now);
    renderDisplacement(pointerCount);
    renderDensity(fromSurface, toSurface, morph);
    renderMain(fromSurface, toSurface, morph);
    renderEmitter(fromSurface, toSurface, morph);
    animationFrameId = window.requestAnimationFrame(render);
  };

  canvas.dataset.particleCount = String(tier.main);
  canvas.dataset.particleDensity = 'active';
  canvas.dataset.particleDepth = 'far-middle-near';
  canvas.dataset.particleContact = `trail-${POINTER_TRAIL_SIZE}`;
  canvas.dataset.particleDisplacement = 'none';
  canvas.dataset.particleEmitter = tier.emit > 0 ? 'active' : 'disabled';
  canvas.dataset.particleInitialShape = 'woven-canopy';
  canvas.dataset.particleSurface = '0-1';
  canvas.dataset.pointerImpulse = String(HERO_POINTER_RESPONSE.radialImpulse);
  canvas.dataset.pointerLift = String(HERO_POINTER_RESPONSE.surfaceLift);
  canvas.dataset.pointerResponse = 'surface-contact';
  canvas.dataset.pointerSamples = '0';
  resize();

  return {
    clearPointer() {
      pointerEnergyTarget = 0;
      lastPointer = null;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      running = false;
      window.cancelAnimationFrame(animationFrameId);
      gl.deleteBuffer(uvBuffer);
      gl.deleteBuffer(seedBuffer);
      if (directionBuffer) gl.deleteBuffer(directionBuffer);
      gl.deleteVertexArray(mainVertexArray);
      if (emitterVertexArray) gl.deleteVertexArray(emitterVertexArray);
      gl.deleteVertexArray(fullscreenVertexArray);
      deleteRenderTarget(gl, displacementA);
      deleteRenderTarget(gl, displacementB);
      deleteRenderTarget(gl, densityTarget);
      Object.values(programs).forEach((program) => gl.deleteProgram(program));
    },
    resize,
    setPointer(position) {
      const elapsedSincePointer = Math.max(position.at - (lastPointer?.at ?? position.at - 16), 8);
      const distance = lastPointer
        ? Math.hypot(position.x - lastPointer.x, position.y - lastPointer.y)
        : 0.02;
      pointerSamples.unshift({ ...position, velocity: distance / elapsedSincePointer });
      pointerSamples.length = Math.min(pointerSamples.length, POINTER_TRAIL_SIZE);
      latestPointer = { x: position.x, y: position.y };
      lastPointer = position;
      pointerEnergyTarget = 1;
      canvas.dataset.pointerSamples = String(pointerSamples.length);
    },
    start() {
      if (running || destroyed) return;
      running = true;
      lastFrameAt = null;
      canvas.dataset.particleRendering = 'running';
      animationFrameId = window.requestAnimationFrame(render);
    },
    stop() {
      if (!running) return;
      running = false;
      lastFrameAt = null;
      canvas.dataset.particleRendering = 'stopped';
      window.cancelAnimationFrame(animationFrameId);
    },
  };
}
