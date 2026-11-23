export interface MetricFact {
  value: number;
  suffix?: string;
  label: string;
  detail: string;
}

export interface CareerRole {
  id: string;
  track: 'industry' | 'academic';
  trackLabel: string;
  period: string;
  org: string;
  title: string;
  location: string;
  highlight?: string;
  metrics: string[];
  points: string[];
  accent: 'vermilion' | 'phosphor' | 'gold';
  specimenId: 'cortical' | 'eeg' | 'geospatial' | 'eval';
}

export interface EarlierRole {
  org: string;
  role: string;
  period: string;
}

export interface ResearchTheme {
  no: string;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  plateImage: string;
  specimenId: 'cortical' | 'eeg' | 'geospatial' | 'eval';
  accent: 'vermilion' | 'phosphor' | 'gold';
  keywords: string[];
}

export interface InvitedTalk {
  year: string;
  venue: string;
  city?: string;
  kind?: string;
}

export interface Publication {
  id: string;
  category: 'learning' | 'cognition' | 'neuroimaging';
  categoryLabel: string;
  title: string;
  authors: string;
  venue: string;
  volume?: string;
  year: number;
  citations?: number;
  badge: string;
  bibtexKey: string;
}

export interface EssayItem {
  title: string;
  kind: string;
  venue?: string;
  year: number;
  url?: string;
}

export interface OpenSourceSystem {
  name: string;
  tagline: string;
  description: string;
  url: string;
  tags: string[];
  specimenId: 'cortical' | 'eeg' | 'geospatial' | 'eval';
  featured?: boolean;
}

export interface ServiceItem {
  title: string;
  detail?: string;
  meta: string;
}

export interface EducationItem {
  degree: string;
  detail: string;
  period: string;
}

export interface SpecimenMeta {
  id: 'cortical' | 'eeg' | 'geospatial' | 'eval';
  index: string;
  name: string;
  subtitle: string;
  domain: string;
  modelPath: string;
  description: string;
  telemetry: {
    channels: string;
    architecture: string;
    medium: string;
  };
}

export const SITE_META = {
  name: 'Gareth Roberts',
  credentials: 'PhD',
  fullTitle: 'Gareth Roberts, PhD — Cognitive Neuroscience × Applied AI',
  tagline: 'Where brains meet machines, responsibly.',
  location: 'Sydney, Australia',
  coords: '33.8688° S / 151.2093° E',
  email: 'gareth.roberts@ieee.org',
  phone: '+61 499 773 667',
  phoneHref: 'tel:+61499773667',
  links: {
    linkedin: 'https://www.linkedin.com/in/dr-gareth-roberts',
    github: 'https://github.com/dr-gareth-roberts',
    writing: 'https://2.works',
    scholar: 'https://scholar.google.com/scholar?q=%22Gareth+Roberts%22+UWA+OR+%22University+of+Sydney%22+EEG+OR+%22goal+neglect%22',
  },
};

