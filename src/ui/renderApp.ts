import {
  ACADEMIC_SERVICE,
  APPROACH_FACTS,
  AWARDS_ITEMS,
  CAREER_ROLES,
  EARLIER_ROLES,
  EDUCATION_ITEMS,
  ESSAYS,
  GRANTS_ITEMS,
  INVITED_TALKS,
  MEMBERSHIPS,
  OPEN_SOURCE_SYSTEMS,
  PUBLICATIONS,
  RESEARCH_THEMES,
  SITE_META,
  SKILL_GROUPS,
  SPECIMENS,
  TEACHING_ITEMS,
} from '../data/cvData';

function esc(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderAppContent(container: HTMLElement): void {
  const year = new Date().getFullYear();

  container.innerHTML = `
    <!-- ═══════════ 00 HERO ═══════════ -->
    <section id="hero" class="hero-section" data-section="hero">
      <div class="wrap">
        <div class="hero-grid">
          <div class="hero-copy">
            <div class="hero-eyebrow reveal in">
              <span>Cognitive Neuroscience &amp; Applied AI · Sydney</span>
            </div>

            <h1 class="hero-title reveal in d1">
              Where <span class="hero-trigger" data-pulse="vermilion">brains</span><br />
              meet <span class="hero-trigger" data-pulse="phosphor">machines</span>,<br />
              responsibly.
            </h1>

            <p class="hero-lead reveal in d2">
              I'm <strong>Gareth Roberts</strong> — a cognitive neuroscientist (PhD, UWA) turned
              applied-AI leader. A decade of published research on how the brain turns
              <strong>instructions into action</strong>, then production AI built inside regulated
              enterprise: insurance, mining, HR-tech. <strong>Former CTO and Head of AI.</strong>
            </p>

            <div class="hero-credentials reveal in d2">
              <div class="cred-item">
                <span>Doctorate</span>
                <strong>PhD Cognitive Neuroscience &amp; AI</strong>
              </div>
              <div class="cred-item">
                <span>Leadership</span>
                <strong>Former CTO &amp; Head of AI</strong>
              </div>
              <div class="cred-item">
                <span>Record</span>
                <strong>h-index 8 · 12 Invited Talks</strong>
              </div>
            </div>

            <div class="hero-actions reveal in d3">
              <a href="#career" class="btn-primary">
                <span>Experience &amp; Roles</span>
                <span aria-hidden="true">→</span>
              </a>
              <a href="#specimens" class="btn-outline">
                <span>Inspect 3D Models</span>
              </a>
              <button type="button" id="btn-hero-inspect" class="btn-outline">
                <span>360° Brain Viewer</span>
              </button>
            </div>
          </div>

          <div class="hero-sculpture-spacer" aria-hidden="true"></div>
        </div>
      </div>

      <div class="hero-stage-meta">
        <span class="hero-coords">${esc(SITE_META.coords)} · FREESURFER FSAVERAGE6</span>
        <div class="scroll-cue">
          <span class="scroll-cue-line"></span>
          <span>Scroll</span>
        </div>
      </div>
    </section>

    <div class="wrap" aria-hidden="true"><div class="rule-divider"></div></div>

    <!-- ═══════════ 01 APPROACH ═══════════ -->
    <section id="thesis" class="band" data-section="thesis">
      <div class="wrap">
        <div class="section-head reveal">
          <div class="section-head-left">
            <span class="section-index">01 / Approach</span>
            <h2>An unusual lineage</h2>
          </div>
          <span class="section-fig">FIG. 01 · CORTEX &amp; TRANSFORMERS</span>
        </div>

        <div class="approach-layout">
          <div class="approach-spacer reveal">
            <div class="sculpture-callout">
              <span class="mono-label">ANATOMICAL SECTION · FSAVERAGE6</span>
              <p>
                Bilateral pial hemispheres part along the interhemispheric fissure to expose the
                corpus callosum commissural fibers, thalamus, and hippocampus inside.
              </p>
            </div>
          </div>

          <div class="approach-panel reveal d1">
            <p class="approach-lead">
              I study how <em>intelligence</em> works — in cortical networks and in transformers.
            </p>
            <div class="approach-prose">
              <p>
                My PhD and two postdoctoral fellowships were in cognitive neuroscience: the neural
                mechanisms by which the prefrontal and frontoparietal systems convert
                <strong>verbal instructions into goal-directed action</strong> — attention, working
                memory, cognitive control, and how they fail under complexity. The work spans
                experimental psychology, EEG/fMRI/fNIRS neuroimaging and the learning sciences, with
                peer-reviewed publications and invited talks across Australia, the UK and Europe.
              </p>
              <p>
                For the last several years I've built production ML inside regulated industries —
                <strong>insurance, mining, HR-tech</strong> — where a model isn't done when it's
                accurate; it's done when it's governed, auditable and trusted. I've founded AI
                functions from scratch, led engineering teams, and shipped multi-agent systems into
                environments where the regulator is a stakeholder. The throughline is the same
                question I studied in the brain: how do intelligent systems represent instructions,
                hold goals, and stay reliable?
              </p>
            </div>

            <div class="facts-grid">
              ${APPROACH_FACTS.map(
                (f) => `
                <div class="fact-card">
                  <span class="fact-num mono" data-count="${f.value}">0</span>
                  <span class="fact-label">${esc(f.label)}</span>
                  <span class="fact-detail">${esc(f.detail)}</span>
                </div>
              `
              ).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ 02 INTERACTIVE 3D ARTIFACTS ═══════════ -->
    <section id="specimens" class="band" data-section="specimens">
      <div class="wrap">
        <div class="section-head reveal">
          <div class="section-head-left">
            <span class="section-index">02 / 3D Artifacts</span>
            <h2>Instruments of the work</h2>
          </div>
          <span class="section-fig">REAL-TIME WEBGL · BLENDER 5.3</span>
        </div>

        <div class="specimen-layout">
          <div class="specimen-deck reveal">
            <div class="specimen-selector" id="specimen-selector">
              ${SPECIMENS.map(
                (s, idx) => `
                <button
                  type="button"
                  class="specimen-tab ${idx === 0 ? 'active' : ''}"
                  data-specimen="${s.id}"
                >
                  <span class="specimen-tab-idx">${esc(s.index)}</span>
                  <span class="specimen-tab-name">${esc(s.name)}</span>
                  <span class="specimen-tab-domain">${esc(s.domain)}</span>
                </button>
              `
              ).join('')}
            </div>

            <div class="specimen-detail-card" id="specimen-detail">
              <div class="specimen-detail-head">
                <h3 id="spec-title">${esc(SPECIMENS[0].name)}</h3>
                <span id="spec-index" class="mono-label">${esc(SPECIMENS[0].index)}</span>
              </div>
              <p id="spec-desc" class="specimen-detail-desc">${esc(SPECIMENS[0].description)}</p>

              <div class="specimen-telemetry">
                <div class="telemetry-cell">
                  <span>Specification</span>
                  <strong id="spec-channels">${esc(SPECIMENS[0].telemetry.channels)}</strong>
                </div>
                <div class="telemetry-cell">
                  <span>Architecture</span>
                  <strong id="spec-arch">${esc(SPECIMENS[0].telemetry.architecture)}</strong>
                </div>
                <div class="telemetry-cell">
                  <span>Context</span>
                  <strong id="spec-medium">${esc(SPECIMENS[0].telemetry.medium)}</strong>
                </div>
              </div>

              <div class="specimen-actions">
                <button type="button" id="btn-spec-orbit" class="btn-primary-sm">
                  <span>Open 360° Viewer</span>
                </button>
                <button type="button" id="btn-spec-pulse" class="hud-btn">
                  <span>Activate Signal</span>
                </button>
                <button type="button" class="hud-btn" data-quick-light="wireframe">
                  <span>Toggle Mesh</span>
                </button>
              </div>
            </div>
          </div>

          <div class="specimen-stage-window reveal d1" aria-hidden="true">
            <div class="stage-corner-row">
              <span>LIVE 3D VIEWPORT</span>
              <span>ACES FILMIC · STUDIO HDRI</span>
            </div>
            <div class="stage-corner-row">
              <span>BLENDER GLB</span>
              <span id="stage-active-name">HUMAN BRAIN</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ 03 CAREER & APPOINTMENTS ═══════════ -->
    <section id="career" class="band" data-section="career">
      <div class="wrap">
        <div class="section-head reveal">
          <div class="section-head-left">
            <span class="section-index">03 / Experience</span>
            <h2>Career &amp; appointments</h2>
          </div>
          <span class="section-fig">REGULATED ENTERPRISE &amp; ACADEMIA</span>
        </div>

        <div class="filter-bar reveal">
          <div class="filter-pills" role="tablist" aria-label="Filter career roles">
            <button type="button" class="filter-pill active" data-career-filter="all">
              All Appointments (${CAREER_ROLES.length})
            </button>
            <button type="button" class="filter-pill" data-career-filter="industry">
              Industry &amp; Executive (${CAREER_ROLES.filter((r) => r.track === 'industry').length})
            </button>
            <button type="button" class="filter-pill" data-career-filter="academic">
              Academic &amp; Research (${CAREER_ROLES.filter((r) => r.track === 'academic').length})
            </button>
          </div>
          <span class="mono-label">2014 — PRESENT</span>
        </div>

        <div class="career-timeline" id="career-timeline">
          <div class="timeline-spine" aria-hidden="true">
            <div class="timeline-spine-fill" id="career-spine-fill"></div>
          </div>

          ${CAREER_ROLES.map(
            (role) => `
            <article
              class="role-card reveal"
              data-track="${role.track}"
              data-accent="${role.accent}"
              data-specimen="${role.specimenId}"
            >
              <div class="role-left">
                <span class="role-track ${role.track}">${esc(role.trackLabel)}</span>
                <div class="role-period mono">${esc(role.period)}</div>
                <h3 class="role-org">${esc(role.org)}</h3>
                <div class="role-title">${esc(role.title)}</div>
                <div class="role-place">${esc(role.location)}</div>
              </div>

              <div class="role-right">
                <div class="role-metrics">
                  ${role.metrics.map((m) => `<span class="metric-chip">${esc(m)}</span>`).join('')}
                </div>
                <ul class="role-points">
                  ${role.points.map((pt) => `<li>${pt}</li>`).join('')}
                </ul>
              </div>
            </article>
          `
          ).join('')}
        </div>

        <div class="earlier-box reveal">
          <span class="mono-label">Earlier Roles, Ventures &amp; Applied-Research Contracts</span>
          <div class="earlier-grid">
            ${EARLIER_ROLES.map(
              (er) => `
              <div class="earlier-item">
                <div>
                  <strong>${esc(er.org)}</strong>
                  <span class="sub">${esc(er.role)}</span>
                </div>
                <span class="yr">${esc(er.period)}</span>
              </div>
            `
            ).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ 04 RESEARCH THEMES & INVITED TALKS ═══════════ -->
    <section id="research" class="band" data-section="research">
      <div class="wrap">
        <div class="section-head reveal">
          <div class="section-head-left">
            <span class="section-index">04 / Research</span>
            <h2>Research programmes</h2>
          </div>
          <span class="section-fig">FIG. 04 · FOUR PROGRAMMES</span>
        </div>

        <div class="themes-grid">
          ${RESEARCH_THEMES.map(
            (th) => `
            <article class="theme-card reveal" data-theme-id="${th.id}" data-accent="${th.accent}">
              <div
                class="theme-media"
                data-lightbox-img="${th.plateImage}"
                data-lightbox-no="PROGRAMME ${th.no}"
                data-lightbox-title="${esc(th.title)}"
                data-lightbox-desc="${esc(th.description)}"
                data-lightbox-specimen="${th.specimenId}"
              >
                <img src="${th.plateImage}" alt="${esc(th.title)}" loading="lazy" />
                <div class="theme-media-overlay">
                  <span class="theme-no">${th.no}</span>
                  <span class="theme-zoom-badge">Expand ↗</span>
                </div>
              </div>
              <div class="theme-body">
                <span class="theme-sub">${esc(th.subtitle)}</span>
                <h3>${esc(th.title)}</h3>
                <p>${esc(th.description)}</p>
                <div class="theme-foot">
                  <div class="keyword-row">
                    ${th.keywords.map((kw) => `<span class="kw-tag">${esc(kw)}</span>`).join('')}
                  </div>
                  <button
                    type="button"
                    class="btn-specimen-link"
                    data-launch-specimen="${th.specimenId}"
                  >
                    Open 3D Model ↗
                  </button>
                </div>
              </div>
            </article>
          `
          ).join('')}
        </div>

        <div class="sub-section-head reveal">
          <span>Invited Talks &amp; Conference Presentations</span>
          <span class="rule"></span>
          <span class="alt">Australia · UK · Europe</span>
        </div>

        <div class="talks-ledger reveal">
          ${INVITED_TALKS.map(
            (tk) => `
            <div class="talk-row">
              <span class="talk-yr">${esc(tk.year)}</span>
              <span class="talk-venue">
                ${esc(tk.venue)}${tk.city ? `, <span class="talk-city">${esc(tk.city)}</span>` : ''}
                ${tk.kind ? `<span class="talk-kind">${esc(tk.kind)}</span>` : ''}
              </span>
            </div>
          `
          ).join('')}
        </div>
      </div>
    </section>

    <!-- ═══════════ 05 PUBLICATIONS, ESSAYS & OPEN SOURCE ═══════════ -->
    <section id="publications" class="band" data-section="publications">
      <div class="wrap">
        <div class="section-head reveal">
          <div class="section-head-left">
            <span class="section-index">05 / Publications &amp; Code</span>
            <h2>Selected publications</h2>
          </div>
          <span class="section-fig">H-INDEX 8 · OPEN-SOURCE SYSTEMS</span>
        </div>

        <div class="filter-bar reveal">
          <div class="filter-pills" role="tablist" aria-label="Filter publications">
            <button type="button" class="filter-pill active" data-pub-filter="all">
              All (${PUBLICATIONS.length})
            </button>
            <button type="button" class="filter-pill" data-pub-filter="learning">
              Learning Sciences
            </button>
            <button type="button" class="filter-pill" data-pub-filter="cognition">
              Cognition &amp; Development
            </button>
            <button type="button" class="filter-pill" data-pub-filter="neuroimaging">
              Neuroimaging &amp; EEG
            </button>
          </div>
          <input
            type="search"
            id="pub-search"
            class="pub-search-input"
            placeholder="Search papers, journals, years..."
            aria-label="Search peer-reviewed publications"
          />
        </div>

        <div class="pub-list" id="pub-list">
          ${PUBLICATIONS.map(
            (pub) => `
            <article
              class="pub-card reveal"
              data-category="${pub.category}"
              data-search="${esc(`${pub.title} ${pub.authors} ${pub.venue} ${pub.year} ${pub.categoryLabel}`.toLowerCase())}"
            >
              <div>
                <span class="pub-cat">${esc(pub.categoryLabel)} · ${pub.year}</span>
                <h3 class="pub-title">${esc(pub.title)}</h3>
                <p class="pub-meta">
                  ${esc(pub.authors)} · <span class="pub-venue">${esc(pub.venue)}</span>${pub.volume ? `, ${esc(pub.volume)}` : ''}
                </p>
              </div>
              <div class="pub-right">
                <span class="pub-badge ${pub.citations ? '' : 'neutral'}">${esc(pub.badge)}</span>
                <button
                  type="button"
                  class="btn-copy-bib"
                  data-copy-bib="${pub.id}"
                >
                  Copy BibTeX
                </button>
              </div>
            </article>
          `
          ).join('')}
        </div>

        <p class="pub-note reveal">
          Selected from peer-reviewed publications and conference proceedings; full record and
          citation metrics (h-index 8) on
          <a href="${SITE_META.links.scholar}" target="_blank" rel="noopener">Google Scholar ↗</a>.
        </p>

        <div class="sub-section-head reveal">
          <span>Essays, Working Papers &amp; Open-Source Systems</span>
          <span class="rule"></span>
          <span class="alt">AI Safety · Cognition · Evaluation</span>
        </div>

        <div class="writing-systems-grid">
          <div class="essays-panel reveal">
            <span class="panel-subtitle">Selected Essays &amp; Working Papers</span>
            ${ESSAYS.map(
              (es) => `
              <div class="essay-row">
                ${
                  es.url
                    ? `<a href="${es.url}" target="_blank" rel="noopener" class="essay-title">${esc(es.title)} ↗</a>`
                    : `<span class="essay-title">${esc(es.title)}</span>`
                }
                <span class="essay-meta">${esc(es.kind)}${es.venue ? ` · ${esc(es.venue)}` : ''} · ${es.year}</span>
              </div>
            `
            ).join('')}
            <p class="pub-note" style="margin: 18px 0 0;">
              Ongoing essays and technical notes at
              <a href="${SITE_META.links.writing}" target="_blank" rel="noopener">2.works ↗</a>.
            </p>
          </div>

          <div class="systems-grid reveal d1">
            ${OPEN_SOURCE_SYSTEMS.map(
              (sys) => `
              <a
                href="${sys.url}"
                target="_blank"
                rel="noopener"
                class="system-card"
              >
                <div class="system-card-head">
                  <span class="system-name">${esc(sys.name)}</span>
                  <span class="system-arrow">GitHub ↗</span>
                </div>
                <div class="system-tagline">${esc(sys.tagline)}</div>
                <p class="system-desc">${esc(sys.description)}</p>
                <div class="keyword-row">
                  ${sys.tags.map((t) => `<span class="kw-tag">${esc(t)}</span>`).join('')}
                </div>
              </a>
            `
            ).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ 06 TEACHING, SERVICE & HONOURS ═══════════ -->
    <section id="teaching" class="band" data-section="teaching">
      <div class="wrap">
        <div class="section-head reveal">
          <div class="section-head-left">
            <span class="section-index">06 / Service &amp; Honours</span>
            <h2>Teaching, supervision &amp; recognition</h2>
          </div>
          <span class="section-fig">UWA · MURDOCH · USYD</span>
        </div>

        <div class="two-col-panels">
          <div class="glass-panel reveal">
            <h3 class="panel-subtitle">Teaching &amp; Supervision</h3>
            ${TEACHING_ITEMS.map(
              (it) => `
              <div class="ledger-row">
                <div class="ledger-main">
                  <strong>${esc(it.title)}</strong>
                  ${it.detail ? `<small>${esc(it.detail)}</small>` : ''}
                </div>
                <span class="ledger-meta">${esc(it.meta)}</span>
              </div>
            `
            ).join('')}

            <h3 class="panel-subtitle spaced">Academic Service &amp; Labs Founded</h3>
            ${ACADEMIC_SERVICE.map(
              (it) => `
              <div class="ledger-row">
                <div class="ledger-main"><strong>${esc(it.title)}</strong></div>
                <span class="ledger-meta">${esc(it.meta)}</span>
              </div>
            `
            ).join('')}
          </div>

          <div class="glass-panel reveal d1">
            <h3 class="panel-subtitle">Grants &amp; Scholarships</h3>
            ${GRANTS_ITEMS.map(
              (it) => `
              <div class="ledger-row">
                <div class="ledger-main">
                  <strong>${esc(it.title)}</strong>
                  ${it.detail ? `<small>${esc(it.detail)}</small>` : ''}
                </div>
                <span class="ledger-meta">${esc(it.meta)}</span>
              </div>
            `
            ).join('')}

            <h3 class="panel-subtitle spaced">Awards &amp; Honours</h3>
            ${AWARDS_ITEMS.map(
              (it) => `
              <div class="ledger-row">
                <div class="ledger-main">
                  <strong>${esc(it.title)}</strong>
                  ${it.detail ? `<small>${esc(it.detail)}</small>` : ''}
                </div>
                <span class="ledger-meta">${esc(it.meta)}</span>
              </div>
            `
            ).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ 07 EDUCATION & EXPERTISE ═══════════ -->
    <section id="education" class="band" data-section="education">
      <div class="wrap">
        <div class="section-head reveal">
          <div class="section-head-left">
            <span class="section-index">07 / Foundations</span>
            <h2>Education &amp; expertise</h2>
          </div>
          <span class="section-fig">CREDENTIALS · METHODS · STACK</span>
        </div>

        <div class="two-col-panels">
          <div class="glass-panel reveal">
            <h3 class="panel-subtitle">Academic Degrees &amp; Certificates</h3>
            ${EDUCATION_ITEMS.map(
              (ed) => `
              <div class="ledger-row">
                <div class="ledger-main">
                  <strong>${esc(ed.degree)}</strong>
                  <small>${esc(ed.detail)}</small>
                </div>
                <span class="ledger-meta">${esc(ed.period)}</span>
              </div>
            `
            ).join('')}

            <div class="memberships-box">
              <h3 class="panel-subtitle">Professional Memberships</h3>
              <div class="memberships-list">
                ${MEMBERSHIPS.map((m) => `<span class="skill-tag">${esc(m)}</span>`).join('')}
              </div>
            </div>
          </div>

          <div class="glass-panel reveal d1">
            ${SKILL_GROUPS.map(
              (grp, idx) => `
              <h3 class="panel-subtitle ${idx > 0 ? 'spaced' : ''}">${esc(grp.title)}</h3>
              <div class="skill-tags">
                ${grp.tags.map((tag) => `<span class="skill-tag">${esc(tag)}</span>`).join('')}
              </div>
            `
            ).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ 08 CONTACT ═══════════ -->
    <section id="contact" class="band contact-section" data-section="contact">
      <div class="wrap">
        <div class="contact-card reveal">
          <span class="mono-label">Open to Select Advisory, Executive &amp; Research Collaboration</span>
          <h2>Let's build something worth trusting.</h2>
          <a href="mailto:${SITE_META.email}" class="contact-email">
            ${SITE_META.email}
          </a>
          <div class="contact-links">
            <a href="mailto:${SITE_META.email}">Email</a>
            <a href="${SITE_META.phoneHref}">${esc(SITE_META.phone)}</a>
            <a href="${SITE_META.links.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
            <a href="${SITE_META.links.github}" target="_blank" rel="noopener">GitHub ↗</a>
            <a href="${SITE_META.links.writing}" target="_blank" rel="noopener">2.works ↗</a>
            <button type="button" id="btn-contact-copy">Copy Email</button>
            <span>${esc(SITE_META.location)}</span>
          </div>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-inner">
          <span>© ${year} Gareth Roberts, PhD</span>
          <span>Sydney, Australia</span>
        </div>
      </div>
    </footer>
  `;
}
