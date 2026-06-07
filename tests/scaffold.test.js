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

test('simple, normal, and hard difficulty tune enemy pressure, damage, and score pacing', async () => {
  const { DIFFICULTY_TUNING, getDifficultyTuning, shouldBasicEnemyFire, shouldSpawnBasicEnemy } = await import('../src/renderer/gameplay-state.js');

  assert.deepEqual(Object.keys(DIFFICULTY_TUNING), ['simple', 'normal', 'hard']);
  assert.ok(getDifficultyTuning('simple').enemySpawnIntervalMs > getDifficultyTuning('normal').enemySpawnIntervalMs);
  assert.ok(getDifficultyTuning('hard').enemySpawnIntervalMs < getDifficultyTuning('normal').enemySpawnIntervalMs);
  assert.ok(getDifficultyTuning('simple').maxActiveEnemies < getDifficultyTuning('normal').maxActiveEnemies);
  assert.ok(getDifficultyTuning('hard').maxActiveEnemies > getDifficultyTuning('normal').maxActiveEnemies);
  assert.ok(getDifficultyTuning('simple').enemyFireIntervalMultiplier > getDifficultyTuning('normal').enemyFireIntervalMultiplier);
  assert.ok(getDifficultyTuning('hard').enemyFireIntervalMultiplier < getDifficultyTuning('normal').enemyFireIntervalMultiplier);
  assert.ok(getDifficultyTuning('simple').enemyProjectileDamageMultiplier < getDifficultyTuning('normal').enemyProjectileDamageMultiplier);
  assert.ok(getDifficultyTuning('hard').enemyProjectileDamageMultiplier > getDifficultyTuning('normal').enemyProjectileDamageMultiplier);
  assert.ok(getDifficultyTuning('simple').enemyContactDamageMultiplier < getDifficultyTuning('normal').enemyContactDamageMultiplier);
  assert.ok(getDifficultyTuning('hard').enemyContactDamageMultiplier > getDifficultyTuning('normal').enemyContactDamageMultiplier);
  assert.ok(getDifficultyTuning('simple').scoreMultiplier < getDifficultyTuning('normal').scoreMultiplier);
  assert.ok(getDifficultyTuning('hard').scoreMultiplier > getDifficultyTuning('normal').scoreMultiplier);
  assert.equal(shouldSpawnBasicEnemy({ elapsedMs: 1000, lastSpawnedMs: 0, activeEnemyCount: 0, difficulty: 'simple' }), false);
  assert.equal(shouldSpawnBasicEnemy({ elapsedMs: 1000, lastSpawnedMs: 0, activeEnemyCount: 0, difficulty: 'hard' }), true);
  assert.equal(shouldSpawnBasicEnemy({ elapsedMs: 2500, lastSpawnedMs: 0, activeEnemyCount: getDifficultyTuning('simple').maxActiveEnemies, difficulty: 'simple' }), false);
  assert.equal(shouldBasicEnemyFire({ elapsedMs: 2300, lastFiredMs: 0, difficulty: 'simple' }), false);
  assert.equal(shouldBasicEnemyFire({ elapsedMs: 2300, lastFiredMs: 0, difficulty: 'normal' }), false);
  assert.equal(shouldBasicEnemyFire({ elapsedMs: 2300, lastFiredMs: 0, difficulty: 'hard' }), true);
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

test('gameplay baseline carries the selected difficulty tuning', async () => {
  const { createRunBaseline, getDifficultyTuning } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const simpleRun = createRunBaseline({ difficulty: 'simple' });
  const hardRun = createRunBaseline({ difficulty: 'hard' });

  assert.equal(simpleRun.difficulty, 'simple');
  assert.deepEqual(simpleRun.difficultyTuning, getDifficultyTuning('simple'));
  assert.equal(hardRun.difficulty, 'hard');
  assert.deepEqual(hardRun.difficultyTuning, getDifficultyTuning('hard'));
  assert.notEqual(simpleRun.difficultyTuning.enemySpawnIntervalMs, hardRun.difficultyTuning.enemySpawnIntervalMs);
  assert.match(renderer, /createRunBaseline\(\{ difficulty: runOptions\.difficulty \}\)/);
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

test('basic and elite enemies differ in durability, damage, firing, movement, and score value', async () => {
  const { ENEMY_CLASSES } = await import('../src/renderer/gameplay-state.js');

  assert.equal(ENEMY_CLASSES.basic.type, 'basic');
  assert.equal(ENEMY_CLASSES.elite.type, 'elite');
  assert.ok(ENEMY_CLASSES.elite.maxHealth > ENEMY_CLASSES.basic.maxHealth);
  assert.ok(ENEMY_CLASSES.elite.projectileDamage > ENEMY_CLASSES.basic.projectileDamage);
  assert.ok(ENEMY_CLASSES.elite.contactDamage > ENEMY_CLASSES.basic.contactDamage);
  assert.equal(ENEMY_CLASSES.basic.escapedDamage, 5);
  assert.equal(ENEMY_CLASSES.elite.escapedDamage, 10);
  assert.ok(ENEMY_CLASSES.elite.fireIntervalMs < ENEMY_CLASSES.basic.fireIntervalMs);
  assert.equal(ENEMY_CLASSES.basic.speed, 48);
  assert.equal(ENEMY_CLASSES.elite.speed, 66);
  assert.ok(ENEMY_CLASSES.elite.speed > ENEMY_CLASSES.basic.speed);
  assert.notEqual(ENEMY_CLASSES.elite.movementPattern, ENEMY_CLASSES.basic.movementPattern);
  assert.ok(ENEMY_CLASSES.elite.scoreValue > ENEMY_CLASSES.basic.scoreValue);
});

test('enemy movement remains readable while elite enemies use bounded sway', async () => {
  const { BASIC_ENEMY, ENEMY_CLASSES, advanceBasicEnemies, createEnemySpawn, resolveEnemyTypeForSpawn } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const basicEnemy = createEnemySpawn({ spawnIndex: 0, enemyType: 'basic' });
  const eliteEnemy = createEnemySpawn({ spawnIndex: 3, enemyType: 'elite' });
  const [advancedBasic, advancedElite] = advanceBasicEnemies({ enemies: [basicEnemy, eliteEnemy], deltaSeconds: 1 });

  assert.equal(resolveEnemyTypeForSpawn({ spawnIndex: 0 }), 'basic');
  assert.equal(resolveEnemyTypeForSpawn({ spawnIndex: 3 }), 'elite');
  assert.equal(advancedBasic.x, basicEnemy.x);
  assert.ok(advancedElite.y > eliteEnemy.y);
  assert.ok(Math.abs(advancedElite.x - eliteEnemy.movementOriginX) <= ENEMY_CLASSES.elite.maxHorizontalOffset);
  assert.ok(ENEMY_CLASSES.elite.maxHorizontalOffset < Math.min(...BASIC_ENEMY.lanes.slice(1).map((lane, index) => lane - BASIC_ENEMY.lanes[index])) / 2);
  assert.match(renderer, /resolveEnemyTypeForSpawn/);
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
    lastFiredMs: -BASIC_ENEMY.fireIntervalMs,
    movementOriginX: BASIC_ENEMY.lanes[0]
  });
  assert.equal(secondEnemy.x, BASIC_ENEMY.lanes[1]);
  assert.equal(BASIC_ENEMY.speed, 48);
  assert.equal(advancedEnemies[0].y, BASIC_ENEMY.speed - BASIC_ENEMY.radius);
  assert.match(renderer, /createEnemySpawn/);
  assert.match(renderer, /advanceBasicEnemies/);
});

test('basic enemies shoot downward on a fixed cadence', async () => {
  const { BASIC_ENEMY, createBasicEnemyProjectile, advanceEnemyProjectiles, shouldBasicEnemyFire } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const projectile = createBasicEnemyProjectile({ enemyId: 'basic-0', x: 420, y: 96 });
  const advancedProjectiles = advanceEnemyProjectiles({ projectiles: [projectile], deltaSeconds: 1 });

  assert.equal(shouldBasicEnemyFire({ elapsedMs: 0, lastFiredMs: -BASIC_ENEMY.fireIntervalMs * 2 }), true);
  assert.equal(shouldBasicEnemyFire({ elapsedMs: 400, lastFiredMs: 0 }), false);
  assert.equal(shouldBasicEnemyFire({ elapsedMs: BASIC_ENEMY.fireIntervalMs, lastFiredMs: 0 }), false);
  assert.equal(shouldBasicEnemyFire({ elapsedMs: BASIC_ENEMY.fireIntervalMs * 2, lastFiredMs: 0 }), true);
  assert.deepEqual(projectile, {
    sourceEnemyId: 'basic-0',
    x: 420,
    y: 96 + BASIC_ENEMY.radius,
    radius: BASIC_ENEMY.projectileRadius,
    damage: BASIC_ENEMY.projectileDamage,
    speed: BASIC_ENEMY.projectileSpeed
  });
  assert.equal(advancedProjectiles[0].y, projectile.y + BASIC_ENEMY.projectileSpeed);
  assert.match(renderer, /createBasicEnemyProjectile/);
  assert.match(renderer, /advanceEnemyProjectiles/);
});

test('player shots damage and destroy basic enemies', async () => {
  const { BASIC_ENEMY, PLAYER_WEAPON, resolvePlayerProjectileEnemyHits } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const enemy = {
    id: 'basic-0',
    type: 'basic',
    x: 420,
    y: 120,
    health: BASIC_ENEMY.maxHealth,
    lastFiredMs: 0
  };
  const firstHit = resolvePlayerProjectileEnemyHits({
    enemies: [enemy],
    projectiles: [{ x: 420, y: 120, radius: PLAYER_WEAPON.projectileRadius }]
  });
  const finalHit = resolvePlayerProjectileEnemyHits({
    enemies: firstHit.enemies,
    projectiles: [{ x: 420, y: firstHit.enemies[0].y, radius: PLAYER_WEAPON.projectileRadius }]
  });

  assert.equal(firstHit.enemies[0].health, BASIC_ENEMY.maxHealth - PLAYER_WEAPON.damage);
  assert.equal(firstHit.projectiles.length, 0);
  assert.equal(firstHit.destroyedEnemies.length, 0);
  assert.equal(firstHit.damageDealt, PLAYER_WEAPON.damage);
  assert.equal(finalHit.enemies.length, 0);
  assert.deepEqual(finalHit.destroyedEnemies, [{ ...firstHit.enemies[0], health: 0 }]);
  assert.match(renderer, /resolvePlayerProjectileEnemyHits/);
});

test('enemies that reach the bottom damage the player if they are not eliminated', async () => {
  const { BASIC_ENEMY, ENEMY_CLASSES, GAMEPLAY_PLAYFIELD, createBasicEnemySpawn, createEnemySpawn, createRunStats, resolveEscapedEnemyHits } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const escapedBasicEnemy = {
    ...createBasicEnemySpawn({ spawnIndex: 0 }),
    y: GAMEPLAY_PLAYFIELD.height + BASIC_ENEMY.radius + 1
  };
  const escapedEliteEnemy = {
    ...createEnemySpawn({ spawnIndex: 3, enemyType: 'elite' }),
    y: GAMEPLAY_PLAYFIELD.height + ENEMY_CLASSES.elite.radius + 1
  };
  const activeEnemy = createBasicEnemySpawn({ spawnIndex: 1 });
  const result = resolveEscapedEnemyHits({
    stats: createRunStats(),
    enemies: [activeEnemy, escapedBasicEnemy, escapedEliteEnemy],
    difficulty: 'hard'
  });

  assert.equal(result.stats.health, 100 - ENEMY_CLASSES.basic.escapedDamage - ENEMY_CLASSES.elite.escapedDamage);
  assert.deepEqual(result.enemies, [activeEnemy]);
  assert.deepEqual(result.escapedEnemies, [escapedBasicEnemy, escapedEliteEnemy]);
  assert.match(renderer, /resolveEscapedEnemyHits/);
});

test('enemy shots and contact damage the player', async () => {
  const { BASIC_ENEMY, PLAYER_FLIGHT, createRunStats, resolveEnemyPlayerHits } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const player = { x: PLAYER_FLIGHT.startX, y: PLAYER_FLIGHT.startY, radius: PLAYER_FLIGHT.radius };
  const enemyProjectile = {
    x: player.x,
    y: player.y,
    radius: BASIC_ENEMY.projectileRadius,
    damage: BASIC_ENEMY.projectileDamage
  };
  const contactEnemy = {
    id: 'basic-0',
    type: 'basic',
    x: player.x,
    y: player.y,
    health: BASIC_ENEMY.maxHealth,
    lastFiredMs: 0
  };
  const result = resolveEnemyPlayerHits({
    stats: createRunStats(),
    player,
    enemyProjectiles: [enemyProjectile],
    enemies: [contactEnemy]
  });

  assert.equal(result.stats.health, 100 - BASIC_ENEMY.projectileDamage - BASIC_ENEMY.contactDamage);
  assert.equal(result.enemyProjectiles.length, 0);
  assert.deepEqual(result.contactEnemies, [contactEnemy]);
  assert.match(renderer, /resolveEnemyPlayerHits/);
});

test('destroying basic enemies increases score, kills, and damage dealt', async () => {
  const { BASIC_ENEMY, PLAYER_WEAPON, applyDestroyedEnemyRewards, createRunStats } = await import('../src/renderer/gameplay-state.js');
  const renderer = await readText('src/renderer/game.js');

  const stats = applyDestroyedEnemyRewards({
    stats: createRunStats(),
    destroyedEnemies: [{ id: 'basic-0', type: BASIC_ENEMY.type, health: 0 }],
    damageDealt: PLAYER_WEAPON.damage
  });

  assert.equal(stats.score, BASIC_ENEMY.scoreValue);
  assert.equal(stats.kills, 1);
  assert.equal(stats.damageDealt, PLAYER_WEAPON.damage);
  assert.match(renderer, /applyDestroyedEnemyRewards/);
  assert.match(renderer, /dataset\.kills/);
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
