import { _electron as electron } from '@playwright/test';
import assert from 'node:assert/strict';

const app = await electron.launch({ args: ['.'] });

try {
  const window = await app.firstWindow();
  await window.waitForSelector('#game-root[data-screen="main-menu"]', { timeout: 15000 });
  await window.waitForSelector('#game-root canvas', { timeout: 15000 });

  const title = await window.locator('#game-root').getAttribute('data-title');
  assert.equal(title, 'Thunderbolt Fighter');

  const gameRoot = window.locator('#game-root');
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '1');

  await window.mouse.click(640, 468);
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '3');

  await window.mouse.click(784, 468);
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '5');

  await window.mouse.click(496, 468);
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '1');

  const windowTitle = await window.title();
  assert.equal(windowTitle, 'Thunderbolt Fighter');
} finally {
  await app.close();
}
