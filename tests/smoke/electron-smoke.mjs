import { _electron as electron } from '@playwright/test';
import assert from 'node:assert/strict';

const app = await electron.launch({ args: ['.'] });

try {
  const window = await app.firstWindow();
  await window.waitForSelector('#game-root[data-screen="main-menu"]', { timeout: 15000 });
  await window.waitForSelector('#game-root canvas', { timeout: 15000 });

  const title = await window.locator('#game-root').getAttribute('data-title');
  assert.equal(title, 'Thunderbolt Fighter');
  await window.evaluate(() => localStorage.clear());

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

  await window.waitForFunction(() => globalThis.__thunderboltFighterGame?.scene?.getScene('gameplay'));
  await window.evaluate(() => {
    const gameplay = globalThis.__thunderboltFighterGame.scene.getScene('gameplay');

    gameplay.spawnBossEnemy();
    gameplay.updateBossHpHud();
  });
  assert.equal(await gameRoot.getAttribute('data-boss-hp-hud-visible'), 'true');
  assert.equal(await gameRoot.getAttribute('data-boss-hp-current'), '240');
  assert.equal(await gameRoot.getAttribute('data-boss-hp-max'), '240');
  assert.equal(await gameRoot.getAttribute('data-boss-hp-text'), 'Boss HP 240/240');

  await window.evaluate(() => {
    const gameplay = globalThis.__thunderboltFighterGame.scene.getScene('gameplay');
    const boss = gameplay.enemies.find((enemy) => enemy.type === 'boss-class');
    const projectile = gameplay.add.circle(boss.x, boss.y, 5, 0xffd166, 1);

    projectile.radius = 5;
    gameplay.projectiles.push(projectile);
    gameplay.resolvePlayerProjectileHits();
  });
  const bossHpAfterDamage = await gameRoot.getAttribute('data-boss-hp-current');
  assert.equal(bossHpAfterDamage, '225');
  assert.equal(await gameRoot.getAttribute('data-boss-hp-text'), 'Boss HP 225/240');

  await window.evaluate(() => {
    const gameplay = globalThis.__thunderboltFighterGame.scene.getScene('gameplay');
    const boss = gameplay.enemies.find((enemy) => enemy.type === 'boss-class');
    const projectile = gameplay.add.circle(boss.x, boss.y, 5, 0xffd166, 1);

    boss.health = 15;
    projectile.radius = 5;
    gameplay.projectiles.push(projectile);
    gameplay.resolvePlayerProjectileHits();
    gameplay.runClock.remainingMs = 0;
    gameplay.endRunIfNeeded();
  });
  await window.waitForSelector('#game-root[data-screen="results"]', { timeout: 15000 });
  assert.equal(await gameRoot.getAttribute('data-screen'), 'results');
  assert.equal(await gameRoot.getAttribute('data-boss-hp-hud-visible'), 'false');
  assert.equal(await gameRoot.getAttribute('data-results-best-score'), '1200');
  assert.equal(await gameRoot.getAttribute('data-results-local-record'), '1500');

  const windowTitle = await window.title();
  assert.equal(windowTitle, 'Thunderbolt Fighter');
} finally {
  await app.close();
}
