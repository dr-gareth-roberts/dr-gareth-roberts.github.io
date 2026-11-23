import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SPECIMENS, type SpecimenMeta } from '../data/cvData';
import { createBackdropMaterial, createNeuralParticleField, createPedestalGrid } from './shaders';
import { createCorticalSurfaceMaterial, type CorticalShaderUniforms } from './corticalShader';

export type SpecimenId = SpecimenMeta['id'];
export type StudioLightingMode = 'museum' | 'signal' | 'wireframe';

interface StagePose {
  camPos: THREE.Vector3;
  lookAt: THREE.Vector3;
  rigPos: THREE.Vector3;
  rigRot: THREE.Euler;
  rigScale: number;
  splitHemispheres: number;
  particleOpacity: number;
  accentA: THREE.Color;
  accentB: THREE.Color;
  keyIntensity: number;
  rimTealIntensity: number;
  rimCoralIntensity: number;
}

const SECTION_POSES: Record<string, StagePose> = {
  hero: {
    camPos: new THREE.Vector3(0.0, 0.22, 7.6),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    rigPos: new THREE.Vector3(1.94, 0.06, -0.15),
    rigRot: new THREE.Euler(0.14, -1.02, 0.04),
    rigScale: 0.86,
    splitHemispheres: 0.0,
    particleOpacity: 0.55,
    accentA: new THREE.Color('#d9442b'),
    accentB: new THREE.Color('#38c9a8'),
    keyIntensity: 2.05,
    rimTealIntensity: 2.4,
    rimCoralIntensity: 2.0,
  },
  thesis: {
    camPos: new THREE.Vector3(-0.15, 0.28, 5.8),
    lookAt: new THREE.Vector3(-0.15, 0.0, 0.0),
    rigPos: new THREE.Vector3(-1.68, 0.02, 0.28),
    rigRot: new THREE.Euler(0.28, 0.34, -0.04),
    rigScale: 1.08,
    splitHemispheres: 0.36,
    particleOpacity: 0.58,
    accentA: new THREE.Color('#ff5238'),
    accentB: new THREE.Color('#d9b882'),
    keyIntensity: 2.4,
    rimTealIntensity: 2.3,
    rimCoralIntensity: 3.0,
  },
  specimens: {
    camPos: new THREE.Vector3(0.0, 0.45, 6.2),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    rigPos: new THREE.Vector3(1.42, 0.05, 0.2),
    rigRot: new THREE.Euler(0.28, -0.35, 0.04),
    rigScale: 1.04,
    splitHemispheres: 0.06,
    particleOpacity: 0.72,
    accentA: new THREE.Color('#d9b882'),
    accentB: new THREE.Color('#4ef2c4'),
    keyIntensity: 2.7,
    rimTealIntensity: 3.0,
    rimCoralIntensity: 2.2,
  },
  career: {
    camPos: new THREE.Vector3(0.1, 0.15, 7.6),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    rigPos: new THREE.Vector3(2.45, -0.1, -1.1),
    rigRot: new THREE.Euler(0.12, -0.95, 0.14),
    rigScale: 0.9,
    splitHemispheres: 0.0,
    particleOpacity: 0.42,
    accentA: new THREE.Color('#d9b882'),
    accentB: new THREE.Color('#4ef2c4'),
    keyIntensity: 1.85,
    rimTealIntensity: 2.2,
    rimCoralIntensity: 1.8,
  },
  research: {
    camPos: new THREE.Vector3(0.0, 0.22, 7.2),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    rigPos: new THREE.Vector3(-2.3, 0.08, -0.9),
    rigRot: new THREE.Euler(0.38, 0.85, -0.12),
    rigScale: 0.92,
    splitHemispheres: 0.12,
    particleOpacity: 0.52,
    accentA: new THREE.Color('#ff5238'),
    accentB: new THREE.Color('#4ef2c4'),
    keyIntensity: 2.0,
    rimTealIntensity: 2.6,
    rimCoralIntensity: 2.4,
  },
  publications: {
    camPos: new THREE.Vector3(0.0, 0.1, 8.6),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    rigPos: new THREE.Vector3(2.85, 0.2, -2.2),
    rigRot: new THREE.Euler(0.24, -1.3, 0.05),
    rigScale: 0.82,
    splitHemispheres: 0.0,
    particleOpacity: 0.28,
    accentA: new THREE.Color('#d9b882'),
    accentB: new THREE.Color('#4ef2c4'),
    keyIntensity: 1.4,
    rimTealIntensity: 1.6,
    rimCoralIntensity: 1.3,
  },
  teaching: {
    camPos: new THREE.Vector3(0.0, 0.15, 8.4),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    rigPos: new THREE.Vector3(-2.75, -0.1, -2.0),
    rigRot: new THREE.Euler(-0.14, 1.15, 0.08),
    rigScale: 0.84,
    splitHemispheres: 0.0,
    particleOpacity: 0.3,
    accentA: new THREE.Color('#d9b882'),
    accentB: new THREE.Color('#4ef2c4'),
    keyIntensity: 1.5,
    rimTealIntensity: 1.8,
    rimCoralIntensity: 1.4,
  },
  education: {
    camPos: new THREE.Vector3(0.0, 0.2, 8.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    rigPos: new THREE.Vector3(2.45, 0.05, -1.7),
    rigRot: new THREE.Euler(0.18, -0.75, -0.06),
    rigScale: 0.86,
    splitHemispheres: 0.0,
    particleOpacity: 0.35,
    accentA: new THREE.Color('#ff5238'),
    accentB: new THREE.Color('#d9b882'),
    keyIntensity: 1.7,
    rimTealIntensity: 1.8,
    rimCoralIntensity: 1.9,
  },
  contact: {
    camPos: new THREE.Vector3(0.0, 0.22, 6.4),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    rigPos: new THREE.Vector3(0.0, 0.1, -0.45),
    rigRot: new THREE.Euler(0.14, 0.25, 0.0),
    rigScale: 1.08,
    splitHemispheres: 0.08,
    particleOpacity: 0.82,
    accentA: new THREE.Color('#ff5238'),
    accentB: new THREE.Color('#4ef2c4'),
    keyIntensity: 2.3,
    rimTealIntensity: 2.9,
    rimCoralIntensity: 2.7,
  },
};

export interface SceneCallbacks {
  onProgress?: (pct: number) => void;
  onReady?: () => void;
  onFallback?: () => void;
}

export class SceneController {
  private canvas: HTMLCanvasElement;
  private renderer!: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  private bloomPass!: UnrealBloomPass;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  private backdropScene!: THREE.Scene;
  private backdropCam!: THREE.OrthographicCamera;
  private backdropMat!: THREE.ShaderMaterial;

  private neuralField!: { points: THREE.Points; material: THREE.ShaderMaterial };
  private pedestal!: THREE.Mesh;

  private specimenStage!: THREE.Group;
  private specimens = new Map<SpecimenId, THREE.Group>();
  private loadingSpecimens = new Set<SpecimenId>();
  private activeSpecimenId: SpecimenId = 'cortical';

  // Animated sub-parts cached per specimen
  private corticalParts: {
    left?: THREE.Object3D;
    right?: THREE.Object3D;
    core?: THREE.Object3D;
    lattice?: THREE.Object3D;
    gOuter?: THREE.Object3D;
    gMid?: THREE.Object3D;
    gInner?: THREE.Object3D;
    tokens?: THREE.Object3D;
  } = {};

  private keyLight!: THREE.DirectionalLight;
  private rimTealLight!: THREE.PointLight;
  private rimCoralLight!: THREE.PointLight;
  private fillLight!: THREE.HemisphereLight;
  private microTexture: THREE.Texture | null = null;
  private corticalUniforms: CorticalShaderUniforms = {
    uTime: { value: 0 },
    uPulse: { value: 0 },
    uSignalBoost: { value: 0 },
    uAccentBias: { value: 0 },
  };
  private targetAccentBias = 0;

  private gltfLoader = new GLTFLoader();
  private rgbeLoader = new RGBELoader();
  private texLoader = new THREE.TextureLoader();

  private clock = new THREE.Clock();
  private rafId = 0;
  private isHidden = false;
  private reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private isMobile = window.innerWidth < 900;

  private currentSection = 'hero';
  private scrollNormalized = 0;
  private inspectMode = false;
  private lightingMode: StudioLightingMode = 'museum';
  private pulseValue = 0;
  private specimenSwapAnim = 1;

  // Smooth interpolated state
  private pointer = new THREE.Vector2(0, 0);
  private pointerSmooth = new THREE.Vector2(0, 0);
  private curCamPos = new THREE.Vector3(0, 0.32, 6.9);
  private curLookAt = new THREE.Vector3(0, 0, 0);
  private curRigPos = new THREE.Vector3(1.68, 0.02, 0);
  private curRigScale = 1.0;
  private curSplit = 0.0;
  private curPedestalOpacity = 0.0;
  private curRotX = 0.18;
  private curRotY = -0.45;
  private curRotZ = 0.08;

  private callbacks: SceneCallbacks;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, callbacks: SceneCallbacks = {}) {
    this.canvas = canvas;
    this.callbacks = callbacks;
  }

  public async init(): Promise<boolean> {
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      this.callbacks.onFallback?.();
      return false;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.5 : 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.94;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.autoClear = false;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      this.isMobile ? 46 : 38,
      window.innerWidth / Math.max(window.innerHeight, 1),
      0.1,
      60
    );
    this.camera.position.copy(this.curCamPos);

    // OrbitControls — enabled exclusively in Interactive Studio Inspect Mode
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.minDistance = 3.2;
    this.controls.maxDistance = 10.5;
    this.controls.enabled = false;

    // Backdrop atmospheric shader scene
    this.backdropScene = new THREE.Scene();
    this.backdropCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.backdropMat = createBackdropMaterial();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.backdropMat);
    quad.frustumCulled = false;
    this.backdropScene.add(quad);

    // Post-processing composer (Backdrop + 3D Scene + Crisp Selective Bloom + ACES Output)
    this.composer = new EffectComposer(this.renderer);
    const backdropPass = new RenderPass(this.backdropScene, this.backdropCam);
    backdropPass.clear = true;
    this.composer.addPass(backdropPass);

    const mainPass = new RenderPass(this.scene, this.camera);
    mainPass.clear = false;
    mainPass.clearDepth = true;
    this.composer.addPass(mainPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.isMobile ? 0.22 : 0.34,
      0.46,
      1.18
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());

    // Sculptural Museum Studio Lighting Rig
    this.setupLights();

    // Particle field & inspection pedestal
    this.neuralField = createNeuralParticleField(this.isMobile ? 220 : 420);
    this.scene.add(this.neuralField.points);

    this.pedestal = createPedestalGrid();
    this.scene.add(this.pedestal);

    this.specimenStage = new THREE.Group();
    this.scene.add(this.specimenStage);

    // Listeners
    window.addEventListener('resize', this.handleResize, { passive: true });
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibility);

    // Load HDRI + Micrograin + Hero Blender Model concurrently
    this.callbacks.onProgress?.(12);
    await Promise.all([
      this.loadEnvironment(),
      this.loadMicroTexture(),
      this.loadSpecimen('cortical', (p) => {
        this.callbacks.onProgress?.(Math.min(96, Math.round(18 + p * 78)));
      }),
    ]);

    this.activateSpecimen('cortical', true);
    this.callbacks.onProgress?.(100);
    this.callbacks.onReady?.();

    // Start render loop
    this.clock.start();
    this.animate();

    // Preload the remaining 3 Blender sculptures smoothly in the background
    setTimeout(() => {
      if (!this.disposed) {
        void this.loadSpecimen('eval');
        void this.loadSpecimen('geospatial');
        void this.loadSpecimen('eeg');
      }
    }, 900);

    return true;
  }

  private setupLights(): void {
    this.fillLight = new THREE.HemisphereLight('#e9e0cf', '#06080f', 0.26);
    this.scene.add(this.fillLight);

    this.keyLight = new THREE.DirectionalLight('#fff0da', 1.45);
    this.keyLight.position.set(4.8, 6.4, 5.2);
    this.scene.add(this.keyLight);

    this.rimTealLight = new THREE.PointLight('#4ef2c4', 2.4, 18, 1.6);
    this.rimTealLight.position.set(-4.8, 2.6, 2.2);
    this.scene.add(this.rimTealLight);

    this.rimCoralLight = new THREE.PointLight('#ff5238', 2.1, 18, 1.6);
    this.rimCoralLight.position.set(4.6, -2.2, 2.5);
    this.scene.add(this.rimCoralLight);
  }

  private async loadEnvironment(): Promise<void> {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileEquirectangularShader();

    try {
      const hdr = await this.rgbeLoader.loadAsync('./assets/env/studio-museum.hdr');
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      const envRT = pmrem.fromEquirectangular(hdr);
      this.scene.environment = envRT.texture;
      this.scene.environmentIntensity = 0.62;
      hdr.dispose();
      pmrem.dispose();
    } catch {
      // Fallback to Three.js procedural RoomEnvironment if HDR fails
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      this.scene.environment = envRT.texture;
      this.scene.environmentIntensity = 0.55;
      pmrem.dispose();
    }
  }

  private async loadMicroTexture(): Promise<void> {
    try {
      const tex = await this.texLoader.loadAsync('./assets/images/surface-micrograin.jpg');
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 4);
      tex.colorSpace = THREE.NoColorSpace;
      this.microTexture = tex;
    } catch {
      this.microTexture = null;
    }
  }

  private upgradeMaterials(group: THREE.Object3D): void {
    group.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const oldMat = child.material as THREE.MeshStandardMaterial;
      if (!oldMat || !oldMat.name) return;

      const matName = oldMat.name;
      const baseColor = oldMat.color ? oldMat.color.clone() : new THREE.Color('#141720');

      if (matName.includes('RealCortex')) {
        child.material = createCorticalSurfaceMaterial(this.corticalUniforms, false);
      } else if (matName.includes('RealCerebellum')) {
        child.material = createCorticalSurfaceMaterial(this.corticalUniforms, true);
      } else if (matName.includes('RealBrainstem')) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#1d222e'),
          roughness: 0.44,
          metalness: 0.36,
          clearcoat: 0.28,
          clearcoatRoughness: 0.28,
          envMapIntensity: 0.95,
        });
      } else if (matName.includes('SubcorticalGlass') || matName.includes('SmokedGlass')) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#c2dce2'),
          roughness: 0.07,
          metalness: 0.05,
          transmission: 0.78,
          thickness: 0.45,
          ior: 1.52,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          iridescence: 0.35,
          iridescenceIOR: 1.32,
          transparent: true,
          opacity: 0.88,
          envMapIntensity: 1.55,
        });
      } else if (matName.includes('ObsidianCortex')) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#090b12'),
          roughness: 0.38,
          metalness: 0.34,
          clearcoat: 0.36,
          clearcoatRoughness: 0.26,
          reflectivity: 0.72,
          bumpMap: this.microTexture ?? undefined,
          bumpScale: 0.01,
          roughnessMap: this.microTexture ?? undefined,
          envMapIntensity: 0.85,
        });
      } else if (matName.includes('CopperPipe')) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#c86c3c'),
          roughness: 0.2,
          metalness: 0.96,
          clearcoat: 0.2,
          envMapIntensity: 1.25,
        });
      } else if (matName.includes('SolarSilicon')) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#0c1e42'),
          roughness: 0.16,
          metalness: 0.72,
          clearcoat: 0.8,
          clearcoatRoughness: 0.12,
          envMapIntensity: 1.4,
        });
      } else if (matName.includes('ChampagneBrass')) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#d4b47e'),
          roughness: 0.24,
          metalness: 0.94,
          clearcoat: 0.2,
          clearcoatRoughness: 0.16,
          bumpMap: this.microTexture ?? undefined,
          bumpScale: 0.004,
          envMapIntensity: 1.15,
        });
      } else if (matName.includes('TitaniumDark')) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#222630'),
          roughness: 0.3,
          metalness: 0.9,
          clearcoat: 0.18,
          bumpMap: this.microTexture ?? undefined,
          bumpScale: 0.005,
          envMapIntensity: 1.0,
        });
      } else if (matName.includes('VermilionSignal')) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#ff5238'),
          emissive: new THREE.Color('#ff492e'),
          emissiveIntensity: 2.35,
          roughness: 0.2,
          metalness: 0.1,
          toneMapped: false,
        });
      } else if (matName.includes('PhosphorSignal')) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#4ef2c4'),
          emissive: new THREE.Color('#42efc0'),
          emissiveIntensity: 2.25,
          roughness: 0.2,
          metalness: 0.1,
          toneMapped: false,
        });
      } else if (matName.includes('WarmGoldGlow')) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#f0c882'),
          emissive: new THREE.Color('#e8ba68'),
          emissiveIntensity: 1.75,
          roughness: 0.2,
          metalness: 0.5,
          toneMapped: false,
        });
      } else if (matName.includes('BasaltTerrain')) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#16161c'),
          roughness: 0.52,
          metalness: 0.24,
          clearcoat: 0.22,
          clearcoatRoughness: 0.34,
          bumpMap: this.microTexture ?? undefined,
          bumpScale: 0.014,
          envMapIntensity: 1.25,
        });
      } else {
        child.material = new THREE.MeshPhysicalMaterial({
          color: baseColor,
          roughness: oldMat.roughness ?? 0.42,
          metalness: oldMat.metalness ?? 0.4,
          clearcoat: 0.3,
          envMapIntensity: 1.3,
        });
      }

      // Cache upgraded studio material + dedicated architectural wireframe material
      // (avoids Three.js transmission render-pass blackout when toggling wireframe!)
      const studioMat = child.material as THREE.Material;
      studioMat.userData.originalEmissiveIntensity =
        (studioMat as THREE.MeshStandardMaterial).emissiveIntensity ?? 0;

      let wireColor = '#4ef2c4';
      let wireOpacity = 0.52;
      if (matName.includes('ChampagneBrass') || matName.includes('WarmGold')) {
        wireColor = '#e2c187';
        wireOpacity = 0.72;
      } else if (matName.includes('Vermilion')) {
        wireColor = '#ff5238';
        wireOpacity = 0.95;
      } else if (matName.includes('Phosphor')) {
        wireColor = '#4ef2c4';
        wireOpacity = 0.95;
      } else if (matName.includes('RealCortex')) {
        wireColor = '#66ebd0';
        wireOpacity = 0.28;
      } else if (matName.includes('RealCerebellum') || matName.includes('RealBrainstem')) {
        wireColor = '#d8b882';
        wireOpacity = 0.34;
      } else if (matName.includes('Obsidian') || matName.includes('Basalt')) {
        wireColor = '#8fd8cc';
        wireOpacity = 0.36;
      } else if (matName.includes('SmokedGlass') || matName.includes('SubcorticalGlass')) {
        wireColor = '#a8ebe0';
        wireOpacity = 0.62;
      } else {
        wireColor = '#c5b89e';
        wireOpacity = 0.48;
      }

      const wireMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(wireColor),
        wireframe: true,
        transparent: true,
        opacity: wireOpacity,
        toneMapped: false,
      });

      child.userData.studioMaterial = studioMat;
      child.userData.wireMaterial = wireMat;
    });
  }

  public async loadSpecimen(
    id: SpecimenId,
    onProgress?: (ratio: number) => void
  ): Promise<THREE.Group | null> {
    if (this.specimens.has(id)) {
      onProgress?.(1);
      return this.specimens.get(id)!;
    }
    if (this.loadingSpecimens.has(id)) return null;
    this.loadingSpecimens.add(id);

    const meta = SPECIMENS.find((s) => s.id === id);
    if (!meta) return null;

    try {
      const gltf = await this.gltfLoader.loadAsync(meta.modelPath, (xhr) => {
        if (xhr.total > 0) onProgress?.(xhr.loaded / xhr.total);
      });

      const root = gltf.scene;
      this.upgradeMaterials(root);

      // Normalize bounding scale subtly so all 4 sculptures feel harmoniously proportioned
      const wrapper = new THREE.Group();
      wrapper.name = `Specimen_${id}`;
      wrapper.add(root);

      if (id === 'cortical') {
        wrapper.scale.setScalar(1.0);
        this.corticalParts = {
          left: root.getObjectByName('Cortex_Left'),
          right: root.getObjectByName('Cortex_Right'),
          core: root.getObjectByName('Core_Prism'),
          lattice: root.getObjectByName('Cortical_Lattice'),
          gOuter: root.getObjectByName('Gimbal_Outer'),
          gMid: root.getObjectByName('Gimbal_Mid'),
          gInner: root.getObjectByName('Gimbal_Inner'),
          tokens: root.getObjectByName('Token_Ring'),
        };
      } else if (id === 'eeg') {
        wrapper.scale.setScalar(0.95);
        root.rotation.set(0.14, -1.0, 0.0);
      } else if (id === 'geospatial') {
        wrapper.scale.setScalar(0.96);
        root.rotation.set(0.24, -0.45, 0.0);
      } else if (id === 'eval') {
        wrapper.scale.setScalar(1.06);
        root.rotation.set(0.42, -0.52, 0.0);
      }

      wrapper.visible = false;
      this.specimenStage.add(wrapper);
      this.specimens.set(id, wrapper);
      this.applyLightingModeToGroup(wrapper);
      onProgress?.(1);
      return wrapper;
    } catch (err) {
      console.warn(`Failed loading specimen ${id}:`, err);
      return null;
    } finally {
      this.loadingSpecimens.delete(id);
    }
  }

  public async activateSpecimen(id: SpecimenId, immediate = false): Promise<void> {
    if (!this.specimens.has(id)) {
      await this.loadSpecimen(id);
    }
    this.activeSpecimenId = id;
    this.specimens.forEach((group, key) => {
      group.visible = key === id;
    });
    this.specimenSwapAnim = immediate ? 1 : 0.001;
    if (!immediate) this.triggerPulse(0.75);
  }

  public getActiveSpecimenId(): SpecimenId {
    return this.activeSpecimenId;
  }

  public setSection(sectionId: string): void {
    if (SECTION_POSES[sectionId]) {
      this.currentSection = sectionId;
    }
  }

  public setScrollProgress(normalized: number): void {
    this.scrollNormalized = Math.max(0, Math.min(1, normalized));
    if (this.backdropMat) {
      this.backdropMat.uniforms.uScroll.value = this.scrollNormalized;
    }
  }

  public setAccentFocus(accent: 'vermilion' | 'phosphor' | 'gold'): void {
    if (!this.rimCoralLight || !this.rimTealLight) return;
    if (accent === 'vermilion') {
      this.rimCoralLight.color.set('#ff5238');
      this.rimTealLight.color.set('#d9b882');
      this.targetAccentBias = -1;
    } else if (accent === 'phosphor') {
      this.rimCoralLight.color.set('#4ef2c4');
      this.rimTealLight.color.set('#6ca8ff');
      this.targetAccentBias = 1;
    } else {
      this.rimCoralLight.color.set('#e5be7e');
      this.rimTealLight.color.set('#4ef2c4');
      this.targetAccentBias = 0;
    }
  }

  public triggerPulse(strength = 1.0): void {
    this.pulseValue = Math.max(this.pulseValue, strength);
  }

  public setInspectMode(enabled: boolean): void {
    this.inspectMode = enabled;
    this.controls.enabled = enabled;
    this.canvas.style.pointerEvents = enabled ? 'auto' : 'none';

    if (enabled) {
      // Smoothly bring the sculpture center stage with generous top/bottom margin for studio inspection
      this.controls.target.set(0, 0, 0);
      this.camera.position.set(0, 0.45, 6.65);
      this.controls.update();
      this.triggerPulse(0.85);
    } else {
      // Sync smooth lerped camera back from OrbitControls so returning to hero frames cleanly
      this.curCamPos.copy(this.camera.position);
      this.curLookAt.copy(this.controls.target);
    }
  }

  public setLightingMode(mode: StudioLightingMode): void {
    this.lightingMode = mode;
    this.specimens.forEach((group) => this.applyLightingModeToGroup(group));

    if (mode === 'museum') {
      this.renderer.toneMappingExposure = 0.94;
      this.bloomPass.strength = this.isMobile ? 0.22 : 0.34;
      this.bloomPass.threshold = 1.18;
      this.scene.environmentIntensity = 0.62;
    } else if (mode === 'signal') {
      this.renderer.toneMappingExposure = 1.05;
      this.bloomPass.strength = this.isMobile ? 0.42 : 0.58;
      this.bloomPass.threshold = 0.95;
      this.scene.environmentIntensity = 0.38;
    } else {
      this.renderer.toneMappingExposure = 1.05;
      this.bloomPass.strength = 0.45;
      this.bloomPass.threshold = 0.85;
      this.scene.environmentIntensity = 0.4;
    }
    this.triggerPulse(0.65);
  }

  private applyLightingModeToGroup(group: THREE.Object3D): void {
    const isWire = this.lightingMode === 'wireframe';
    const isSignal = this.lightingMode === 'signal';
    group.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const studioMat = child.userData.studioMaterial as THREE.MeshStandardMaterial | undefined;
      const wireMat = child.userData.wireMaterial as THREE.MeshBasicMaterial | undefined;
      if (!studioMat) return;

      if (isWire && wireMat) {
        child.material = wireMat;
      } else {
        child.material = studioMat;
        studioMat.wireframe = false;
        const origEmissive = studioMat.userData.originalEmissiveIntensity ?? 0;
        if (origEmissive > 0) {
          studioMat.emissiveIntensity = isSignal ? origEmissive * 1.65 : origEmissive;
        }
      }
    });
  }

  private handlePointerMove = (e: PointerEvent): void => {
    const nx = e.clientX / Math.max(window.innerWidth, 1);
    const ny = e.clientY / Math.max(window.innerHeight, 1);
    this.pointer.set(nx * 2 - 1, -(ny * 2 - 1));
    if (this.backdropMat) {
      this.backdropMat.uniforms.uMouse.value.set(nx, 1.0 - ny);
    }
  };

  private handleResize = (): void => {
    this.isMobile = window.innerWidth < 900;
    const w = window.innerWidth;
    const h = Math.max(window.innerHeight, 1);
    const dpr = Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.5 : 2);

    this.camera.fov = this.isMobile ? 46 : 38;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(w, h);
    this.bloomPass.setSize(w, h);

    this.backdropMat.uniforms.uResolution.value.set(w, h);
    this.neuralField.material.uniforms.uPixelRatio.value = dpr;
  };

  private handleVisibility = (): void => {
    this.isHidden = document.hidden;
    if (!this.isHidden) {
      this.clock.getDelta();
    }
  };

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);
    if (this.isHidden) return;

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    const damp = 1.0 - Math.exp(-dt * 4.2);

    // Smooth pointer tracking
    this.pointerSmooth.lerp(this.pointer, 1.0 - Math.exp(-dt * 5.0));

    // Decay neural pulse
    this.pulseValue = Math.max(0, this.pulseValue - dt * 0.92);

    // Swap scale spring
    if (this.specimenSwapAnim < 1) {
      this.specimenSwapAnim = Math.min(1, this.specimenSwapAnim + dt * 2.6);
    }
    const easeSwap = 1 - Math.pow(1 - this.specimenSwapAnim, 3);

    // Target pose based on active scroll section OR centered Studio Inspect Mode
    const pose = SECTION_POSES[this.currentSection] ?? SECTION_POSES.hero;
    const mobileXScale = this.isMobile ? 0.1 : 1.0;
    const mobileScaleBoost = this.isMobile ? 0.62 : 1.0;

    if (this.inspectMode) {
      this.curRigPos.lerp(new THREE.Vector3(0, 0.05, 0), damp * 1.4);
      this.curRigScale += ((this.isMobile ? 0.85 : 1.1) * easeSwap - this.curRigScale) * damp * 1.4;
      this.curPedestalOpacity += (0.85 - this.curPedestalOpacity) * damp;
      this.controls.update();
    } else {
      const targetCam = pose.camPos.clone();
      if (this.isMobile) targetCam.z += 2.2;
      targetCam.x += this.pointerSmooth.x * 0.22;
      targetCam.y += this.pointerSmooth.y * 0.14;
      this.curCamPos.lerp(targetCam, damp);
      this.camera.position.copy(this.curCamPos);

      this.curLookAt.lerp(pose.lookAt, damp);
      this.camera.lookAt(this.curLookAt);

      const targetRigPos = new THREE.Vector3(
        pose.rigPos.x * mobileXScale,
        pose.rigPos.y + (this.isMobile ? 0.68 : 0) + Math.sin(t * 0.85) * 0.05,
        pose.rigPos.z + (this.isMobile ? -1.2 : 0)
      );
      this.curRigPos.lerp(targetRigPos, damp);

      const targetScale = pose.rigScale * mobileScaleBoost * (0.82 + 0.18 * easeSwap);
      this.curRigScale += (targetScale - this.curRigScale) * damp;
      this.curPedestalOpacity += ((this.currentSection === 'specimens' ? 0.45 : 0.0) - this.curPedestalOpacity) * damp;

      // Smooth choreography rotation + subtle cursor tilt
      const targetRx = pose.rigRot.x + this.pointerSmooth.y * 0.16;
      const targetRy = pose.rigRot.y + this.pointerSmooth.x * 0.26 + (this.reducedMotion ? 0 : t * 0.14);
      const targetRz = pose.rigRot.z;
      this.curRotX += (targetRx - this.curRotX) * damp;
      this.curRotY += (targetRy - this.curRotY) * damp;
      this.curRotZ += (targetRz - this.curRotZ) * damp;
      this.specimenStage.rotation.set(this.curRotX, this.curRotY, this.curRotZ);
    }

    this.specimenStage.position.copy(this.curRigPos);
    this.specimenStage.scale.setScalar(this.curRigScale);

    // Animate internal articulated Blender sub-parts
    if (!this.reducedMotion) {
      this.animateActiveSpecimenParts(t, dt, pose, damp);
    }

    // Smooth lighting & shader transitions (calibrated for deep museum obsidian look-dev)
    const mobileLightScale = this.isMobile && !this.inspectMode ? 0.62 : 1.0;
    this.keyLight.intensity += (pose.keyIntensity * 0.65 * mobileLightScale - this.keyLight.intensity) * damp;
    this.rimTealLight.intensity += ((pose.rimTealIntensity * 0.8 + this.pulseValue * 2.0) * mobileLightScale - this.rimTealLight.intensity) * damp;
    this.rimCoralLight.intensity += ((pose.rimCoralIntensity * 0.8 + this.pulseValue * 1.6) * mobileLightScale - this.rimCoralLight.intensity) * damp;

    this.backdropMat.uniforms.uTime.value = t;
    this.backdropMat.uniforms.uPulse.value = this.pulseValue;
    this.backdropMat.uniforms.uAccentA.value.lerp(pose.accentA, damp * 0.6);
    this.backdropMat.uniforms.uAccentB.value.lerp(pose.accentB, damp * 0.6);

    // Update live FreeSurfer cortical surface shader uniforms
    this.corticalUniforms.uTime.value = t;
    this.corticalUniforms.uPulse.value = this.pulseValue;
    const targetSignal = this.lightingMode === 'signal' ? 1.0 : 0.0;
    this.corticalUniforms.uSignalBoost.value += (targetSignal - this.corticalUniforms.uSignalBoost.value) * damp;
    this.corticalUniforms.uAccentBias.value += (this.targetAccentBias - this.corticalUniforms.uAccentBias.value) * damp;

    this.neuralField.material.uniforms.uTime.value = t;
    this.neuralField.material.uniforms.uPulse.value = this.pulseValue;
    this.neuralField.material.uniforms.uOpacity.value +=
      ((this.inspectMode ? 0.55 : pose.particleOpacity) - this.neuralField.material.uniforms.uOpacity.value) * damp;
    this.neuralField.points.rotation.y = t * 0.028 + this.pointerSmooth.x * 0.08;
    this.neuralField.points.rotation.x = this.pointerSmooth.y * 0.05;

    const pedMat = this.pedestal.material as THREE.ShaderMaterial;
    pedMat.uniforms.uTime.value = t;
    pedMat.uniforms.uOpacity.value = this.curPedestalOpacity;
    this.pedestal.position.x = this.curRigPos.x;

    this.composer.render();
  };

  private animateActiveSpecimenParts(t: number, dt: number, pose: StagePose, damp: number): void {
    if (this.activeSpecimenId === 'cortical') {
      const { left, right, core, gOuter, gMid } = this.corticalParts;
      const targetSplit = this.inspectMode ? 0.08 + Math.sin(t * 0.65) * 0.03 : pose.splitHemispheres + this.pulseValue * 0.08;
      this.curSplit += (targetSplit - this.curSplit) * damp;

      if (left) left.position.x = -this.curSplit;
      if (right) right.position.x = this.curSplit;
      if (core) {
        // Keep real anatomical Thalamus, Hippocampus & Corpus Callosum aligned cleanly in place!
        const pulseScale = 1.0 + Math.sin(t * 1.9) * 0.015 + this.pulseValue * 0.04;
        core.scale.setScalar(pulseScale);
      }
      if (gOuter) gOuter.rotation.z += dt * 0.06;
      if (gMid) {
        gMid.rotation.y -= dt * 0.05;
      }
    } else if (this.activeSpecimenId === 'eeg') {
      // EEG montage shares live cortical sulcal shader + subtle breathing
      const grp = this.specimens.get('eeg');
      if (grp) {
        grp.position.y = Math.sin(t * 0.9) * 0.04;
      }
    } else if (this.activeSpecimenId === 'geospatial') {
      const grp = this.specimens.get('geospatial');
      if (grp) {
        const sat = grp.getObjectByName('Satellite_Assembly');
        const beam = grp.getObjectByName('Spectral_Scan_Beam');
        if (sat) {
          sat.position.y = 0.85 + Math.sin(t * 1.15) * 0.06;
          sat.rotation.y = Math.sin(t * 0.55) * 0.14;
        }
        if (beam) {
          beam.position.z = Math.sin(t * 0.9) * 0.32;
        }
      }
    } else if (this.activeSpecimenId === 'eval') {
      const grp = this.specimens.get('eval');
      if (grp) {
        const fan0 = grp.getObjectByName('Cooling_Fan_0');
        const fan1 = grp.getObjectByName('Cooling_Fan_1');
        if (fan0) fan0.rotation.z += dt * 7.5;
        if (fan1) fan1.rotation.z -= dt * 7.5;
      }
    }
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.controls.dispose();
    this.renderer.dispose();
  }
}