export const SPECIMENS: SpecimenMeta[] = [
  {
    id: 'cortical',
    index: 'MODEL 01',
    name: 'Human Brain',
    subtitle: 'FreeSurfer fsaverage6 Pial Cortex · Cerebellum · Brainstem',
    domain: 'Cognitive Control & Neuroanatomy',
    modelPath: './assets/models/cortical-instrument.glb',
    description:
      'Anatomically exact FreeSurfer fsaverage6 bilateral pial hemispheres paired with co-registered MNI152 cerebellum (AAL3v2), brainstem, thalamus, hippocampus, and corpus callosum tracts — shaded with real sulcal depth and Frontoparietal Control Network activation.',
    telemetry: {
      channels: 'FreeSurfer fsaverage6 (50.8K verts)',
      architecture: 'Pial Cortex · Cerebellum · Stem',
      medium: 'Real Sulcal Depth (sulc / curv)',
    },
  },
  {
    id: 'eeg',
    index: 'MODEL 02',
    name: '10-20 EEG Montage',
    subtitle: '21-Channel Clinical Electrode Array & Amplifier Harness',
    domain: 'Neuroimaging & Electrophysiology Labs',
    modelPath: './assets/models/artifact-eeg-field.glb',
    description:
      'Canonical International 10-20 EEG montage mounted over the cortical surface: machined gold-cup disc sensors, anatomical webbing straps, frontal and posterior channel leads converging into an occipital biomedical amplifier pod.',
    telemetry: {
      channels: '21-Channel International 10-20',
      architecture: 'Fp1–O2 Disc Array + Amp Pod',
      medium: 'USyd & Murdoch EEG Lab Methods',
    },
  },
  {
    id: 'geospatial',
    index: 'MODEL 03',
    name: 'Earth-Observation Satellite',
    subtitle: 'Hyperspectral Orbital Scanner Over Geological Terrain',
    domain: 'Source Localisation · Geospatial Computer Vision',
    modelPath: './assets/models/artifact-geospatial.glb',
    description:
      'Multi-part Earth-observation satellite (Kapton thermal bus, dual solar wing arrays, nadir optical telescope, X-band dish) projecting a spectral swath scan across Western Australian mineral exploration ridges — compressing 6+ weeks of analysis to under 24 hours.',
    telemetry: {
      channels: 'Hyperspectral Satellite Imagery',
      architecture: 'Nadir Optics · Azure / HPC CV',
      medium: 'Tier-1 Mining Exploration Platform',
    },
  },
  {
    id: 'eval',
    index: 'MODEL 04',
    name: 'Enterprise GPU Compute Node',
    subtitle: 'Cutaway 2U Offline LLM & Multi-Agent Inference Blade',
    domain: 'Hyperpriors · Governed Production AI',
    modelPath: './assets/models/artifact-eval-prism.glb',
    description:
      'Industrial cutaway 2U enterprise GPU inference module with dual silicon accelerator packages, CNC-milled finned heatsinks, copper vapor-chamber heatpipes, NVLink interconnects, and QSFP optical ports — built for air-gapped, auditable enterprise AI.',
    telemetry: {
      channels: 'Dual GPU Tensor · NVLink Bus',
      architecture: 'Offline Containerised LLM / RAG',
      medium: 'APRA CPS 234 & CI Eval Harnesses',
    },
  },
];

export const APPROACH_FACTS: MetricFact[] = [
  { value: 8, label: 'h-index', detail: 'Google Scholar' },
  { value: 127, label: 'citations', detail: 'most-cited paper' },
  { value: 12, label: 'invited talks', detail: 'Australia · UK · Europe' },
  { value: 2, label: 'postdoctoral fellowships', detail: 'Sydney · Murdoch' },
];

