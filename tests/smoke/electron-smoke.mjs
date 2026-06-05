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
  const canvasBox = await window.locator('#game-root canvas').boundingBox();
  assert.ok(canvasBox);

  const clickGamePoint = (x, y) => window.mouse.click(
    canvasBox.x + canvasBox.width * (x / 1280),
    canvasBox.y + canvasBox.height * (y / 720)
  );

  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '1');

  await clickGamePoint(320, 354);
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '3');

  await clickGamePoint(436, 354);
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '5');

  await clickGamePoint(204, 354);
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '1');

  assert.equal(await gameRoot.getAttribute('data-difficulty'), 'normal');

  await clickGamePoint(204, 494);
  assert.equal(await gameRoot.getAttribute('data-difficulty'), 'simple');

  await clickGamePoint(436, 494);
  assert.equal(await gameRoot.getAttribute('data-difficulty'), 'hard');

  await clickGamePoint(320, 494);
  assert.equal(await gameRoot.getAttribute('data-difficulty'), 'normal');

  const startRunWithSelectedOptions = async () => {
    await clickGamePoint(436, 354);
    await clickGamePoint(436, 494);
    await clickGamePoint(320, 616);
  };

  await startRunWithSelectedOptions();

  await window.waitForSelector('#game-root[data-screen="gameplay"]', { timeout: 15000 });
  assert.equal(await gameRoot.getAttribute('data-screen'), 'gameplay');
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '5');
  assert.equal(await gameRoot.getAttribute('data-difficulty'), 'hard');

  const windowTitle = await window.title();
  assert.equal(windowTitle, 'Thunderbolt Fighter');
} finally {
  await app.close();
}
