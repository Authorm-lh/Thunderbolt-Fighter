import { _electron as electron } from '@playwright/test';
import assert from 'node:assert/strict';

const app = await electron.launch({ args: ['.'] });

try {
  const window = await app.firstWindow();
  await window.waitForSelector('#game-root canvas', { timeout: 15000 });

  const gameRoot = window.locator('#game-root');
  let canvasBox = await window.locator('#game-root canvas').boundingBox();
  assert.ok(canvasBox);

  const clickGamePoint = (x, y) => window.mouse.click(
    canvasBox.x + canvasBox.width * (x / 1280),
    canvasBox.y + canvasBox.height * (y / 720)
  );
  const refreshCanvasBox = async () => {
    canvasBox = await window.locator('#game-root canvas').boundingBox();
    assert.ok(canvasBox);
  };

  await window.evaluate(() => {
    localStorage.clear();
    location.reload();
  });
  await window.waitForSelector('#game-root canvas', { timeout: 15000 });
  await refreshCanvasBox();
  await window.waitForSelector('#game-root[data-screen="tutorial"]', { timeout: 15000 });
  assert.match(await gameRoot.getAttribute('data-tutorial-controls'), /Arrow keys|WASD/);
  assert.match(await gameRoot.getAttribute('data-tutorial-goal'), /score/i);
  await clickGamePoint(640, 506);
  assert.match(
    await window.evaluate(() => localStorage.getItem('thunderbolt-fighter:tutorial')),
    /"seen":true/
  );

  await window.waitForSelector('#game-root[data-screen="main-menu"]', { timeout: 15000 });
  await window.evaluate(() => location.reload());
  await window.waitForSelector('#game-root canvas', { timeout: 15000 });
  await refreshCanvasBox();
  await window.waitForSelector('#game-root[data-screen="main-menu"]', { timeout: 15000 });

  const title = await window.locator('#game-root').getAttribute('data-title');
  assert.equal(title, 'Thunderbolt Fighter');
  await window.evaluate(() => localStorage.clear());
  await window.evaluate(() => location.reload());
  await window.waitForSelector('#game-root canvas', { timeout: 15000 });
  await refreshCanvasBox();
  await window.waitForSelector('#game-root[data-screen="tutorial"]', { timeout: 15000 });
  await clickGamePoint(640, 592);
  assert.match(
    await window.evaluate(() => localStorage.getItem('thunderbolt-fighter:tutorial')),
    /"skipped":true/
  );
  await window.waitForSelector('#game-root[data-screen="main-menu"]', { timeout: 15000 });

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

  await clickGamePoint(320, 548);
  await window.waitForSelector('#game-root[data-screen="settings"]', { timeout: 15000 });
  assert.equal(await gameRoot.getAttribute('data-audio-enabled'), 'true');
  assert.equal(await gameRoot.getAttribute('data-fullscreen-enabled'), 'false');
  assert.equal(await gameRoot.getAttribute('data-tutorial-replay-requested'), 'false');
  await clickGamePoint(440, 210);
  assert.equal(await gameRoot.getAttribute('data-audio-enabled'), 'false');
  await clickGamePoint(440, 330);
  await window.waitForSelector('#game-root[data-screen="tutorial"][data-tutorial-replay="true"]', { timeout: 15000 });
  await clickGamePoint(640, 506);
  await window.waitForSelector('#game-root[data-screen="settings"]', { timeout: 15000 });
  assert.equal(await gameRoot.getAttribute('data-tutorial-replay-requested'), 'false');
  await clickGamePoint(840, 330);
  assert.equal(await gameRoot.getAttribute('data-records-reset'), 'true');
  await clickGamePoint(640, 510);
  await window.waitForSelector('#game-root[data-screen="main-menu"]', { timeout: 15000 });

  const startRunWithSelectedOptions = async () => {
    await clickGamePoint(436, 354);
    await clickGamePoint(436, 494);
    await window.evaluate(() => {
      localStorage.setItem('thunderbolt-fighter:local-records', JSON.stringify({
        bestScores: { '5m:hard': 1200 },
        recentRuns: []
      }));
    });
    await clickGamePoint(320, 616);
  };

  await startRunWithSelectedOptions();

  await window.waitForSelector('#game-root[data-screen="gameplay"]', { timeout: 15000 });
  assert.equal(await gameRoot.getAttribute('data-screen'), 'gameplay');
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '5');
  assert.equal(await gameRoot.getAttribute('data-difficulty'), 'hard');
  assert.equal(await gameRoot.getAttribute('data-score'), '0');
  assert.match(await gameRoot.getAttribute('data-timer'), /^[0-5]:[0-5][0-9]$/);
  assert.equal(await gameRoot.getAttribute('data-health'), '100/100');
  assert.equal(await gameRoot.getAttribute('data-shield'), '0');
  assert.equal(await gameRoot.getAttribute('data-weapon'), 'Blaster');
  assert.equal(await gameRoot.getAttribute('data-buff'), 'None');
  assert.equal(await gameRoot.getAttribute('data-pickups'), '0');
  assert.equal(await gameRoot.getAttribute('data-hud-pickups'), 'Pickups 0');
  assert.equal(await gameRoot.getAttribute('data-best-score'), '1200');
  assert.equal(await gameRoot.getAttribute('data-hud-best-score'), 'Best 1200');
  assert.equal(await gameRoot.getAttribute('data-paused'), 'false');

  await window.keyboard.press('Escape');
  assert.equal(await gameRoot.getAttribute('data-paused'), 'true');
  await window.evaluate(() => {
    globalThis.__thunderboltFighterGame.scene.getScene('gameplay').closePauseMenu();
  });
  assert.equal(await gameRoot.getAttribute('data-paused'), 'false');

  await window.evaluate(() => {
    globalThis.__thunderboltFighterGame.scene.getScene('gameplay').openPauseMenu();
  });
  assert.equal(await gameRoot.getAttribute('data-paused'), 'true');
  await window.evaluate(() => {
    globalThis.__thunderboltFighterGame.scene.getScene('gameplay').returnToMenu();
  });
  await window.waitForSelector('#game-root[data-screen="main-menu"]', { timeout: 15000 });
  assert.equal(await window.evaluate(() => JSON.parse(localStorage.getItem('thunderbolt-fighter:local-records')).recentRuns.length), 0);

  await startRunWithSelectedOptions();
  await window.waitForSelector('#game-root[data-screen="gameplay"]', { timeout: 15000 });
  await window.keyboard.press('Escape');
  await window.evaluate(() => {
    globalThis.__thunderboltFighterGame.scene.getScene('gameplay').restartRun();
  });
  await window.waitForSelector('#game-root[data-screen="gameplay"]', { timeout: 15000 });
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '5');
  assert.equal(await gameRoot.getAttribute('data-difficulty'), 'hard');
  assert.equal(await window.evaluate(() => JSON.parse(localStorage.getItem('thunderbolt-fighter:local-records')).recentRuns.length), 0);

  await window.waitForFunction(() => globalThis.__thunderboltFighterGame?.scene?.getScene('gameplay'));
  await window.evaluate(() => {
    const gameplay = globalThis.__thunderboltFighterGame.scene.getScene('gameplay');

    gameplay.projectiles = [];
    gameplay.enemyProjectiles = [];
    gameplay.enemies = [];
    gameplay.spawnBossEnemy();
    gameplay.updateBossHpHud();
  });
  assert.equal(await gameRoot.getAttribute('data-boss-hp-hud-visible'), 'true');
  assert.equal(await gameRoot.getAttribute('data-boss-hp-current'), '1200');
  assert.equal(await gameRoot.getAttribute('data-boss-hp-max'), '1200');
  assert.equal(await gameRoot.getAttribute('data-boss-hp-text'), 'Boss HP 1200/1200');
  await window.waitForFunction(() => {
    const gameplay = globalThis.__thunderboltFighterGame?.scene?.getScene('gameplay');

    return gameplay?.enemies?.some((enemy) => enemy.type === 'boss-class');
  });

  await window.evaluate(() => {
    const gameplay = globalThis.__thunderboltFighterGame.scene.getScene('gameplay');
    const boss = gameplay.enemies.find((enemy) => enemy.type === 'boss-class');

    gameplay.projectiles.push({
      x: boss.x,
      y: boss.y,
      radius: 5,
      destroy: () => {}
    });
    gameplay.resolvePlayerProjectileHits();
  });
  const bossHpAfterDamage = await gameRoot.getAttribute('data-boss-hp-current');
  assert.equal(bossHpAfterDamage, '1185');
  assert.equal(await gameRoot.getAttribute('data-boss-hp-text'), 'Boss HP 1185/1200');

  await window.evaluate(() => {
    const gameplay = globalThis.__thunderboltFighterGame.scene.getScene('gameplay');
    const boss = gameplay.enemies.find((enemy) => enemy.type === 'boss-class');

    boss.health = 15;
    gameplay.projectiles.push({
      x: boss.x,
      y: boss.y,
      radius: 5,
      destroy: () => {}
    });
    gameplay.resolvePlayerProjectileHits();
    gameplay.runClock.remainingMs = 0;
    gameplay.endRunIfNeeded();
  });
  await window.waitForSelector('#game-root[data-screen="results"]', { timeout: 15000 });
  assert.equal(await gameRoot.getAttribute('data-screen'), 'results');
  assert.equal(await gameRoot.getAttribute('data-boss-hp-hud-visible'), 'false');
  assert.equal(await gameRoot.getAttribute('data-results-best-score'), '1200');
  assert.equal(await gameRoot.getAttribute('data-results-local-record'), '1500');
  assert.equal(await gameRoot.getAttribute('data-results-replay-run-length-minutes'), '5');
  assert.equal(await gameRoot.getAttribute('data-results-replay-difficulty'), 'hard');
  assert.equal(await gameRoot.getAttribute('data-results-actions'), 'Main Menu,Replay');

  await clickGamePoint(1020, 380);
  await window.waitForSelector('#game-root[data-screen="gameplay"]', { timeout: 15000 });
  assert.equal(await gameRoot.getAttribute('data-run-length-minutes'), '5');
  assert.equal(await gameRoot.getAttribute('data-difficulty'), 'hard');
  assert.equal(await gameRoot.getAttribute('data-score'), '0');
  assert.equal(await gameRoot.getAttribute('data-pickups'), '0');

  await window.evaluate(() => {
    const gameplay = globalThis.__thunderboltFighterGame.scene.getScene('gameplay');

    gameplay.runClock.remainingMs = 0;
    gameplay.enemies = [];
    gameplay.endRunIfNeeded();
  });
  await window.waitForSelector('#game-root[data-screen="results"]', { timeout: 15000 });
  const recentRunCountBeforeMainMenu = await window.evaluate(() => JSON.parse(localStorage.getItem('thunderbolt-fighter:local-records')).recentRuns.length);
  await clickGamePoint(260, 380);
  await window.waitForSelector('#game-root[data-screen="main-menu"]', { timeout: 15000 });
  assert.equal(await window.evaluate(() => JSON.parse(localStorage.getItem('thunderbolt-fighter:local-records')).recentRuns.length), recentRunCountBeforeMainMenu);

  const windowTitle = await window.title();
  assert.equal(windowTitle, 'Thunderbolt Fighter');
} finally {
  await app.close();
}