export const CAREER_ROLES: CareerRole[] = [
  {
    id: 'hyperpriors',
    track: 'industry',
    trackLabel: 'Industry · Founder',
    period: '2024 — Present',
    org: 'Hyperpriors',
    title: 'Founder & Director',
    location: 'Sydney',
    accent: 'vermilion',
    specimenId: 'eval',
    metrics: ['Offline Enterprise LLMs', 'CI-Grade Eval Gates', 'Regulated Advisory'],
    points: [
      'Applied-AI consultancy for regulated enterprises: <strong>containerised offline LLM deployments</strong>, RAG pipelines and reproducible evaluation harnesses.',
      'Built <strong>insideLLMs</strong> — a <code>run → records → report → diff</code> framework that turns model behaviour into CI-grade quality gates.',
      'Workshops, documentation and research translation for internal engineering teams and university partners.',
    ],
  },
  {
    id: 'culture-amp',
    track: 'industry',
    trackLabel: 'Industry',
    period: '2025 — 2026',
    org: 'Culture Amp',
    title: 'Principal AI Specialist',
    location: 'Sydney',
    accent: 'phosphor',
    specimenId: 'cortical',
    metrics: ['6,500 Organisations', '25M Employees', '20+ Languages'],
    points: [
      'Architected <strong>multilingual AI coaching across 20+ languages</strong> on a platform serving <span class="metric-inline">6,500 organisations · 25M employees</span>.',
      'Designed agentic routing, GenAI safety guardrails and <strong>fairness / evaluation frameworks</strong>; selected LangGraph for the deterministic state compliance requires.',
      'Led technical due diligence across agentic frameworks and hyperscalers; mentored junior engineers and HDR interns.',
    ],
  },
  {
    id: 'neos',
    track: 'industry',
    trackLabel: 'Industry · Executive',
    period: '2023 — 2024',
    org: 'NEOS Insurance Group',
    title: 'Head of Artificial Intelligence',
    location: 'Sydney',
    accent: 'gold',
    specimenId: 'eval',
    metrics: ['4.4× Throughput', 'Team of 6', 'APRA CPS 234'],
    points: [
      'Founded the enterprise AI function from greenfield — <strong>recruited, hired and led a team of 6</strong> engineers and data scientists.',
      'Shipped a <strong>multi-agent RAG underwriting system</strong> across structured and unstructured data; <span class="metric-inline">4.4× pre-assessment throughput</span>.',
      'Delivered an AI governance framework aligned to <strong>APRA CPS 234</strong>, with model-risk protocols adopted company-wide.',
    ],
  },
  {
    id: 'source-localisation',
    track: 'industry',
    trackLabel: 'Industry · C-Suite',
    period: '2022 — 2023',
    org: 'Source Localisation',
    title: 'Chief Technology Officer',
    location: 'Sydney',
    accent: 'phosphor',
    specimenId: 'geospatial',
    metrics: ['6+ Weeks → <24h', 'Team of 12', 'Azure / HPC GPU'],
    points: [
      'Built a geospatial <strong>computer-vision platform</strong> over satellite imagery for Tier-1 mining clients; scaled the engineering team to <strong>12</strong>.',
      'Deep-learning pipelines that collapsed exploration target identification from <span class="metric-inline">6+ weeks to under 24 hours</span>.',
      'Architected GPU-accelerated cloud infrastructure (Azure / HPC) for spectral and geological classification.',
    ],
  },
  {
    id: 'usyd',
    track: 'academic',
    trackLabel: 'Academic',
    period: '2016 — 2021',
    org: 'University of Sydney',
    title: 'Postdoctoral Research Fellow & Honorary Fellow',
    location: 'School of Psychology · Brain & Mind Centre · Education',
    accent: 'vermilion',
    specimenId: 'cortical',
    metrics: ['EEG / fMRI / fNIRS', 'Sydney Neuromethods', 'PhD & Honours Supervision'],
    points: [
      'Developmental cognitive-neuroscience research across cognition, learning, executive control and neuroimaging; published in <em>Learning &amp; Instruction</em> and cognitive-science venues.',
      'Designed studies pairing behavioural paradigms with <strong>EEG, fMRI and fNIRS</strong> — including a real-world driving simulator under brain-oxygen manipulation.',
      'Co-founded the <strong>Sydney Neuromethods Group</strong>; supervised and marked third-year, Honours and PhD theses across Psychology and Education.',
    ],
  },
  {
    id: 'murdoch',
    track: 'academic',
    trackLabel: 'Academic',
    period: '2014 — 2016',
    org: 'Murdoch University',
    title: 'Postdoctoral Research Fellow',
    location: 'School of Psychology & Exercise Science · Perth',
    accent: 'phosphor',
    specimenId: 'eeg',
    metrics: ['PROJECT KIDS', 'Built EEG Lab', 'WA Neuroimaging Group'],
    points: [
      'Senior scientist on <strong>PROJECT KIDS</strong>, leading quantitative and neuroimaging methodology for developmental research (incl. Type 1 Diabetes cohorts).',
      'Established a children\'s <strong>EEG / electrophysiology laboratory</strong>; founded the <strong>Western Australia Neuroimaging Methods Group</strong>.',
      'Supervised four Honours projects; collaborations with Princess Margaret Hospital and Telethon Kids Institute.',
    ],
  },
];

export const EARLIER_ROLES: EarlierRole[] = [
  {
    org: 'Woolcock Institute of Medical Research',
    role: 'Senior Data Scientist · fNIRS, sleep & cognition',
    period: '2019–2020',
  },
  {
    org: 'Bloomspace',
    role: 'Head of Data Science · e-commerce analytics',
    period: '2018–2021',
  },
  {
    org: 'Bonsai Tech',
    role: 'Co-Director & Principal Data Scientist · consultancy',
    period: '2008–2021',
  },
  {
    org: 'Applied-research contracts',
    role: 'BrainChip · Comtrac · Bluesana',
    period: '2021–2025',
  },
];

