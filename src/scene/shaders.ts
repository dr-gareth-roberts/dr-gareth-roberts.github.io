import * as THREE from 'three';

/**
 * Full-viewport atmospheric gallery backdrop with subtle optical depth,
 * scroll-reactive accent luminance, and micro-dithering to eliminate 8-bit banding.
 */
export function createBackdropMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uAccentA: { value: new THREE.Color('#ff5238') },
      uAccentB: { value: new THREE.Color('#4ef2c4') },
      uScroll: { value: 0 },
      uPulse: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.9999, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uAccentA;
      uniform vec3 uAccentB;
      uniform float uScroll;
      uniform float uPulse;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec2 uv = vUv;
        float aspect = uResolution.x / max(uResolution.y, 1.0);
        vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

        // Pristine neutral architectural obsidian gallery backdrop (true linear light space)
        // Zero neon fog blobs — clean studio falloff that lets real 3D surfaces command focus
        vec3 base = vec3(0.0028, 0.0030, 0.0036);
        vec3 deep = vec3(0.0011, 0.0012, 0.0016);
        float vig = smoothstep(1.30, 0.14, length(p));
        vec3 col = mix(deep, base, vig);

        // Subtle neutral overhead museum gallery key falloff
        float topGlow = exp(-pow(p.x * 0.9, 2.0) - pow((p.y - 0.56) * 2.1, 2.0));
        col += vec3(0.0042, 0.0041, 0.0040) * topGlow;

        // Ultra-subtle studio bounce behind right-side 3D model (calibrated in linear space)
        vec2 stagePos = vec2(0.38, 0.02 - uScroll * 0.12);
        float stageGlow = exp(-dot(p - stagePos, p - stagePos) * 3.0);
        col += vec3(0.0045, 0.0047, 0.0052) * stageGlow;
        col += uAccentA * stageGlow * (uPulse * 0.012);

        // Fine filmic dither to eliminate 8-bit dark-mode banding
        float dither = (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
        col += vec3(dither);

        gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
      }
    `,
  });
}

/**
 * 3D Volumetric Synaptic Particle Field orbiting the hero sculpture.
 * Honors the original "Attention Field" metaphor in true perspective 3D space.
 */
export function createNeuralParticleField(count = 420): {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
} {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const scales = new Float32Array(count);
  const colorMix = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Distribute in a layered spherical shell outside the sculpture
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const radius = 2.6 + Math.pow(Math.random(), 0.7) * 5.8;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta) * 1.25;
    positions[i * 3 + 1] = radius * Math.cos(phi) * 0.92;
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 0.4;

    phases[i] = Math.random() * Math.PI * 2;
    scales[i] = 0.6 + Math.random() * 1.9;
    colorMix[i] = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geo.setAttribute('aColorMix', new THREE.BufferAttribute(colorMix, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uPulse: { value: 0 },
      uColorHuman: { value: new THREE.Color('#ff5238') },
      uColorMachine: { value: new THREE.Color('#4ef2c4') },
      uColorGold: { value: new THREE.Color('#d9b882') },
      uOpacity: { value: 0.78 },
    },
    vertexShader: /* glsl */ `
      attribute float aPhase;
      attribute float aScale;
      attribute float aColorMix;

      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uPulse;

      varying float vAlpha;
      varying float vMix;
      varying float vFire;

      void main() {
        vec3 pos = position;

        // Gentle orbital drift
        float t = uTime * 0.22 + aPhase;
        pos.x += sin(t * 0.8 + pos.y * 0.4) * 0.14;
        pos.y += cos(t * 0.65 + pos.x * 0.35) * 0.12;
        pos.z += sin(t * 0.55 + pos.z * 0.3) * 0.12;

        // Radial synaptic pulse wave expanding outward from origin
        float dist = length(pos);
        float wave = exp(-pow(dist - (1.4 + uPulse * 5.5), 2.0) * 1.4) * uPulse;
        pos += normalize(pos) * wave * 0.22;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        float size = (16.0 * aScale + wave * 18.0) * uPixelRatio / max(-mvPosition.z, 1.5);
        gl_PointSize = clamp(size, 1.5, 18.0);

        float twinkle = 0.45 + 0.55 * sin(uTime * 1.35 + aPhase * 3.0);
        vAlpha = smoothstep(11.0, 2.2, -mvPosition.z) * (0.28 + twinkle * 0.52 + wave * 0.65);
        vMix = aColorMix;
        vFire = wave;

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;

      uniform vec3 uColorHuman;
      uniform vec3 uColorMachine;
      uniform vec3 uColorGold;
      uniform float uOpacity;

      varying float vAlpha;
      varying float vMix;
      varying float vFire;

      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;

        // Crisp core + soft optical bokeh halo
        float core = smoothstep(0.18, 0.0, d);
        float halo = pow(smoothstep(0.5, 0.0, d), 2.4) * 0.55;
        float intensity = core + halo;

        vec3 baseCol = vMix < 0.45
          ? mix(uColorMachine, uColorGold, vMix / 0.45)
          : mix(uColorGold, uColorHuman, (vMix - 0.45) / 0.55);

        vec3 finalCol = mix(baseCol, vec3(1.0, 0.96, 0.90), core * 0.5 + vFire * 0.35);
        gl_FragColor = vec4(finalCol, intensity * vAlpha * uOpacity);
      }
    `,
  });

  const points = new THREE.Points(geo, material);
  return { points, material };
}

/**
 * Architectural fine-line Fresnel energy shell used on pulse triggers & studio pedestal.
 */
export function createPedestalGrid(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(14, 14, 1, 1);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.0 },
      uAccent: { value: new THREE.Color('#4ef2c4') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uAccent;

      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p);
        if (r > 1.0) discard;

        // Polar stereotactic measurement rings + radial crosshairs
        float rings = smoothstep(0.018, 0.0, abs(fract(r * 5.0) - 0.5) / 5.0);
        float angle = atan(p.y, p.x);
        float spokes = smoothstep(0.012, 0.0, abs(sin(angle * 6.0)) * r);
        float scan = smoothstep(0.04, 0.0, abs(r - fract(uTime * 0.18)));

        float alpha = (rings * 0.24 + spokes * 0.14 + scan * 0.35) * smoothstep(1.0, 0.15, r);
        vec3 col = mix(vec3(0.84, 0.72, 0.51), uAccent, scan * 0.8 + 0.2);

        gl_FragColor = vec4(col, alpha * uOpacity);
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -2.45;
  return mesh;
}
