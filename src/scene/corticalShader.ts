import * as THREE from 'three';

export interface CorticalShaderUniforms {
  uTime: { value: number };
  uPulse: { value: number };
  uSignalBoost: { value: number };
  uAccentBias: { value: number }; // 0 = balanced, -1 = vermilion/human, +1 = phosphor/machine
}

/**
 * Museum-grade real-time PBR cortical surface material driven by real baked
 * FreeSurfer fsaverage6 vertex attributes (COLOR_0):
 *   R = sulcal depth (0 deep sulcal valley -> 1 outer gyral crown)
 *   G = gyral curvature (0 concave crease -> 1 convex gyral crest)
 *   B = Prefrontal / Frontoparietal Control Network & ACC weight
 */
export function createCorticalSurfaceMaterial(
  sharedUniforms: CorticalShaderUniforms,
  isCerebellum = false
): THREE.MeshPhysicalMaterial {
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffffff'),
    vertexColors: true,
    metalness: isCerebellum ? 0.28 : 0.34,
    roughness: 0.48,
    clearcoat: isCerebellum ? 0.18 : 0.28,
    clearcoatRoughness: 0.3,
    reflectivity: 0.72,
    envMapIntensity: 0.85,
  });

  mat.customProgramCacheKey = () => (isCerebellum ? 'cortical-cereb-v1' : 'cortical-pial-v1');

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = sharedUniforms.uTime;
    shader.uniforms.uPulse = sharedUniforms.uPulse;
    shader.uniforms.uSignalBoost = sharedUniforms.uSignalBoost;
    shader.uniforms.uAccentBias = sharedUniforms.uAccentBias;
    shader.uniforms.uIsCerebellum = { value: isCerebellum ? 1.0 : 0.0 };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        varying vec3 vBrainLocalPos;
        varying vec3 vBrainNormalView;
        `
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `
        #include <begin_vertex>
        vBrainLocalPos = position;
        vBrainNormalView = normalize(normalMatrix * normal);
        `
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        uniform float uTime;
        uniform float uPulse;
        uniform float uSignalBoost;
        uniform float uAccentBias;
        uniform float uIsCerebellum;
        varying vec3 vBrainLocalPos;
        varying vec3 vBrainNormalView;
        `
      )
      // Replace default vertex-color multiplication with sculpted anatomical sulcal chiaroscuro
      .replace(
        '#include <color_fragment>',
        /* glsl */ `
        #if defined( USE_COLOR_ALPHA ) || defined( USE_COLOR )
          float sulcDepth = clamp(vColor.r, 0.0, 1.0);
          float curvCrown = clamp(vColor.g, 0.0, 1.0);
          float fpnWeight = clamp(vColor.b, 0.0, 1.0);
          float topo = clamp(sulcDepth * 0.74 + curvCrown * 0.26, 0.0, 1.0);

          // Dramatic museum-carved sulcal-to-gyral tonal curve (linear light space!)
          // Deep sulci drop to ink-black obsidian; gyral crowns gleam in satin dark titanium-slate
          vec3 colSulcus = vec3(0.0018, 0.0022, 0.0038);
          vec3 colWall   = vec3(0.020, 0.025, 0.036);
          vec3 colCrown  = mix(vec3(0.095, 0.106, 0.132), vec3(0.075, 0.082, 0.102), uIsCerebellum);
          vec3 colCrest  = mix(vec3(0.175, 0.188, 0.220), vec3(0.125, 0.134, 0.158), uIsCerebellum);

          vec3 baseBrain = mix(colSulcus, colWall, smoothstep(0.08, 0.44, topo));
          baseBrain = mix(baseBrain, colCrown, smoothstep(0.42, 0.78, topo));
          baseBrain = mix(baseBrain, colCrest, smoothstep(0.76, 0.98, topo));

          // Subtle warm champagne inflection on frontoparietal gyral ridges
          baseBrain = mix(baseBrain, baseBrain * vec3(1.16, 1.04, 0.94), fpnWeight * 0.35);

          diffuseColor.rgb = baseBrain;
        #endif
        `
      )
      // Carve velvety matte roughness inside deep sulci and smooth satin on gyral crowns
      .replace(
        '#include <roughnessmap_fragment>',
        /* glsl */ `
        #include <roughnessmap_fragment>
        #if defined( USE_COLOR_ALPHA ) || defined( USE_COLOR )
          float rTopo = clamp(vColor.r * 0.74 + vColor.g * 0.26, 0.0, 1.0);
          roughnessFactor = mix(0.88, 0.34, smoothstep(0.14, 0.88, rTopo));
        #endif
        `
      )
      // Add anatomical Fresnel rim sculpting + Frontoparietal & traveling sulcal wave luminescence
      .replace(
        '#include <emissivemap_fragment>',
        /* glsl */ `
        #include <emissivemap_fragment>
        #if defined( USE_COLOR_ALPHA ) || defined( USE_COLOR )
          float eSulc = clamp(vColor.r, 0.0, 1.0);
          float eCurv = clamp(vColor.g, 0.0, 1.0);
          float eFpn  = clamp(vColor.b, 0.0, 1.0);
          float eTopo = clamp(eSulc * 0.74 + eCurv * 0.26, 0.0, 1.0);

          vec3 V = normalize(vViewPosition);
          vec3 N = normalize(vBrainNormalView);
          float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.75);

          // Dual-tone architectural rim light tracing gyral crowns cleanly against dark obsidian
          float rimSide = smoothstep(-0.6, 0.6, N.x);
          vec3 rimGold = vec3(0.76, 0.60, 0.36);
          vec3 rimTeal = vec3(0.20, 0.82, 0.66);
          vec3 rimCol = mix(rimTeal, rimGold, rimSide);
          vec3 rimEmit = rimCol * fresnel * smoothstep(0.22, 0.85, eTopo) * (0.34 + uSignalBoost * 0.22);

          // Sulcal margin mask (lights travel cleanly inside anatomical sulcal creases)
          float sulcalValley = smoothstep(0.62, 0.14, eSulc) * smoothstep(0.0, 0.16, eSulc);

          // Physiological alpha/theta slow cortical breathing along Frontoparietal Control Network
          float breath = 0.55 + 0.45 * sin(uTime * 1.15 - vBrainLocalPos.z * 2.2);
          vec3 colHuman = vec3(1.0, 0.26, 0.14);
          vec3 colMachine = vec3(0.18, 0.92, 0.74);

          // Anterior PFC leans warm vermilion; posterior parietal leans optical phosphor teal
          float apMix = smoothstep(-0.4, 0.75, vBrainLocalPos.z);
          vec3 fpnCol = mix(colMachine, colHuman, clamp(apMix - uAccentBias * 0.35, 0.0, 1.0));

          float fpnGlow = eFpn * (0.22 + 0.78 * sulcalValley) * breath * (0.38 + uSignalBoost * 1.15) * (1.0 - uIsCerebellum);

          // Traveling cortical excitation pulse sweeping Posterior (-Z) -> Anterior (+Z) on trigger
          float waveFront = -1.6 + (1.0 - uPulse) * 3.4;
          float waveBand = exp(-pow((vBrainLocalPos.z - waveFront) * 2.6, 2.0)) * uPulse;
          vec3 pulseCol = mix(colMachine, colHuman, smoothstep(-0.5, 0.8, vBrainLocalPos.z));
          float pulseGlow = waveBand * (0.45 + 1.35 * sulcalValley) * 1.65;

          // Subtle sulcal connectivity filaments in Signal look-dev mode
          float signalNet = sulcalValley * (0.5 + 0.5 * sin(vBrainLocalPos.x * 6.0 + vBrainLocalPos.z * 5.0 - uTime * 2.4)) * uSignalBoost * 0.55;

          totalEmissiveRadiance += rimEmit + fpnCol * fpnGlow + pulseCol * (pulseGlow + signalNet);
        #endif
        `
      );
  };

  return mat;
}