export const RESEARCH_THEMES: ResearchTheme[] = [
  {
    no: '01',
    id: 'cognitive-control',
    title: 'Cognitive control & task instructions',
    subtitle: 'Prefrontal & frontoparietal instruction-to-action',
    description:
      'How the prefrontal and frontoparietal systems convert verbal instructions into abstract motor plans — goal maintenance, goal neglect, and the role of working memory.',
    plateImage: './assets/images/plate-cortical-control.jpg',
    specimenId: 'cortical',
    accent: 'vermilion',
    keywords: ['Goal Neglect', 'Working Memory', 'Task Sets', 'Prefrontal Cortex'],
  },
  {
    no: '02',
    id: 'learning-sciences',
    title: 'Learning sciences & far transfer',
    subtitle: 'Schema abstraction in complex systems',
    description:
      'Productive failure, analogical comparison and far transfer; learning about complex systems. Highly-cited peer-reviewed work published in Learning & Instruction.',
    plateImage: './assets/images/plate-learning-sciences.jpg',
    specimenId: 'geospatial',
    accent: 'gold',
    keywords: ['Productive Failure', 'Analogical Transfer', 'Complex Systems', '127 Citations'],
  },
  {
    no: '03',
    id: 'neuroimaging',
    title: 'Neuroimaging & electrophysiology',
    subtitle: 'EEG · fMRI · fNIRS methodology',
    description:
      'Resting-state connectivity, time-frequency dynamics and measure-projection analysis. Founded two neuromethods groups and built laboratory capability from scratch.',
    plateImage: './assets/images/plate-neuroimaging-waves.jpg',
    specimenId: 'eeg',
    accent: 'phosphor',
    keywords: ['Measure-Projection', 'Resting-State EEG', 'fNIRS', 'Time-Frequency'],
  },
  {
    no: '04',
    id: 'human-ai',
    title: 'Human & artificial intelligence',
    subtitle: 'Governed, auditable transformer reliability',
    description:
      'Bringing the cognitive science of attention, memory and control to bear on how language models reason, are evaluated under adversarial stress, and stay reliable in regulated enterprise.',
    plateImage: './assets/images/plate-human-ai.jpg',
    specimenId: 'eval',
    accent: 'vermilion',
    keywords: ['AI Safety', 'LLM Psychometrics', 'Red-Teaming', 'Governance'],
  },
];

export const INVITED_TALKS: InvitedTalk[] = [
  { year: '2019', venue: 'Woolcock Institute of Medical Research', city: 'Sydney', kind: 'Invited lecture' },
  { year: '2018', venue: 'Learning, Cognition & Brain Sciences Unit, Univ. of Sydney', kind: 'Invited lecture' },
  { year: '2016', venue: 'Int. Conference on Cognitive Neuroscience', city: 'Amsterdam' },
  { year: '2016', venue: 'Int. Society of Cognitive Science', city: 'London' },
  { year: '2016', venue: 'Australasian Experimental Psychology Conf.', city: 'Melbourne' },
  { year: '2015', venue: 'Australasian Experimental Psychology Conf.', city: 'Shoal Bay' },
  { year: '2014', venue: 'Dept. of Psychology, Univ. of Cambridge', kind: 'Visiting scientist' },
  { year: '2013', venue: 'Translational Neuromodeling Unit, ETH Zurich', kind: 'Visiting scientist' },
  { year: '2012', venue: 'Int. Conference on Cognitive Neuroscience', city: 'Brisbane', kind: 'Poster' },
  { year: '2010', venue: 'MRC Cognition & Brain Sciences Unit, Cambridge', kind: 'Visiting scientist' },
  { year: '2010', venue: 'European Society of Neuropsychology', city: 'Basel' },
  { year: '2010', venue: 'Int. Conference on Cognitive Neuroscience', city: 'Majorca', kind: 'Poster' },
];

