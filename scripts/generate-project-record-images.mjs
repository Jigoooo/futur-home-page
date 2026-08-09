import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const outputDir = join(process.cwd(), 'public', 'landing', 'project-records');
const forceFallback = process.argv.includes('--fallback');

const records = [
  {
    slug: 'web-platform',
    accent: '#316cff',
    soft: '#edf4ff',
    prompt:
      'A polished anonymous SaaS web platform dashboard UI screenshot, reservation and payment operations, no real brand names, no readable customer data, clean Korean startup landing visual, white and navy interface, blue accent, realistic product screen, 1536x1024.',
    layout: 'dashboard',
  },
  {
    slug: 'mobile-workflow',
    accent: '#16a085',
    soft: '#eafaf5',
    prompt:
      'A polished anonymous mobile field-work app product screen, photo upload, barcode scan, checklist workflow and admin status panel, no real brand names, no readable customer data, clean professional UI, teal accent, realistic product screen, 1536x1024.',
    layout: 'mobile',
  },
  {
    slug: 'business-system',
    accent: '#7c5cff',
    soft: '#f0edff',
    prompt:
      'A polished anonymous internal business operations system UI screenshot, request approval workflow, role-based status tracking, audit log, no real brand names, no readable customer data, clean professional UI, violet accent, realistic product screen, 1536x1024.',
    layout: 'system',
  },
  {
    slug: 'integration-automation',
    accent: '#ff7a45',
    soft: '#fff2eb',
    prompt:
      'A polished anonymous API integration automation monitoring UI screenshot, external service connections, retry queue, alert log, operational status board, no real brand names, no readable customer data, clean professional UI, orange accent, realistic product screen, 1536x1024.',
    layout: 'automation',
  },
];

mkdirSync(outputDir, { recursive: true });

if (process.env.OPENAI_API_KEY && !forceFallback) {
  await generateWithOpenAI();
} else {
  generateFallbacks();
}

async function generateWithOpenAI() {
  for (const record of records) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: record.prompt,
        size: '1536x1024',
        quality: 'medium',
        output_format: 'webp',
        output_compression: 70,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`gpt-image-2 generation failed for ${record.slug}: ${errorBody}`);
    }

    const payload = await response.json();
    const imageBase64 = payload.data?.[0]?.b64_json;
    if (!imageBase64) {
      throw new Error(`gpt-image-2 response did not include b64_json for ${record.slug}`);
    }

    writeFileSync(join(outputDir, `${record.slug}.webp`), Buffer.from(imageBase64, 'base64'));
  }
}

