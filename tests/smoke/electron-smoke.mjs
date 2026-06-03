import { _electron as electron } from '@playwright/test';
import assert from 'node:assert/strict';

const app = await electron.launch({ args: ['.'] });

try {
  const window = await app.firstWindow();
  await window.waitForSelector('#game-root[data-screen="first-playable"]', { timeout: 15000 });
  await window.waitForSelector('#game-root canvas', { timeout: 15000 });

  const title = await window.locator('#game-root').getAttribute('data-title');
  assert.equal(title, 'Thunderbolt Fighter');

  const windowTitle = await window.title();
  assert.equal(windowTitle, 'Thunderbolt Fighter');
} finally {
  await app.close();
}