export const PUBLICATIONS: Publication[] = [
  {
    id: 'jacobson-2017',
    category: 'learning',
    categoryLabel: 'Learning Sciences',
    title: 'Designs for learning about climate change as a complex system',
    authors: 'Jacobson, M. J., Markauskaite, L., Portolese, A., Kapur, M., Lai, P. K., & Roberts, G.',
    venue: 'Learning and Instruction',
    volume: '52, 1–14',
    year: 2017,
    citations: 127,
    badge: '127 cited',
    bibtexKey: 'jacobson2017climate',
  },
  {
    id: 'jacobson-2020',
    category: 'learning',
    categoryLabel: 'Learning Sciences',
    title: 'Schema abstraction with productive failure and analogical comparison: learning designs for far across-domain transfer',
    authors: 'Jacobson, M. J., Goldwater, M., Markauskaite, L., Lai, P. K., Kapur, M., Hilton, C., & Roberts, G.',
    venue: 'Learning and Instruction',
    volume: '65, 101222',
    year: 2020,
    citations: 39,
    badge: '39 cited',
    bibtexKey: 'jacobson2020schema',
  },
  {
    id: 'roberts-2017-cogsci',
    category: 'learning',
    categoryLabel: 'Learning Sciences',
    title: 'From concrete examples to abstract relations: a model-based cognitive-neuroscience approach to how people learn new categories',
    authors: 'Roberts, G., Goldwater, M., Livesey, E., Giron, J., & Davis, T.',
    venue: 'Proceedings of the Cognitive Science Society',
    volume: '39',
    year: 2017,
    badge: 'Proceedings',
    bibtexKey: 'roberts2017categories',
  },
  {
    id: 'brydges-2017',
    category: 'cognition',
    categoryLabel: 'Cognition & Development',
    title: 'Working memory — not processing speed — mediates fluid-intelligence deficits associated with ADHD symptoms',
    authors: 'Brydges, C. R., Ozolnieks, K. L., & Roberts, G.',
    venue: 'Journal of Neuropsychology',
    volume: '11(3), 362–377',
    year: 2017,
    citations: 36,
    badge: '36 cited',
    bibtexKey: 'brydges2017working',
  },
  {
    id: 'brydges-2018',
    category: 'cognition',
    categoryLabel: 'Cognition & Development',
    title: 'Working memory and intraindividual variability mediate fluid-intelligence deficits associated with ADHD symptoms',
    authors: 'Brydges, C. R., Ozolnieks, K. L., & Roberts, G.',
    venue: 'Journal of Attention Disorders',
    year: 2018,
    badge: 'Article',
    bibtexKey: 'brydges2018variability',
  },
  {
    id: 'roberts-2014-jecp',
    category: 'cognition',
    categoryLabel: 'Cognition & Development',
    title: 'Task-structure complexity and goal neglect in typically developing children',
    authors: 'Roberts, G., & Anderson, M.',
    venue: 'Journal of Experimental Child Psychology',
    volume: '120, 59–72',
    year: 2014,
    citations: 15,
    badge: '15 cited',
    bibtexKey: 'roberts2014goalneglect',
  },
  {
    id: 'roberts-2014-cabn',
    category: 'cognition',
    categoryLabel: 'Cognition & Development',
    title: 'Building tasks from verbal instructions: an EEG study on practice-trial exposure and task-structure complexity during novel sequences of behaviour',
    authors: 'Roberts, G., Jones, T. W., Davis, E. A., Ly, T. T., & Anderson, M.',
    venue: 'Cognitive, Affective, & Behavioral Neuroscience',
    volume: '14(4), 1356–1374',
    year: 2014,
    badge: 'Article',
    bibtexKey: 'roberts2014verbal',
  },
  {
    id: 'albrecht-2016',
    category: 'neuroimaging',
    categoryLabel: 'Neuroimaging & EEG',
    title: 'The effects of dexamphetamine on the resting-state electroencephalogram and functional connectivity',
    authors: 'Albrecht, M. A., Roberts, G., Price, G., Lee, J., Iyyalol, R., & Martin-Iverson, M. T.',
    venue: 'Human Brain Mapping',
    volume: '37(2), 570–588',
    year: 2016,
    citations: 25,
    badge: '25 cited',
    bibtexKey: 'albrecht2016dexamphetamine',
  },
  {
    id: 'roberts-2015-t1d',
    category: 'neuroimaging',
    categoryLabel: 'Neuroimaging & EEG',
    title: 'The effects of early-onset Type 1 diabetes on the young adult brain: a voxel-based morphometry study',
    authors: 'Roberts, G., Anderson, M., Jones, T., Davis, E., & Ly, T.',
    venue: 'Frontiers in Human Neuroscience',
    year: 2015,
    badge: 'Article',
    bibtexKey: 'roberts2015diabetes',
  },
  {
    id: 'roberts-2014-acc',
    category: 'neuroimaging',
    categoryLabel: 'Neuroimaging & EEG',
    title: 'Maturation of neural oscillations in anterior cingulate cortex: an EEG study using measure-projection analysis',
    authors: 'Roberts, G., Brydges, C. R., Reid, C., & Anderson, M.',
    venue: 'Frontiers in Human Neuroscience',
    year: 2014,
    badge: 'Article',
    bibtexKey: 'roberts2014oscillations',
  },
  {
    id: 'almabruk-2015',
    category: 'neuroimaging',
    categoryLabel: 'Neuroimaging & EEG',
    title: 'EEG coherence-based analysis of response-conflict processes in 7- and 9-year-old children',
    authors: 'Almabruk, T., Iyer, K. K., Tan, T., Roberts, G., & Anderson, M.',
    venue: 'IEEE EMBC / IEEE DSP',
    year: 2015,
    citations: 7,
    badge: '7 cited',
    bibtexKey: 'almabruk2015coherence',
  },
];