function generateFallbacks() {
  const tempDir = mkdtempSync(join(tmpdir(), 'project-records-'));

  try {
    for (const record of records) {
      const svgPath = join(tempDir, `${record.slug}.svg`);
      const webpPath = join(outputDir, `${record.slug}.webp`);
      writeFileSync(svgPath, renderSvg(record));
      execFileSync('magick', [svgPath, '-quality', '82', webpPath], { stdio: 'inherit' });
    }
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
}

function renderSvg(record) {
  const scene = {
    dashboard: renderDashboard(record),
    mobile: renderMobile(record),
    system: renderSystem(record),
    automation: renderAutomation(record),
  }[record.layout];

  return `
<svg width="1536" height="1024" viewBox="0 0 1536 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1536" y2="1024" gradientUnits="userSpaceOnUse">
      <stop stop-color="${record.soft}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="34" stdDeviation="34" flood-color="#233b69" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="1536" height="1024" fill="url(#bg)"/>
  <circle cx="1324" cy="128" r="220" fill="${record.accent}" opacity="0.10"/>
  <circle cx="172" cy="908" r="280" fill="${record.accent}" opacity="0.08"/>
  <rect x="108" y="110" width="1320" height="804" rx="52" fill="#ffffff" stroke="#dfe8f6" stroke-width="3" filter="url(#shadow)"/>
  <rect x="108" y="110" width="1320" height="86" rx="52" fill="#f8fbff"/>
  <circle cx="172" cy="154" r="13" fill="#8fafef"/>
  <circle cx="214" cy="154" r="13" fill="#cfdcf0"/>
  <circle cx="256" cy="154" r="13" fill="#dce6f4"/>
  <rect x="1210" y="139" width="122" height="28" rx="14" fill="${record.accent}" opacity="0.92"/>
  <rect x="160" y="248" width="214" height="590" rx="30" fill="#f5f8fd" stroke="#e1e8f4" stroke-width="2"/>
  <rect x="196" y="294" width="128" height="18" rx="9" fill="#13234d"/>
  <rect x="196" y="354" width="130" height="22" rx="11" fill="${record.accent}" opacity="0.9"/>
  <rect x="196" y="410" width="118" height="18" rx="9" fill="#c9d7ee"/>
  <rect x="196" y="464" width="142" height="18" rx="9" fill="#c9d7ee"/>
  <rect x="196" y="518" width="106" height="18" rx="9" fill="#c9d7ee"/>
  <rect x="196" y="720" width="126" height="58" rx="18" fill="${record.accent}" opacity="0.14"/>
  ${scene}
  <rect x="160" y="934" width="360" height="18" rx="9" fill="#c6d3e8"/>
</svg>`;
}

function renderDashboard(record) {
  return `
  <rect x="430" y="250" width="454" height="250" rx="30" fill="${record.soft}" stroke="#dfe8f6" stroke-width="2"/>
  <path d="M478 430 C552 348 614 388 678 334 C746 276 784 330 836 300" stroke="${record.accent}" stroke-width="16" stroke-linecap="round"/>
  <rect x="926" y="250" width="374" height="250" rx="30" fill="#ffffff" stroke="#dfe8f6" stroke-width="2"/>
  <rect x="974" y="302" width="174" height="22" rx="11" fill="#13234d"/>
  <rect x="974" y="362" width="250" height="22" rx="11" fill="#cad8ee"/>
  <rect x="974" y="414" width="210" height="22" rx="11" fill="#cad8ee"/>
  <rect x="430" y="548" width="870" height="244" rx="30" fill="#ffffff" stroke="#dfe8f6" stroke-width="2"/>
  <rect x="484" y="604" width="230" height="28" rx="14" fill="#13234d"/>
  <rect x="484" y="674" width="748" height="20" rx="10" fill="#dce7f5"/>
  <rect x="484" y="730" width="610" height="20" rx="10" fill="#dce7f5"/>
  <rect x="1128" y="594" width="116" height="116" rx="28" fill="${record.accent}" opacity="0.18"/>`;
}

function renderMobile(record) {
  return `
  <rect x="466" y="238" width="302" height="604" rx="58" fill="#13234d"/>
  <rect x="492" y="286" width="250" height="508" rx="36" fill="#ffffff"/>
  <rect x="526" y="328" width="136" height="22" rx="11" fill="${record.accent}"/>
  <rect x="526" y="388" width="182" height="142" rx="30" fill="${record.soft}"/>
  <rect x="526" y="566" width="184" height="24" rx="12" fill="#d4e1f4"/>
  <rect x="526" y="622" width="150" height="24" rx="12" fill="#d4e1f4"/>
  <rect x="526" y="696" width="182" height="58" rx="22" fill="${record.accent}" opacity="0.9"/>
  <rect x="834" y="250" width="466" height="250" rx="30" fill="#ffffff" stroke="#dfe8f6" stroke-width="2"/>
  <rect x="884" y="304" width="186" height="22" rx="11" fill="#13234d"/>
  <rect x="884" y="366" width="336" height="18" rx="9" fill="#cad8ee"/>
  <rect x="884" y="416" width="260" height="18" rx="9" fill="#cad8ee"/>
  <rect x="834" y="548" width="466" height="244" rx="30" fill="${record.soft}" stroke="#dfe8f6" stroke-width="2"/>
  <rect x="884" y="604" width="340" height="34" rx="17" fill="#ffffff"/>
  <rect x="884" y="672" width="286" height="34" rx="17" fill="#ffffff"/>
  <circle cx="1228" cy="676" r="44" fill="${record.accent}" opacity="0.82"/>`;
}

function renderSystem(record) {
  return `
  <rect x="430" y="250" width="870" height="112" rx="28" fill="${record.soft}" stroke="#dfe8f6" stroke-width="2"/>
  <rect x="480" y="296" width="236" height="22" rx="11" fill="#13234d"/>
  <rect x="1048" y="286" width="160" height="42" rx="21" fill="${record.accent}" opacity="0.88"/>
  <rect x="430" y="416" width="258" height="376" rx="30" fill="#ffffff" stroke="#dfe8f6" stroke-width="2"/>
  <rect x="480" y="470" width="128" height="22" rx="11" fill="#13234d"/>
  <rect x="480" y="544" width="154" height="80" rx="24" fill="${record.soft}"/>
  <rect x="480" y="660" width="154" height="80" rx="24" fill="#f5f8fd"/>
  <rect x="738" y="416" width="562" height="376" rx="30" fill="#ffffff" stroke="#dfe8f6" stroke-width="2"/>
  <rect x="790" y="478" width="424" height="20" rx="10" fill="#d4e1f4"/>
  <rect x="790" y="556" width="362" height="20" rx="10" fill="#d4e1f4"/>
  <rect x="790" y="634" width="454" height="20" rx="10" fill="#d4e1f4"/>
  <rect x="790" y="706" width="188" height="42" rx="21" fill="${record.accent}" opacity="0.18"/>`;
}

function renderAutomation(record) {
  return `
  <rect x="430" y="250" width="870" height="250" rx="30" fill="#ffffff" stroke="#dfe8f6" stroke-width="2"/>
  <rect x="482" y="304" width="206" height="22" rx="11" fill="#13234d"/>
  <circle cx="538" cy="410" r="48" fill="${record.accent}" opacity="0.82"/>
  <circle cx="720" cy="410" r="48" fill="${record.soft}" stroke="${record.accent}" stroke-width="8"/>
  <circle cx="902" cy="410" r="48" fill="${record.soft}" stroke="${record.accent}" stroke-width="8"/>
  <circle cx="1084" cy="410" r="48" fill="${record.accent}" opacity="0.82"/>
  <path d="M586 410 H672 M768 410 H854 M950 410 H1036" stroke="#cbd8ee" stroke-width="12" stroke-linecap="round"/>
  <rect x="430" y="548" width="418" height="244" rx="30" fill="${record.soft}" stroke="#dfe8f6" stroke-width="2"/>
  <rect x="482" y="604" width="190" height="24" rx="12" fill="#13234d"/>
  <rect x="482" y="674" width="284" height="18" rx="9" fill="#ffffff"/>
  <rect x="482" y="728" width="236" height="18" rx="9" fill="#ffffff"/>
  <rect x="900" y="548" width="400" height="244" rx="30" fill="#ffffff" stroke="#dfe8f6" stroke-width="2"/>
  <rect x="952" y="604" width="174" height="24" rx="12" fill="#13234d"/>
  <rect x="952" y="672" width="260" height="20" rx="10" fill="#d4e1f4"/>
  <rect x="952" y="728" width="216" height="20" rx="10" fill="#d4e1f4"/>`;
}
