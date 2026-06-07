import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const readText = (path) => readFile(path, 'utf8');

test('project exposes an offline Electron and Phaser app scaffold', async () => {
  const packageJson = await readJson('package.json');

  assert.equal(packageJson.devDependencies.electron, '^39.2.6');
  assert.equal(packageJson.dependencies.phaser, '^3.90.0');
  assert.equal(packageJson.scripts.dev, 'electron .');
  assert.equal(packageJson.main, 'src/main/main.js');

  const mainProcess = await readText(packageJson.main);
  assert.match(mainProcess, /BrowserWindow/);
  assert.match(mainProcess, /loadFile\(/);
  assert.doesNotMatch(mainProcess, /https?:\/\//);

  const indexHtml = await readText('src/renderer/index.html');
  assert.match(indexHtml, /Content-Security-Policy/);
  assert.match(indexHtml, /img-src 'self' data: blob:/);
  assert.match(indexHtml, /game-root/);
  assert.match(indexHtml, /\.\/game\.js/);

  const renderer = await readText('src/renderer/game.js');
  assert.match(renderer, /import \* as Phaser/);
  assert.match(renderer, /phaser\/dist\/phaser\.esm\.js/);
  assert.match(renderer, /new Phaser\.Game/);
});

test('desktop shell opens to a polished Thunderbolt Fighter main menu', async () => {
  const mainProcess = await readText('src/main/main.js');
  const renderer = await readText('src/renderer/game.js');

  assert.match(mainProcess, /title: 'Thunderbolt Fighter'/);
  assert.match(renderer, /Thunderbolt Fighter/);
  assert.match(renderer, /Start Run/);
  assert.match(renderer, /MainMenuScene/);
  assert.match(renderer, /background_main_menu_1280x720/);
  assert.doesNotMatch(renderer, /background_sky_1672x941/);
  assert.match(renderer, /contentX: 320/);
  assert.match(renderer, /mainMenuY: 204/);
  assert.match(renderer, /runLengthY: 300/);
});

test('main menu exposes 1, 3, and 5 minute run length choices', async () => {
  const renderer = await readText('src/renderer/game.js');
  const smokeTest = await readText('tests/smoke/electron-smoke.mjs');

  assert.match(renderer, /runLengthMinutes: 1/);
  assert.match(renderer, /runLengthMinutes: 3/);
  assert.match(renderer, /runLengthMinutes: 5/);
  assert.match(renderer, /dataset\.runLengthMinutes/);
  assert.match(smokeTest, /data-run-length-minutes/);
});

test('main menu exposes simple, normal, and hard difficulty choices', async () => {
  const renderer = await readText('src/renderer/game.js');
  const smokeTest = await readText('tests/smoke/electron-smoke.mjs');

  assert.match(renderer, /difficulty: 'simple'/);
  assert.match(renderer, /difficulty: 'normal'/);
  assert.match(renderer, /difficulty: 'hard'/);
  assert.match(renderer, /dataset\.difficulty/);
  assert.match(smokeTest, /data-difficulty/);
});

test('main menu start-run path propagates selected options into gameplay', async () => {
  const renderer = await readText('src/renderer/game.js');
  const smokeTest = await readText('tests/smoke/electron-smoke.mjs');

  assert.match(renderer, /class GameplayScene/);
  assert.match(renderer, /this\.scene\.start\('gameplay'/);
  assert.match(renderer, /runOptions/);
  assert.match(renderer, /dataset\.screen = 'gameplay'/);
  assert.match(smokeTest, /getAttribute\('data-screen'\), 'gameplay'/);
  assert.match(smokeTest, /data-run-length-minutes'\), '5'/);
  assert.match(smokeTest, /data-difficulty'\), 'hard'/);
});

test('gameplay scene uses a 16:9 logical playfield', async () => {
  const { GAMEPLAY_PLAYFIELD } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  assert.deepEqual(GAMEPLAY_PLAYFIELD, {
    width: 1280,
    height: 720
  });
  assert.match(renderer, /width: GAMEPLAY_PLAYFIELD\.width/);
  assert.match(renderer, /height: GAMEPLAY_PLAYFIELD\.height/);
  assert.match(renderer, /Phaser\.Scale\.FIT/);
});

test('player movement accepts arrow keys and WASD continuously', async () => {
  const { PLAYER_FLIGHT, resolvePlayerVelocity } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  assert.deepEqual(resolvePlayerVelocity({ ArrowLeft: true }), { x: -PLAYER_FLIGHT.speed, y: 0 });
  assert.deepEqual(resolvePlayerVelocity({ KeyA: true }), { x: -PLAYER_FLIGHT.speed, y: 0 });
  assert.deepEqual(resolvePlayerVelocity({ ArrowRight: true }), { x: PLAYER_FLIGHT.speed, y: 0 });
  assert.deepEqual(resolvePlayerVelocity({ KeyD: true }), { x: PLAYER_FLIGHT.speed, y: 0 });
  assert.deepEqual(resolvePlayerVelocity({ ArrowUp: true }), { x: 0, y: -PLAYER_FLIGHT.speed });
  assert.deepEqual(resolvePlayerVelocity({ KeyW: true }), { x: 0, y: -PLAYER_FLIGHT.speed });
  assert.deepEqual(resolvePlayerVelocity({ ArrowDown: true }), { x: 0, y: PLAYER_FLIGHT.speed });
  assert.deepEqual(resolvePlayerVelocity({ KeyS: true }), { x: 0, y: PLAYER_FLIGHT.speed });

  const diagonal = resolvePlayerVelocity({ ArrowUp: true, KeyD: true });
  assert.equal(Math.round(Math.hypot(diagonal.x, diagonal.y)), PLAYER_FLIGHT.speed);
  assert.match(renderer, /this\.input\.keyboard\.createCursorKeys\(\)/);
  assert.match(renderer, /this\.input\.keyboard\.addKeys/);
  assert.match(renderer, /resolvePlayerVelocity/);
});

test('player ship fires automatically on a fixed cadence', async () => {
  const { PLAYER_WEAPON, shouldAutoFire } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  assert.equal(PLAYER_WEAPON.fireIntervalMs, 260);
  assert.equal(shouldAutoFire({ elapsedMs: 0, lastFiredMs: -PLAYER_WEAPON.fireIntervalMs }), true);
  assert.equal(shouldAutoFire({ elapsedMs: 120, lastFiredMs: 0 }), false);
  assert.equal(shouldAutoFire({ elapsedMs: 260, lastFiredMs: 0 }), true);
  assert.doesNotMatch(renderer, /Space/);
  assert.doesNotMatch(renderer, /shoot/i);
  assert.match(renderer, /shouldAutoFire/);
});

test('basic enemies spawn from the top and descend in readable lanes', async () => {
  const { BASIC_ENEMY, createBasicEnemySpawn, advanceBasicEnemies } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const firstEnemy = createBasicEnemySpawn({ spawnIndex: 0 });
  const secondEnemy = createBasicEnemySpawn({ spawnIndex: 1 });
  const advancedEnemies = advanceBasicEnemies({ enemies: [firstEnemy], deltaSeconds: 1 });

  assert.deepEqual(firstEnemy, {
    id: 'basic-0',
    type: 'basic',
    x: BASIC_ENEMY.lanes[0],
    y: -BASIC_ENEMY.radius,
    health: BASIC_ENEMY.maxHealth,
    lastFiredMs: -BASIC_ENEMY.fireIntervalMs
  });
  assert.equal(secondEnemy.x, BASIC_ENEMY.lanes[1]);
  assert.equal(advancedEnemies[0].y, BASIC_ENEMY.speed - BASIC_ENEMY.radius);
  assert.match(renderer, /createBasicEnemySpawn/);
  assert.match(renderer, /advanceBasicEnemies/);
});

test('basic enemies shoot downward on a fixed cadence', async () => {
  const { BASIC_ENEMY, createBasicEnemyProjectile, advanceEnemyProjectiles, shouldBasicEnemyFire } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const projectile = createBasicEnemyProjectile({ enemyId: 'basic-0', x: 420, y: 96 });
  const advancedProjectiles = advanceEnemyProjectiles({ projectiles: [projectile], deltaSeconds: 1 });

  assert.equal(shouldBasicEnemyFire({ elapsedMs: 0, lastFiredMs: -BASIC_ENEMY.fireIntervalMs }), true);
  assert.equal(shouldBasicEnemyFire({ elapsedMs: 400, lastFiredMs: 0 }), false);
  assert.equal(shouldBasicEnemyFire({ elapsedMs: BASIC_ENEMY.fireIntervalMs, lastFiredMs: 0 }), true);
  assert.deepEqual(projectile, {
    sourceEnemyId: 'basic-0',
    x: 420,
    y: 96 + BASIC_ENEMY.radius,
    radius: BASIC_ENEMY.projectileRadius,
    damage: BASIC_ENEMY.projectileDamage
  });
  assert.equal(advancedProjectiles[0].y, projectile.y + BASIC_ENEMY.projectileSpeed);
  assert.match(renderer, /createBasicEnemyProjectile/);
  assert.match(renderer, /advanceEnemyProjectiles/);
});

test('gameplay background scrolls slowly to communicate vertical flight', async () => {
  const { BACKGROUND_SCROLL, advanceBackgroundOffset } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  assert.equal(BACKGROUND_SCROLL.speed, 36);
  assert.equal(advanceBackgroundOffset({ currentOffset: 0, deltaSeconds: 1, tileHeight: 240 }), 36);
  assert.equal(advanceBackgroundOffset({ currentOffset: 230, deltaSeconds: 1, tileHeight: 240 }), 26);
  assert.match(renderer, /createBackgroundStarfield/);
  assert.match(renderer, /advanceBackgroundOffset/);
});

test('runs count down from the selected duration', async () => {
  const { createRunClock, advanceRunClock, formatRunTimer } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const oneMinuteRun = createRunClock({ runLengthMinutes: 1 });
  const threeMinuteRun = createRunClock({ runLengthMinutes: 3 });
  const fiveMinuteRun = createRunClock({ runLengthMinutes: 5 });

  assert.equal(oneMinuteRun.remainingMs, 60_000);
  assert.equal(threeMinuteRun.remainingMs, 180_000);
  assert.equal(fiveMinuteRun.remainingMs, 300_000);

  const advancedRun = advanceRunClock({ clock: threeMinuteRun, deltaMs: 61_000 });

  assert.equal(advancedRun.remainingMs, 119_000);
  assert.equal(formatRunTimer(advancedRun.remainingMs), '1:59');
  assert.match(renderer, /createRunClock/);
  assert.match(renderer, /advanceRunClock/);
});

test('HUD shows baseline survival and scoring values', async () => {
  const { createRunClock, createRunStats, createHudValues } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const hudValues = createHudValues({
    clock: createRunClock({ runLengthMinutes: 1 }),
    stats: createRunStats()
  });

  assert.deepEqual(hudValues, {
    score: 'Score 0',
    timer: 'Timer 1:00',
    health: 'Health 100/100',
    weapon: 'Weapon Blaster',
    buff: 'Buff None',
    bestScore: 'Best —'
  });
  assert.match(renderer, /createHudValues/);
  assert.match(renderer, /Score/);
  assert.match(renderer, /Health/);
  assert.match(renderer, /Weapon/);
  assert.match(renderer, /Buff/);
  assert.match(renderer, /Best/);
});

test('player health decreases when damage is applied', async () => {
  const { applyPlayerDamage, createRunStats } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const damagedStats = applyPlayerDamage({ stats: createRunStats(), damage: 35 });

  assert.equal(damagedStats.health, 65);
  assert.equal(applyPlayerDamage({ stats: damagedStats, damage: 90 }).health, 0);
  assert.match(renderer, /applyPlayerDamage/);
});

test('the run ends immediately when player health reaches zero', async () => {
  const { applyPlayerDamage, createRunClock, createRunStats, getRunEndReason } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const depletedStats = applyPlayerDamage({ stats: createRunStats(), damage: 100 });

  assert.equal(getRunEndReason({
    clock: createRunClock({ runLengthMinutes: 1 }),
    stats: depletedStats
  }), 'health-depleted');
  assert.match(renderer, /this\.scene\.start\('results'/);
});

test('the run ends when the selected timer expires', async () => {
  const { advanceRunClock, createRunClock, createRunStats, getRunEndReason } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const expiredClock = advanceRunClock({
    clock: createRunClock({ runLengthMinutes: 1 }),
    deltaMs: 60_000
  });

  assert.equal(getRunEndReason({
    clock: expiredClock,
    stats: createRunStats()
  }), 'timer-expired');
  assert.match(renderer, /endRunIfNeeded/);
});

test('results screen shows baseline run performance stats', async () => {
  const { advanceRunClock, createResultsValues, createRunClock, createRunStats } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const clock = advanceRunClock({
    clock: createRunClock({ runLengthMinutes: 3 }),
    deltaMs: 75_000
  });

  assert.deepEqual(createResultsValues({ clock, stats: createRunStats() }), {
    score: 'Score 0',
    kills: 'Kills 0',
    timeSurvived: 'Time Survived 1:15',
    pickups: 'Pickups 0',
    shotsFired: 'Shots Fired 0',
    damageDealt: 'Damage Dealt 0'
  });
  assert.match(renderer, /ResultsScene/);
  assert.match(renderer, /createResultsValues/);
});

test('gameplay tests cover fair run baseline without permanent upgrades', async () => {
  const { PLAYER_FLIGHT, PLAYER_WEAPON, createRunBaseline } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const firstRun = createRunBaseline();
  const laterRun = createRunBaseline({ previousRunUpgrades: { speed: 9999, fireIntervalMs: 1 } });

  assert.deepEqual(firstRun, laterRun);
  assert.deepEqual(firstRun.player, PLAYER_FLIGHT);
  assert.deepEqual(firstRun.weapon, PLAYER_WEAPON);
  assert.doesNotMatch(renderer, /localStorage/);
  assert.doesNotMatch(renderer, /permanent/i);
});

test('project exposes a Windows desktop packaging command', async () => {
  const packageJson = await readJson('package.json');
  const packageScript = await readText('scripts/package-win.js');

  assert.equal(packageJson.scripts['package:win'], 'node scripts/package-win.js');
  assert.equal(packageJson.devDependencies['adm-zip'], '^0.5.17');
  assert.match(packageScript, /downloadArtifact/);
  assert.match(packageScript, /AdmZip/);
  assert.match(packageScript, /extractAllTo/);
  assert.match(packageScript, /writeFile\(electronPathFile, 'electron\.exe'\)/);
  assert.match(packageScript, /platform: 'win32'/);
  assert.match(packageScript, /arch: 'x64'/);
  assert.match(packageScript, /const appName = 'Thunderbolt Fighter'/);
  assert.match(packageScript, /electron\.exe/);
  assert.match(packageScript, /`\$\{appName\}\.exe`/);
  assert.match(packageScript, /resources', 'app/);
  assert.match(packageScript, /node_modules', 'phaser/);
});

test('desktop smoke test launches the shell and reaches the main menu', async () => {
  const packageJson = await readJson('package.json');
  const renderer = await readText('src/renderer/game.js');
  const smokeTest = await readText('tests/smoke/electron-smoke.mjs');

  assert.equal(packageJson.scripts['test:smoke'], 'node tests/smoke/electron-smoke.mjs');
  assert.equal(packageJson.devDependencies['@playwright/test'], '^1.57.0');
  assert.match(renderer, /dataset\.screen = 'main-menu'/);
  assert.match(renderer, /dataset\.title = 'Thunderbolt Fighter'/);
  assert.match(smokeTest, /_electron/);
  assert.match(smokeTest, /#game-root\[data-screen="main-menu"\]/);
  assert.match(smokeTest, /Thunderbolt Fighter/);
});

test('runtime assets and prototype reference assets are separated', async () => {
  const packageScript = await readText('scripts/package-win.js');
  const runtimeReadme = await readText('assets/runtime/README.md');
  const prototypeReadme = await readText('assets/prototype/README.md');

  assert.match(runtimeReadme, /Shipped runtime assets/);
  assert.match(prototypeReadme, /Prototype and reference assets/);
  assert.match(packageScript, /assets', 'runtime/);
  assert.doesNotMatch(packageScript, /assets', 'prototype/);
});