export const ESSAYS: EssayItem[] = [
  { title: 'Rethinking Intelligence: Beyond AI Scaling Limits', kind: 'Essay', venue: '2.works', year: 2024, url: 'https://2.works' },
  { title: 'The Hidden Psychology of LLMs: Mental Blind Spots & Unexpected Behaviours', kind: 'Essay', venue: '2.works', year: 2024, url: 'https://2.works' },
  { title: 'Understanding LLM Vulnerabilities Through Experimental Psychology', kind: 'Essay', venue: '2.works', year: 2024, url: 'https://2.works' },
  { title: 'Principles Underlying Prompt-Injection Vulnerabilities in LLMs', kind: 'Working paper', year: 2024 },
  { title: 'The AI Whisperers: Inside the DAN Attack That Transformed AI Safety', kind: 'Essay', year: 2025 },
  { title: 'Red-Teaming Large Language Models: A Critical Analysis of Security-Testing Methods', kind: 'Working paper', year: 2025 },
];

export const OPEN_SOURCE_SYSTEMS: OpenSourceSystem[] = [
  {
    name: 'insideLLMs',
    tagline: 'Deterministic Cross-Model Behavioural Evaluation',
    description:
      'A run → records → report → diff spine producing canonical, reproducible evaluation artefacts that turn LLM behaviour into CI-grade quality gates.',
    url: 'https://github.com/dr-gareth-roberts/insideLLMs',
    tags: ['Python', 'CLI', 'CI Quality Gates', 'Deterministic Eval'],
    specimenId: 'eval',
    featured: true,
  },
  {
    name: 'adversarial-debate',
    tagline: 'Multi-Agent Red-Teaming & Audit Ledger',
    description:
      'A multi-agent AI security-testing framework: attacker / defender debate panels consolidated by an arbiter into an immutable audit ledger for red-team coverage.',
    url: 'https://github.com/dr-gareth-roberts/adversarial-debate',
    tags: ['Multi-Agent', 'AI Security', 'Red-Teaming', 'Audit Ledger'],
    specimenId: 'eval',
    featured: true,
  },
  {
    name: 'context-engineering',
    tagline: 'Context Compiler, Immune System & Drift Detection',
    description:
      'TypeScript + Python toolkit to pack, cache, debug, red-team and orchestrate LLM context windows with Council of Experts and drift telemetry.',
    url: 'https://github.com/dr-gareth-roberts/context-engineering',
    tags: ['TypeScript', 'Python', 'Context Compiler', 'Drift'],
    specimenId: 'cortical',
  },
  {
    name: 'dendritic-coincidence',
    tagline: 'Interactive CA1 Pyramidal Neuron Simulator',
    description:
      'Browser-native biophysical simulator of dendritic coincidence detection (Polsky 2004 / Poirazi 2001) bridging computational neuroscience and web graphics.',
    url: 'https://github.com/dr-gareth-roberts/dendritic-coincidence',
    tags: ['Computational Neuro', 'Biophysics', 'Web Interactive'],
    specimenId: 'eeg',
  },
  {
    name: 'mineral-prospectivity-mapper',
    tagline: 'Statistical Mineral Prospectivity Platform (WA)',
    description:
      'Enterprise-grade geospatial prospectivity platform featuring provenance, uncertainty quantification, 2.5D depth, ML explainability and sensitivity analysis.',
    url: 'https://github.com/dr-gareth-roberts/mineral-prospectivity-mapper',
    tags: ['Geospatial ML', 'Uncertainty', 'QGIS', 'Explainability'],
    specimenId: 'geospatial',
  },
  {
    name: 'harness-engineering',
    tagline: 'Composable Primitives for Robust Agent Harnesses',
    description:
      'Open-source toolbox providing structured, testable engineering primitives for deterministic LLM and autonomous agent orchestration.',
    url: 'https://github.com/dr-gareth-roberts/harness-engineering',
    tags: ['Agent Harnesses', 'Deterministic State', 'Governance'],
    specimenId: 'eval',
  },
];

