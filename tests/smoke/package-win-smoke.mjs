import path from 'node:path';

process.env.THUNDERBOLT_FIGHTER_EXECUTABLE = path.join(
  'release',
  'Thunderbolt Fighter-win32-x64',
  'Thunderbolt Fighter.exe'
);

await import('./electron-smoke.mjs');
