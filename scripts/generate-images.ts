// Generates kid-friendly illustrations via OpenAI gpt-image-1 and saves them
// into public/images/. Run with: bun scripts/generate-images.ts
// Requires env var OPENAI_API_KEY.

import { writeFile, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const outDir = join(import.meta.dir, '..', 'public', 'images');
await mkdir(outDir, { recursive: true });

type Job = {
  file: string;
  prompt: string;
  size?: '1024x1024' | '1024x1536' | '1536x1024';
  quality?: 'low' | 'medium' | 'high';
};

const baseStyle =
  'flat vector illustration, soft pastel colors, friendly kid-book style, ' +
  'pink and indigo palette, clean white background, no text, no letters, no words, ' +
  'rounded shapes, cute and warm, suitable for an 11-year-old girl';

const jobs: Job[] = [
  {
    file: 'mascot.png',
    prompt: `A cheerful cartoon owl mascot wearing a graduation cap, holding a pencil and a book, smiling warmly, big sparkling eyes. ${baseStyle}`,
  },
  {
    file: 'mascot-cheer.png',
    prompt: `Same cartoon owl mascot with graduation cap, jumping with joy, arms in the air, confetti around. ${baseStyle}`,
  },
  {
    file: 'mascot-think.png',
    prompt: `Same cartoon owl mascot with graduation cap, thinking with finger on chin, friendly puzzled expression. ${baseStyle}`,
  },
  {
    file: 'badge-streak.png',
    prompt: `A circular achievement badge with a glowing orange flame in the middle, gold rim, sparkles. ${baseStyle}`,
  },
  {
    file: 'badge-math.png',
    prompt: `A circular achievement badge with a friendly purple math wizard hat and a plus, minus, times symbols floating around. ${baseStyle}`,
  },
  {
    file: 'badge-slovak.png',
    prompt: `A circular achievement badge with an open pink book and a feather quill, sparkles around. ${baseStyle}`,
  },
  {
    file: 'badge-perfect.png',
    prompt: `A circular gold trophy badge with a star in the middle, ribbons on the sides, celebratory feel. ${baseStyle}`,
  },
  {
    file: 'badge-rookie.png',
    prompt: `A circular achievement badge with a small green sprout / seedling, pastel beige rim. ${baseStyle}`,
  },
  {
    file: 'badge-marathon.png',
    prompt: `A circular achievement badge with a running shoe and motion lines, energetic but cute. ${baseStyle}`,
  },
  {
    file: 'level-up.png',
    prompt: `A bright "level up" scene: a glowing star bursting upward from a cloud, sparkles, celebratory ribbons, no text. ${baseStyle}`,
  },
];

async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function generate(job: Job) {
  const target = join(outDir, job.file);
  if (await exists(target)) {
    console.log(`✓ skip ${job.file} (exists)`);
    return;
  }
  console.log(`→ generating ${job.file}…`);
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-2-2026-04-21',
      prompt: job.prompt,
      size: job.size ?? '1024x1024',
      quality: job.quality ?? 'medium',
      n: 1,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error(`✗ ${job.file}: ${res.status} ${t.slice(0, 300)}`);
    return;
  }
  const data = (await res.json()) as { data: { b64_json: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    console.error(`✗ ${job.file}: no b64_json in response`);
    return;
  }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(b64, 'base64'));
  console.log(`✓ wrote ${job.file}`);
}

// Run sequentially to be gentle on rate limits
for (const j of jobs) {
  await generate(j);
}
console.log('done.');