export const TEACHING_ITEMS: ServiceItem[] = [
  { title: 'Advanced statistics & research methods', detail: 'UWA (PSY301/302) & USyd graduate', meta: '2012–2021' },
  { title: 'Cognitive & developmental psychology', detail: 'Murdoch guest lectures', meta: '2014' },
  { title: 'Honours supervision — four projects to completion', detail: 'Murdoch University', meta: '2014–16' },
  { title: 'Supervised & marked Honours and PhD theses', detail: 'Psychology & Education, USyd', meta: '2016–21' },
];

export const ACADEMIC_SERVICE: ServiceItem[] = [
  { title: 'Co-founded the Sydney Neuromethods Group', meta: 'USyd' },
  { title: 'Founded the WA Neuroimaging Methods Group', meta: 'Murdoch' },
  { title: 'Established fNIRS / EEG laboratory capability', meta: 'USyd · Murdoch' },
];

export const GRANTS_ITEMS: ServiceItem[] = [
  { title: 'Australian Postgraduate Award', detail: 'Competitive PhD scholarship', meta: '2009–2012' },
  { title: 'APA six-month top-up scholarship', meta: '2012–2013' },
  { title: 'UWA Postgraduate Completion Scholarship', meta: '2013' },
];

export const AWARDS_ITEMS: ServiceItem[] = [
  { title: 'Teaching awards ×2', detail: 'Third-year research-methods units — UWA', meta: '2010–2011' },
  { title: 'PhD examined in the highest international categories', meta: 'UWA' },
  { title: 'BA Psychology — First Class Honours', meta: 'UWA' },
  { title: 'Speaker, International AI Conference; AI-ethics panellist, CIO Top100', meta: '2023' },
];

export const EDUCATION_ITEMS: EducationItem[] = [
  {
    degree: 'PhD, Cognitive Neuroscience & Artificial Intelligence',
    detail: 'University of Western Australia · incl. visiting research, Univ. of Cambridge',
    period: '2009–2014',
  },
  {
    degree: 'BA (Honours), Psychology — First Class',
    detail: 'University of Western Australia',
    period: '2005–2009',
  },
  {
    degree: 'MBA',
    detail: 'ThePower Business School',
    period: '2019–2020',
  },
  {
    degree: 'Executive & Regulatory Certificates',
    detail: 'Financial Markets (Yale) · Quantitative Modeling (Wharton) · EU AI Act (DataCamp)',
    period: 'Ongoing',
  },
];

export const MEMBERSHIPS = [
  'IEEE (& IEEE Brain, EMBS)',
  'ACM',
  'AAAI',
  'AAAS',
  'ACS',
  'Linux Foundation',
  'OpenJS Foundation',
];

export const SKILL_GROUPS = [
  {
    title: 'Research & Neuroimaging',
    tags: [
      'EEG / fMRI / fNIRS',
      'SPM',
      'FreeSurfer',
      'Bayesian inference',
      'Causal inference',
      'Psychometrics',
      'Experimental design',
      'Time-series',
      'Multivariate analysis',
    ],
  },
  {
    title: 'AI & Production Engineering',
    tags: [
      'PyTorch',
      'TensorFlow',
      'LangChain',
      'LangGraph',
      'CrewAI',
      'RAG',
      'RLHF',
      'Multi-agent',
      'AWS · GCP · Azure',
      'Kubernetes',
      'Docker',
      'FastAPI',
      'Vector DBs',
    ],
  },
  {
    title: 'Languages',
    tags: ['Python', 'R', 'MATLAB', 'SQL', 'JavaScript / TypeScript'],
  },
];

export function formatBibtex(pub: Publication): string {
  const entryType = pub.badge === 'Proceedings' ? 'inproceedings' : 'article';
  const venueField = pub.badge === 'Proceedings' ? 'booktitle' : 'journal';
  return [
    `@${entryType}{${pub.bibtexKey},`,
    `  author  = {${pub.authors}},`,
    `  title   = {${pub.title}},`,
    `  ${venueField} = {${pub.venue}},`,
    pub.volume ? `  pages   = {${pub.volume}},` : null,
    `  year    = {${pub.year}}`,
    `}`,
  ]
    .filter(Boolean)
    .join('\n');
}
