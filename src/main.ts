import './styles/main.css';
import Lenis from 'lenis';
import {
  PUBLICATIONS,
  SITE_META,
  SPECIMENS,
  formatBibtex,
} from './data/cvData';
import {
  SceneController,
  type SpecimenId,
  type StudioLightingMode,
} from './scene/SceneController';
import { renderAppContent } from './ui/renderApp';

function showToast(msg: string): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  window.clearTimeout((el as unknown as { _t?: number })._t);
  (el as unknown as { _t?: number })._t = window.setTimeout(() => {
    el.classList.remove('show');
  }, 2400);
}

async function copyText(text: string, successMessage: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    showToast('Copy unavailable in this context');
  }
}

function init(): void {
  const appEl = document.getElementById('app-content');
  if (!appEl) return;

  // 1. Render semantic editorial CV content
  renderAppContent(appEl);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 2. Preloader refs
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderPct = document.getElementById('preloader-pct');
  const preloaderStatus = document.getElementById('preloader-status');

  const setPreloader = (pct: number, status?: string): void => {
    if (preloaderBar) preloaderBar.style.width = `${pct}%`;
    if (preloaderPct) preloaderPct.textContent = `${String(pct).padStart(2, '0')}%`;
    if (status && preloaderStatus) preloaderStatus.textContent = status;
  };

  let preloaderDismissed = false;
  const dismissPreloader = (): void => {
    if (preloaderDismissed) return;
    preloaderDismissed = true;
    setPreloader(100, 'INSTRUMENT ONLINE');
    window.setTimeout(() => {
      preloader?.classList.add('done');
    }, 240);
  };

  // Hard safety cap so preloader never stalls on slow connections
  window.setTimeout(dismissPreloader, 3600);

  // 3. Initialise Three.js WebGL Engine
  const canvas = document.getElementById('scene-canvas') as HTMLCanvasElement | null;
  const scene = canvas
    ? new SceneController(canvas, {
        onProgress: (pct) => {
          const msg =
            pct < 40
              ? 'CALIBRATING CYCLES STUDIO HDRI'
              : pct < 90
                ? 'STREAMING CORTICAL MONOLITH GLB'
                : 'COMPILING OPTICAL SHADERS';
          setPreloader(pct, msg);
        },
        onReady: () => {
          dismissPreloader();
          window.setTimeout(() => scene?.triggerPulse(0.75), 550);
        },
        onFallback: () => {
          document.body.classList.add('webgl-fallback');
          dismissPreloader();
        },
      })
    : null;

  void scene?.init();

  // 4. Smooth Scroll via Lenis
  let lenis: Lenis | null = null;
  if (!reducedMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    const rafLenis = (time: number): void => {
      lenis?.raf(time);
      requestAnimationFrame(rafLenis);
    };
    requestAnimationFrame(rafLenis);
  }

  // Smooth anchor scrolling (works seamlessly with Lenis)
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      closeMobileDrawer();
      if (document.body.classList.contains('inspect-mode')) {
        toggleInspectMode(false);
      }
      if (lenis) {
        lenis.scrollTo(targetEl as HTMLElement, { offset: -64 });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 5. Scroll Telemetry: Header shrink, Progress Hairline, Career Timeline Spine, Scene Scroll Progress
  const header = document.getElementById('site-header');
  const progressBar = document.getElementById('scroll-progress-bar');
  const careerTimeline = document.getElementById('career-timeline');
  const careerSpineFill = document.getElementById('career-spine-fill');

  const updateScrollEffects = (): void => {
    const sy = window.scrollY;
    header?.classList.toggle('scrolled', sy > 36);

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const norm = Math.max(0, Math.min(1, sy / maxScroll));
    if (progressBar) progressBar.style.width = `${(norm * 100).toFixed(2)}%`;
    scene?.setScrollProgress(norm);

    if (careerTimeline && careerSpineFill) {
      const rect = careerTimeline.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight * 0.72 - rect.top) / Math.max(rect.height, 1)));
      careerSpineFill.style.transform = `scaleY(${progress.toFixed(4)})`;
    }
  };

  window.addEventListener('scroll', updateScrollEffects, { passive: true });
  updateScrollEffects();

  // 6. Section Spy -> Drives Three.js Choreography + Right Rail + Primary Nav
  const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')];
  const railLinks = [...document.querySelectorAll<HTMLAnchorElement>('.section-rail a')];
  const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('.primary-nav a')];

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const secId = (entry.target as HTMLElement).dataset.section;
        if (!secId) return;

        scene?.setSection(secId);

        railLinks.forEach((a) => a.classList.toggle('active', a.dataset.sec === secId));
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${secId}`));
      });
    },
    { rootMargin: '-38% 0px -48% 0px', threshold: 0 }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  // 7. Reveal Observer & Count-up Metrics
  const revealEls = [...document.querySelectorAll<HTMLElement>('.reveal')];
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  const counterEls = [...document.querySelectorAll<HTMLElement>('[data-count]')];
  const animateCounter = (el: HTMLElement): void => {
    const target = Number(el.dataset.count || 0);
    if (reducedMotion) {
      el.textContent = String(target);
      return;
    }
    const start = performance.now();
    const dur = 1150;
    const step = (now: number): void => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target as HTMLElement);
          counterObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  counterEls.forEach((el) => counterObs.observe(el));

  // 8. Specimen Studio Switcher + HUD Sync
  const hudLabel = document.getElementById('hud-specimen-label');
  const hudPillsContainer = document.getElementById('hud-specimen-pills');
  const stageActiveName = document.getElementById('stage-active-name');

  const specTitle = document.getElementById('spec-title');
  const specIndex = document.getElementById('spec-index');
  const specDesc = document.getElementById('spec-desc');
  const specChannels = document.getElementById('spec-channels');
  const specArch = document.getElementById('spec-arch');
  const specMedium = document.getElementById('spec-medium');

  if (hudPillsContainer) {
    const shortLabels: Record<SpecimenId, string> = {
      cortical: '01 Brain',
      eeg: '02 EEG Cap',
      geospatial: '03 Satellite',
      eval: '04 GPU Node',
    };
    hudPillsContainer.innerHTML = SPECIMENS.map(
      (s, i) => `
      <button type="button" class="hud-pill ${i === 0 ? 'active' : ''}" data-hud-specimen="${s.id}">
        ${shortLabels[s.id]}
      </button>
    `
    ).join('');
  }

  const selectSpecimen = async (id: SpecimenId): Promise<void> => {
    const meta = SPECIMENS.find((s) => s.id === id);
    if (!meta) return;

    await scene?.activateSpecimen(id);

    document.querySelectorAll<HTMLButtonElement>('[data-specimen]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.specimen === id);
    });
    document.querySelectorAll<HTMLButtonElement>('[data-hud-specimen]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.hudSpecimen === id);
    });

    if (hudLabel) hudLabel.textContent = `${meta.index.replace('MODEL ', '')} / ${meta.name.toUpperCase()}`;
    if (stageActiveName) stageActiveName.textContent = meta.name.toUpperCase();
    if (specTitle) specTitle.textContent = meta.name;
    if (specIndex) specIndex.textContent = meta.index;
    if (specDesc) specDesc.textContent = meta.description;
    if (specChannels) specChannels.textContent = meta.telemetry.channels;
    if (specArch) specArch.textContent = meta.telemetry.architecture;
    if (specMedium) specMedium.textContent = meta.telemetry.medium;
  };

  document.querySelectorAll<HTMLButtonElement>('[data-specimen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.specimen as SpecimenId;
      void selectSpecimen(id);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-hud-specimen]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.hudSpecimen as SpecimenId;
      void selectSpecimen(id);
    });
  });

  // Quick wireframe toggle in specimen card + Look-Dev lighting pills in HUD
  let currentLighting: StudioLightingMode = 'museum';
  const applyLighting = (mode: StudioLightingMode): void => {
    currentLighting = mode;
    scene?.setLightingMode(mode);
    document.querySelectorAll<HTMLButtonElement>('[data-light]').forEach((b) => {
      b.classList.toggle('active', b.dataset.light === mode);
    });
  };

  document.querySelectorAll<HTMLButtonElement>('[data-light]').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLighting(btn.dataset.light as StudioLightingMode);
    });
  });

  document.querySelector<HTMLButtonElement>('[data-quick-light="wireframe"]')?.addEventListener('click', () => {
    applyLighting(currentLighting === 'wireframe' ? 'museum' : 'wireframe');
  });

  // 9. Interactive 360° Studio Inspect Mode
  const hudCompact = document.querySelector<HTMLElement>('.hud-compact');
  const hudInspectBar = document.querySelector<HTMLElement>('.hud-inspect-bar');
  const inspectBanner = document.getElementById('inspect-banner');

  const toggleInspectMode = (enable: boolean): void => {
    document.body.classList.toggle('inspect-mode', enable);
    hudCompact?.setAttribute('aria-hidden', String(enable));
    hudInspectBar?.setAttribute('aria-hidden', String(!enable));
    inspectBanner?.setAttribute('aria-hidden', String(!enable));
    scene?.setInspectMode(enable);
    if (enable) {
      lenis?.stop();
    } else {
      lenis?.start();
    }
  };

  document.getElementById('btn-inspect-toggle')?.addEventListener('click', () => toggleInspectMode(true));
  document.getElementById('btn-hero-inspect')?.addEventListener('click', () => toggleInspectMode(true));
  document.getElementById('btn-spec-orbit')?.addEventListener('click', () => toggleInspectMode(true));
  document.getElementById('btn-inspect-exit')?.addEventListener('click', () => toggleInspectMode(false));

  document.getElementById('btn-pulse')?.addEventListener('click', () => scene?.triggerPulse(1.0));
  document.getElementById('btn-spec-pulse')?.addEventListener('click', () => scene?.triggerPulse(1.0));
  document.getElementById('btn-inspect-pulse')?.addEventListener('click', () => scene?.triggerPulse(1.0));

  // Hero word pulse interactions ("brains" / "machines")
  document.querySelectorAll<HTMLElement>('[data-pulse]').forEach((el) => {
    const accent = el.dataset.pulse as 'vermilion' | 'phosphor';
    el.addEventListener('mouseenter', () => {
      scene?.setAccentFocus(accent);
      scene?.triggerPulse(0.75);
    });
    el.addEventListener('click', () => {
      scene?.setAccentFocus(accent);
      scene?.triggerPulse(1.0);
    });
  });

  // Career cards subtly shift studio rim lighting on hover
  document.querySelectorAll<HTMLElement>('.role-card').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const accent = card.dataset.accent as 'vermilion' | 'phosphor' | 'gold' | undefined;
      if (accent) scene?.setAccentFocus(accent);
    });
  });

  // Research Theme "Load 3D Specimen" launches matching Blender model in 360° Orbit!
  document.querySelectorAll<HTMLButtonElement>('[data-launch-specimen]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.launchSpecimen as SpecimenId;
      await selectSpecimen(id);
      toggleInspectMode(true);
    });
  });

  // 10. Career Track Filters
  const careerFilterBtns = [...document.querySelectorAll<HTMLButtonElement>('[data-career-filter]')];
  const roleCards = [...document.querySelectorAll<HTMLElement>('.role-card')];
  careerFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.careerFilter || 'all';
      careerFilterBtns.forEach((b) => b.classList.toggle('active', b === btn));
      roleCards.forEach((card) => {
        const match = filter === 'all' || card.dataset.track === filter;
        card.classList.toggle('hidden-item', !match);
      });
      updateScrollEffects();
    });
  });

  // 11. Publications Category Filter, Search & BibTeX Copy
  let activePubCat = 'all';
  let pubQuery = '';
  const pubFilterBtns = [...document.querySelectorAll<HTMLButtonElement>('[data-pub-filter]')];
  const pubCards = [...document.querySelectorAll<HTMLElement>('.pub-card')];
  const pubSearchInput = document.getElementById('pub-search') as HTMLInputElement | null;

  const applyPubFilters = (): void => {
    const q = pubQuery.trim().toLowerCase();
    pubCards.forEach((card) => {
      const catMatch = activePubCat === 'all' || card.dataset.category === activePubCat;
      const searchMatch = !q || (card.dataset.search || '').includes(q);
      card.classList.toggle('hidden-item', !(catMatch && searchMatch));
    });
  };

  pubFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activePubCat = btn.dataset.pubFilter || 'all';
      pubFilterBtns.forEach((b) => b.classList.toggle('active', b === btn));
      applyPubFilters();
    });
  });

  pubSearchInput?.addEventListener('input', () => {
    pubQuery = pubSearchInput.value;
    applyPubFilters();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-copy-bib]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pub = PUBLICATIONS.find((p) => p.id === btn.dataset.copyBib);
      if (pub) {
        void copyText(formatBibtex(pub), `Copied BibTeX (${pub.bibtexKey})`);
      }
    });
  });

  document.getElementById('btn-contact-copy')?.addEventListener('click', () => {
    void copyText(SITE_META.email, `Copied ${SITE_META.email}`);
  });

  // 12. Editorial Art Plate Lightbox
  const lightbox = document.getElementById('art-lightbox');
  const lbImg = document.getElementById('lightbox-img') as HTMLImageElement | null;
  const lbNo = document.getElementById('lightbox-no');
  const lbTitle = document.getElementById('lightbox-title');
  const lbDesc = document.getElementById('lightbox-desc');
  const lbInspectBtn = document.getElementById('lightbox-inspect-btn');
  let lightboxSpecimen: SpecimenId = 'cortical';

  const closeLightbox = (): void => {
    lightbox?.classList.remove('open');
    lightbox?.setAttribute('aria-hidden', 'true');
  };

  document.querySelectorAll<HTMLElement>('[data-lightbox-img]').forEach((el) => {
    el.addEventListener('click', () => {
      if (lbImg) lbImg.src = el.dataset.lightboxImg || '';
      if (lbImg) lbImg.alt = el.dataset.lightboxTitle || '';
      if (lbNo) lbNo.textContent = el.dataset.lightboxNo || '';
      if (lbTitle) lbTitle.textContent = el.dataset.lightboxTitle || '';
      if (lbDesc) lbDesc.textContent = el.dataset.lightboxDesc || '';
      lightboxSpecimen = (el.dataset.lightboxSpecimen as SpecimenId) || 'cortical';
      lightbox?.classList.add('open');
      lightbox?.setAttribute('aria-hidden', 'false');
    });
  });

  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.querySelector('.lightbox-backdrop')?.addEventListener('click', closeLightbox);
  lbInspectBtn?.addEventListener('click', async () => {
    closeLightbox();
    await selectSpecimen(lightboxSpecimen);
    toggleInspectMode(true);
  });

  // Escape key exits Inspect Mode, Lightbox, or Mobile Drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox?.classList.contains('open')) closeLightbox();
      else if (document.body.classList.contains('inspect-mode')) toggleInspectMode(false);
      else closeMobileDrawer();
    }
  });

  // 13. Mobile Navigation Drawer
  const menuBtn = document.getElementById('btn-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const closeMobileDrawer = (): void => {
    mobileDrawer?.classList.remove('open');
    mobileDrawer?.setAttribute('aria-hidden', 'true');
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
  };

  menuBtn?.addEventListener('click', () => {
    const isOpen = mobileDrawer?.classList.toggle('open') ?? false;
    mobileDrawer?.setAttribute('aria-hidden', String(!isOpen));
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('drawer-open', isOpen);
  });

  // 14. Print / Export Executive CV PDF
  const triggerPrint = (): void => {
    closeMobileDrawer();
    if (document.body.classList.contains('inspect-mode')) {
      toggleInspectMode(false);
    }
    window.print();
  };
  document.getElementById('btn-print-cv')?.addEventListener('click', triggerPrint);
  document.getElementById('btn-mobile-print')?.addEventListener('click', triggerPrint);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
