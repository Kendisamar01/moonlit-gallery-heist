import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repository = fileURLToPath(new URL('.', import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameSource = join(repository, 'game');
const screenshotSource = join(repository, 'screenshots');

if (!existsSync(gameSource) || !existsSync(screenshotSource)) {
  throw new Error('Both game/ and screenshots/ must exist beside main.ts');
}

mkdirSync(destination, { recursive: true });
for (const folderName of ['game', 'screenshots']) {
  rmSync(join(destination, folderName), { recursive: true, force: true });
}
cpSync(gameSource, join(destination, 'game'), { recursive: true });
cpSync(screenshotSource, join(destination, 'screenshots'), { recursive: true });

const dossier = buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(destination, 'dossier.json'), dossier);
console.log(`Handed in ${join(destination, 'game')}, ${join(destination, 'screenshots')} and a ${dossier.length}-byte dossier`);
