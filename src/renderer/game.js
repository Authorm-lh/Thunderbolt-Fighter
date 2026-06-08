import * as Phaser from '../../node_modules/phaser/dist/phaser.esm.js';
import {
  BACKGROUND_SCROLL,
  BASIC_ENEMY,
  GAMEPLAY_PLAYFIELD,
  PICKUP_SPAWNING,
  PLAYER_FLIGHT,
  PLAYER_WEAPON,
  advanceBackgroundOffset,
  advanceBasicEnemies,
  advanceEnemyProjectiles,
  advancePickups,
  advanceRunClock,
  advanceTimedBuffs,
  applyDestroyedEnemyRewards,
  applyPickupBuff,
  applyPlayerDamage,
  createBasicEnemyProjectile,
  createBossEnemySpawn,
  createBossWarningState,
  createEnemySpawn,
  createHudValues,
  createPickupSpawn,
  createPlayerProjectiles,
  createResultsValues,
  createRunBaseline,
  createRunClock,
  createRunStats,
  createTestNameMarker,
  destroyTestNameMarker,
  followTestNameMarkerTarget,
  getEnemyClass,
  getEnemyTestNameMarkerText,
  getPickupTestNameMarkerText,
  getRunEndReason,
  resolveEscapedEnemyHits,
  resolveEnemyPlayerHits,
  resolveEnemyTypeForSpawn,
  resolvePlayerPickupHits,
  resolvePlayerProjectileEnemyHits,
  resolvePlayerVelocity,
  shouldAutoFire,
  shouldBasicEnemyFire,
  shouldShowBossWarning,
  shouldSpawnBasicEnemy,
  shouldSpawnBoss,
  shouldSpawnPickup
} from './gameplay-state.js';

const RUN_LENGTH_OPTIONS = [
  { label: '1 min', runLengthMinutes: 1, xOffset: -116 },
  { label: '3 min', runLengthMinutes: 3, xOffset: 0 },
  { label: '5 min', runLengthMinutes: 5, xOffset: 116 }
];

const DIFFICULTY_OPTIONS = [
  { label: 'Simple', difficulty: 'simple', xOffset: -116 },
  { label: 'Normal', difficulty: 'normal', xOffset: 0 },
  { label: 'Hard', difficulty: 'hard', xOffset: 116 }
];

const MENU_ASSETS = {
  background: '../../assets/runtime/art/backgrounds/background_main_menu_1280x720.png'
};

const MENU_LAYOUT = {
  contentX: 320,
  titleY: 96,
  mainMenuY: 204,
  panelY: 438,
  runLengthY: 300,
  runLengthButtonY: 354,
  difficultyY: 440,
  difficultyButtonY: 494,
  startButtonY: 616
};

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('main-menu');
    this.selectedRunLengthMinutes = 1;
    this.selectedDifficulty = 'normal';
  }

  preload() {
    this.load.image('menu-background', MENU_ASSETS.background);
  }

  create() {
    this.cameras.main.setBackgroundColor('#09111f');

    const contentX = MENU_LAYOUT.contentX;
    const centerX = this.scale.width / 2;
    const root = document.querySelector('#game-root');

    this.add.image(centerX, this.scale.height / 2, 'menu-background')
      .setDisplaySize(this.scale.width, this.scale.height);
    this.add.rectangle(300, this.scale.height / 2, 600, this.scale.height, 0x04101d, 0.5);
    this.add.rectangle(centerX, this.scale.height / 2, this.scale.width, this.scale.height, 0x06111f, 0.12);
    this.add.line(0, 0, 602, 0, 602, this.scale.height, 0x3db7ff, 0.28)
      .setOrigin(0, 0);

    this.add.rectangle(contentX, MENU_LAYOUT.titleY, 470, 94, 0x071827, 0.48)
      .setStrokeStyle(1, 0x9ed7ff, 0.46);

    this.add.text(contentX, MENU_LAYOUT.titleY - 6, 'Thunderbolt Fighter', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '44px',
      color: '#f8fbff',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.rectangle(contentX, MENU_LAYOUT.panelY, 500, 360, 0x071827, 0.44)
      .setStrokeStyle(1, 0x3db7ff, 0.42);

    this.add.text(contentX, MENU_LAYOUT.mainMenuY, 'Main Menu', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      color: '#f8fbff',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(contentX, MENU_LAYOUT.runLengthY, 'Run Length', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#9ed7ff',
      align: 'center'
    }).setOrigin(0.5);

    const runLengthButtons = RUN_LENGTH_OPTIONS.map((option) => this.createOptionButton(contentX + option.xOffset, MENU_LAYOUT.runLengthButtonY, option.label));

    const updateRunLengthSelection = (runLengthMinutes) => {
      this.selectedRunLengthMinutes = runLengthMinutes;
      root.dataset.runLengthMinutes = String(runLengthMinutes);
      this.updateSelectedButton(runLengthButtons, (option) => option.runLengthMinutes === runLengthMinutes);
    };

    this.bindOptionButtons(runLengthButtons, RUN_LENGTH_OPTIONS, (option) => updateRunLengthSelection(option.runLengthMinutes));

    this.add.text(contentX, MENU_LAYOUT.difficultyY, 'Difficulty', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#9ed7ff',
      align: 'center'
    }).setOrigin(0.5);

    const difficultyButtons = DIFFICULTY_OPTIONS.map((option) => this.createOptionButton(contentX + option.xOffset, MENU_LAYOUT.difficultyButtonY, option.label));

    const updateDifficultySelection = (difficulty) => {
      this.selectedDifficulty = difficulty;
      root.dataset.difficulty = difficulty;
      this.updateSelectedButton(difficultyButtons, (option) => option.difficulty === difficulty);
    };

    this.bindOptionButtons(difficultyButtons, DIFFICULTY_OPTIONS, (option) => updateDifficultySelection(option.difficulty));

    const startRunButton = this.createActionButton(contentX, MENU_LAYOUT.startButtonY, 'Start Run');

    const startRun = () => {
      this.scene.start('gameplay', {
        runOptions: {
          runLengthMinutes: this.selectedRunLengthMinutes,
          difficulty: this.selectedDifficulty
        }
      });
    };

    startRunButton.hitArea.on('pointerdown', startRun);
    startRunButton.label.on('pointerdown', startRun);

    root.dataset.screen = 'main-menu';
    root.dataset.title = 'Thunderbolt Fighter';
    updateRunLengthSelection(this.selectedRunLengthMinutes);
    updateDifficultySelection(this.selectedDifficulty);
  }

  createOptionButton(x, y, labelText) {
    const plate = this.add.rectangle(x, y, 106, 50, 0x0b2234, 0.72)
      .setStrokeStyle(1, 0x3db7ff, 0.6);
    const hitArea = this.add.rectangle(x, y, 106, 50, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    const label = this.add.text(x, y, labelText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#9ed7ff',
      align: 'center',
      stroke: '#071827',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    return { plate, hitArea, label };
  }

  createActionButton(x, y, labelText) {
    const plate = this.add.rectangle(x, y, 220, 62, 0x12334a, 0.82)
      .setStrokeStyle(2, 0xffd166, 0.78);
    const hitArea = this.add.rectangle(x, y, 220, 62, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y - 1, labelText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      color: '#ffd166',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 4
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    return { plate, hitArea, label };
  }

  bindOptionButtons(buttons, options, selectOption) {
    buttons.forEach((button, index) => {
      button.option = options[index];
      button.hitArea.on('pointerdown', () => selectOption(button.option));
      button.label.on('pointerdown', () => selectOption(button.option));
    });
  }

  updateSelectedButton(buttons, isSelectedOption) {
    buttons.forEach(({ option, plate, label }) => {
      const isSelected = isSelectedOption(option);
      plate.setFillStyle(isSelected ? 0x1d5a78 : 0x0b2234, isSelected ? 0.9 : 0.72);
      plate.setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0xf8fbff : 0x3db7ff, isSelected ? 0.9 : 0.6);
      label.setColor(isSelected ? '#f8fbff' : '#9ed7ff');
    });
  }
}

class GameplayScene extends Phaser.Scene {
  constructor() {
    super('gameplay');
    this.player = null;
    this.cursorKeys = null;
    this.wasdKeys = null;
    this.projectiles = [];
    this.enemies = [];
    this.enemyProjectiles = [];
    this.pickups = [];
    this.playerNameMarker = null;
    this.lastFiredMs = -PLAYER_WEAPON.fireIntervalMs;
    this.lastEnemySpawnedMs = -BASIC_ENEMY.spawnIntervalMs;
    this.lastPickupSpawnedMs = -PICKUP_SPAWNING.spawnIntervalMs;
    this.enemySpawnCount = 0;
    this.pickupSpawnCount = 0;
    this.backgroundStars = [];
    this.backgroundOffset = 0;
    this.runBaseline = null;
    this.runClock = null;
    this.runStats = null;
    this.hudText = null;
    this.bossWarningText = null;
    this.bossWarningDetailText = null;
    this.bossWarningShown = false;
    this.bossSpawned = false;
    this.root = null;
    this.selectedDifficulty = 'normal';
  }

  create(data) {
    const runOptions = data.runOptions;
    const root = document.querySelector('#game-root');
    this.root = root;
    this.selectedDifficulty = runOptions.difficulty;
    this.bossWarningShown = false;
    this.bossSpawned = false;
    this.runBaseline = createRunBaseline({ difficulty: runOptions.difficulty });
    this.runClock = createRunClock({ runLengthMinutes: runOptions.runLengthMinutes });
    this.runStats = createRunStats();

    this.cameras.main.setBackgroundColor('#09111f');
    this.createBackgroundStarfield();

    this.player = this.add.triangle(
      this.runBaseline.player.startX,
      this.runBaseline.player.startY,
      0,
      this.runBaseline.player.radius * 1.4,
      this.runBaseline.player.radius,
      0,
      this.runBaseline.player.radius * 2,
      this.runBaseline.player.radius * 1.4,
      0x9ed7ff,
      1
    ).setStrokeStyle(2, 0xf8fbff, 0.9);
    this.player.radius = PLAYER_FLIGHT.radius;
    this.playerNameMarker = this.createNameMarker(createTestNameMarker({ text: 'Player', target: this.player }));

    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');

    this.add.text(24, 24, `${runOptions.runLengthMinutes} min / ${runOptions.difficulty}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#9ed7ff',
      align: 'left'
    });
    this.hudText = this.add.text(24, 58, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#f8fbff',
      align: 'left',
      lineSpacing: 6
    });
    this.createBossWarningDisplay();

    root.dataset.screen = 'gameplay';
    root.dataset.runLengthMinutes = String(runOptions.runLengthMinutes);
    root.dataset.difficulty = runOptions.difficulty;
    root.dataset.bossWarning = '';
    root.dataset.bossSpawned = 'false';
    this.updateHud();
  }

  update(_time, delta) {
    if (!this.player || !this.cursorKeys || !this.wasdKeys) {
      return;
    }

    this.updateBackground(delta / 1000);
    this.updateRunClock(delta);

    const velocity = resolvePlayerVelocity({
      ArrowLeft: this.cursorKeys.left.isDown,
      ArrowRight: this.cursorKeys.right.isDown,
      ArrowUp: this.cursorKeys.up.isDown,
      ArrowDown: this.cursorKeys.down.isDown,
      KeyA: this.wasdKeys.A.isDown,
      KeyD: this.wasdKeys.D.isDown,
      KeyW: this.wasdKeys.W.isDown,
      KeyS: this.wasdKeys.S.isDown
    });
    const deltaSeconds = delta / 1000;
    const minX = PLAYER_FLIGHT.radius;
    const maxX = GAMEPLAY_PLAYFIELD.width - PLAYER_FLIGHT.radius;
    const minY = PLAYER_FLIGHT.radius;
    const maxY = GAMEPLAY_PLAYFIELD.height - PLAYER_FLIGHT.radius;

    this.player.x = Phaser.Math.Clamp(this.player.x + velocity.x * deltaSeconds, minX, maxX);
    this.player.y = Phaser.Math.Clamp(this.player.y + velocity.y * deltaSeconds, minY, maxY);
    this.followNameMarker(this.playerNameMarker, this.player);

    if (shouldAutoFire({ elapsedMs: _time, lastFiredMs: this.lastFiredMs, stats: this.runStats })) {
      this.spawnPlayerProjectile();
      this.lastFiredMs = _time;
    }

    if (shouldSpawnBasicEnemy({
      elapsedMs: _time,
      lastSpawnedMs: this.lastEnemySpawnedMs,
      activeEnemyCount: this.enemies.length,
      difficulty: this.selectedDifficulty
    })) {
      this.spawnBasicEnemy();
      this.lastEnemySpawnedMs = _time;
    }

    if (shouldSpawnPickup({
      elapsedMs: _time,
      lastSpawnedMs: this.lastPickupSpawnedMs,
      activePickupCount: this.pickups.length
    })) {
      this.spawnPickup();
      this.lastPickupSpawnedMs = _time;
    }

    this.updateProjectiles(deltaSeconds);
    this.updatePickups(deltaSeconds);
    this.resolvePlayerPickupHits();
    this.resolvePlayerProjectileHits();
    this.updateEnemies(deltaSeconds, _time);
    this.updateEnemyProjectiles(deltaSeconds);
    this.resolveEnemyPlayerHits();
  }

  createBackgroundStarfield() {
    const starColumns = [72, 156, 248, 336, 448, 560, 648, 760, 872, 984, 1096, 1208];
    const tileRows = Math.ceil(GAMEPLAY_PLAYFIELD.height / BACKGROUND_SCROLL.tileHeight) + 2;

    for (let row = -1; row < tileRows; row += 1) {
      starColumns.forEach((x, columnIndex) => {
        const y = row * BACKGROUND_SCROLL.tileHeight + ((columnIndex * 47) % BACKGROUND_SCROLL.tileHeight);
        const radius = columnIndex % 3 === 0 ? 2 : 1;
        const star = this.add.circle(x, y, radius, 0x9ed7ff, 0.48);

        star.baseY = y;
        this.backgroundStars.push(star);
      });
    }
  }

  createNameMarker(markerState) {
    if (!markerState) {
      return null;
    }

    return Object.assign(this.add.text(markerState.x, markerState.y, markerState.text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#f8fbff',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 4
    }).setOrigin(0.5, 1), markerState);
  }

  followNameMarker(marker, target) {
    if (!marker) {
      return;
    }

    const nextMarker = followTestNameMarkerTarget({ marker, target });

    marker.x = nextMarker.x;
    marker.y = nextMarker.y;
    marker.targetRadius = nextMarker.targetRadius;
  }

  destroyNameMarker(target) {
    const nextTarget = destroyTestNameMarker(target);

    target.nameMarker = nextTarget.nameMarker;
  }

  updateBackground(deltaSeconds) {
    this.backgroundOffset = advanceBackgroundOffset({
      currentOffset: this.backgroundOffset,
      deltaSeconds,
      tileHeight: BACKGROUND_SCROLL.tileHeight
    });

    this.backgroundStars.forEach((star) => {
      star.y = ((star.baseY + this.backgroundOffset + BACKGROUND_SCROLL.tileHeight) % (GAMEPLAY_PLAYFIELD.height + BACKGROUND_SCROLL.tileHeight)) - BACKGROUND_SCROLL.tileHeight;
    });
  }

  updateRunClock(deltaMs) {
    this.runClock = advanceRunClock({ clock: this.runClock, deltaMs });
    this.runStats = advanceTimedBuffs({ stats: this.runStats, deltaMs });

    if (shouldShowBossWarning({ remainingMs: this.runClock.remainingMs, bossWarningShown: this.bossWarningShown })) {
      this.showBossWarning();
    }

    if (shouldSpawnBoss({ remainingMs: this.runClock.remainingMs, bossSpawned: this.bossSpawned })) {
      this.spawnBossEnemy();
    }

    this.updateHud();
    this.endRunIfNeeded();
  }

  createBossWarningDisplay() {
    this.bossWarningText = this.add.text(this.scale.width / 2, 116, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
      color: '#ff5f6d',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 6
    }).setOrigin(0.5).setVisible(false);
    this.bossWarningDetailText = this.add.text(this.scale.width / 2, 158, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffd166',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 4
    }).setOrigin(0.5).setVisible(false);
  }

  showBossWarning() {
    const warning = createBossWarningState();

    this.bossWarningShown = true;
    this.bossWarningText.setText(warning.text).setVisible(true);
    this.bossWarningDetailText.setText(warning.detailText).setVisible(true);
    this.root.dataset.bossWarning = warning.text;
  }

  updateHud() {
    const hudValues = createHudValues({ clock: this.runClock, stats: this.runStats });

    this.hudText.setText(Object.values(hudValues).join('\n'));
    this.root.dataset.score = String(this.runStats.score);
    this.root.dataset.kills = String(this.runStats.kills);
    this.root.dataset.timer = hudValues.timer.replace('Timer ', '');
    this.root.dataset.health = `${this.runStats.health}/${this.runStats.maxHealth}`;
    this.root.dataset.shield = String(this.runStats.shield);
    this.root.dataset.weapon = this.runStats.weaponName;
    this.root.dataset.buff = this.runStats.activeBuffName;
    this.root.dataset.pickups = String(this.runStats.pickups);
    this.root.dataset.bestScore = this.runStats.bestScore === null ? '' : String(this.runStats.bestScore);
    this.root.dataset.hudWeapon = hudValues.weapon;
    this.root.dataset.hudBuff = hudValues.buff;
    this.root.dataset.hudPickups = hudValues.pickups;
    this.root.dataset.hudBestScore = hudValues.bestScore;
  }

  applyDamage(damage) {
    this.runStats = applyPlayerDamage({ stats: this.runStats, damage });
    this.updateHud();
    this.endRunIfNeeded();
  }

  applyPickup(pickupType) {
    this.runStats = applyPickupBuff({ stats: this.runStats, pickupType });
    this.updateHud();
  }

  endRunIfNeeded() {
    const endReason = getRunEndReason({ clock: this.runClock, stats: this.runStats });

    if (endReason) {
      this.scene.start('results', {
        endReason,
        runClock: this.runClock,
        runStats: this.runStats
      });
    }
  }

  spawnPlayerProjectile() {
    const projectiles = createPlayerProjectiles({
      player: { x: this.player.x, y: this.player.y, radius: PLAYER_FLIGHT.radius },
      stats: this.runStats
    }).map((projectileState) => {
      const projectile = this.add.circle(
        projectileState.x,
        projectileState.y,
        projectileState.radius,
        projectileState.piercing ? 0x8be9fd : 0xffd166,
        1
      );

      return Object.assign(projectile, projectileState);
    });

    this.projectiles.push(...projectiles);
  }

  updateProjectiles(deltaSeconds) {
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.x += (projectile.velocityX ?? 0) * deltaSeconds;
      projectile.y -= projectile.speed * deltaSeconds;

      if (projectile.y < -projectile.radius) {
        projectile.destroy();
        return false;
      }

      return true;
    });
  }

  updatePickups(deltaSeconds) {
    const advancedPickups = advancePickups({ pickups: this.pickups, deltaSeconds });

    this.pickups = advancedPickups.filter((pickup) => {
      pickup.sprite.y = pickup.y;
      this.followNameMarker(pickup.nameMarker, pickup);

      if (pickup.y > GAMEPLAY_PLAYFIELD.height + pickup.radius) {
        pickup.sprite.destroy();
        this.destroyNameMarker(pickup);
        return false;
      }

      return true;
    });
    this.root.dataset.pickupCount = String(this.pickups.length);
  }

  resolvePlayerPickupHits() {
    const result = resolvePlayerPickupHits({
      stats: this.runStats,
      player: { x: this.player.x, y: this.player.y, radius: PLAYER_FLIGHT.radius },
      pickups: this.pickups
    });
    const remainingPickupIds = new Set(result.pickups.map((pickup) => pickup.id));

    this.pickups.forEach((pickup) => {
      if (!remainingPickupIds.has(pickup.id)) {
        pickup.sprite.destroy();
        this.destroyNameMarker(pickup);
      }
    });

    this.runStats = result.stats;
    this.pickups = result.pickups;
    this.root.dataset.pickupCount = String(this.pickups.length);

    if (result.collectedPickups.length > 0) {
      this.updateHud();
    }
  }

  resolvePlayerProjectileHits() {
    const result = resolvePlayerProjectileEnemyHits({
      enemies: this.enemies,
      projectiles: this.projectiles,
      stats: this.runStats
    });
    const remainingEnemyIds = new Set(result.enemies.map((enemy) => enemy.id));
    const remainingProjectiles = new Set(result.projectiles);

    this.projectiles.forEach((projectile) => {
      if (!remainingProjectiles.has(projectile)) {
        projectile.destroy();
      }
    });
    this.enemies.forEach((enemy) => {
      if (!remainingEnemyIds.has(enemy.id)) {
        enemy.sprite.destroy();
        this.destroyNameMarker(enemy);
      }
    });

    this.projectiles = result.projectiles;
    this.enemies = result.enemies;

    if (result.destroyedEnemies.length > 0) {
      this.runStats = applyDestroyedEnemyRewards({
        stats: this.runStats,
        destroyedEnemies: result.destroyedEnemies,
        damageDealt: result.damageDealt,
        difficulty: this.selectedDifficulty
      });
      this.updateHud();
    }

    this.root.dataset.enemyCount = String(this.enemies.length);
  }

  spawnBasicEnemy() {
    const enemyType = resolveEnemyTypeForSpawn({ spawnIndex: this.enemySpawnCount });
    const enemy = createEnemySpawn({ spawnIndex: this.enemySpawnCount, enemyType });

    this.addEnemy(enemy);
    this.enemySpawnCount += 1;
  }

  spawnBossEnemy() {
    this.bossSpawned = true;
    this.addEnemy(createBossEnemySpawn({ spawnIndex: 0 }));
    this.root.dataset.bossSpawned = 'true';
  }

  addEnemy(enemy) {
    const enemyClass = getEnemyClass(enemy.type);
    const enemyColor = enemy.type === 'boss-class' ? 0xffd166 : enemy.type === 'elite' ? 0xc084fc : 0xff5f6d;
    const sprite = this.add.rectangle(enemy.x, enemy.y, enemyClass.radius * 2, enemyClass.radius * 1.4, enemyColor, 1)
      .setStrokeStyle(2, 0xffd166, 0.8);
    const nameMarker = this.createNameMarker(createTestNameMarker({
      text: getEnemyTestNameMarkerText(enemy.type),
      target: { ...enemy, radius: enemyClass.radius }
    }));

    this.enemies.push({ ...enemy, sprite, nameMarker });
    this.root.dataset.enemyCount = String(this.enemies.length);
  }

  spawnPickup() {
    const pickup = createPickupSpawn({ spawnIndex: this.pickupSpawnCount });
    const sprite = this.add.circle(pickup.x, pickup.y, pickup.radius, 0x45f3ff, 0.9)
      .setStrokeStyle(2, 0xf8fbff, 0.85);
    const nameMarker = this.createNameMarker(createTestNameMarker({
      text: getPickupTestNameMarkerText(pickup.type),
      target: pickup
    }));

    this.pickups.push({ ...pickup, sprite, nameMarker });
    this.pickupSpawnCount += 1;
    this.root.dataset.pickupCount = String(this.pickups.length);
  }

  updateEnemies(deltaSeconds, elapsedMs) {
    const advancedEnemies = advanceBasicEnemies({ enemies: this.enemies, deltaSeconds });

    advancedEnemies.forEach((enemy) => {
      enemy.sprite.x = enemy.x;
      enemy.sprite.y = enemy.y;
      this.followNameMarker(enemy.nameMarker, { ...enemy, radius: getEnemyClass(enemy.type).radius });
    });

    const escapedResult = resolveEscapedEnemyHits({
      stats: this.runStats,
      enemies: advancedEnemies,
      difficulty: this.selectedDifficulty
    });
    const escapedEnemyIds = new Set(escapedResult.escapedEnemies.map((enemy) => enemy.id));

    advancedEnemies.forEach((enemy) => {
      if (escapedEnemyIds.has(enemy.id)) {
        enemy.sprite.destroy();
        this.destroyNameMarker(enemy);
      }
    });

    this.runStats = escapedResult.stats;
    this.enemies = escapedResult.enemies.filter((enemy) => {
      if (enemy.y >= 0 && shouldBasicEnemyFire({
        elapsedMs,
        lastFiredMs: enemy.lastFiredMs,
        enemyType: enemy.type,
        difficulty: this.selectedDifficulty
      })) {
        this.spawnEnemyProjectile(enemy);
        enemy.lastFiredMs = elapsedMs;
      }

      return true;
    });
    this.updateHud();
    this.endRunIfNeeded();
    this.root.dataset.enemyCount = String(this.enemies.length);
  }

  spawnEnemyProjectile(enemy) {
    const projectile = createBasicEnemyProjectile({
      enemyId: enemy.id,
      x: enemy.x,
      y: enemy.y,
      enemyType: enemy.type,
      difficulty: this.selectedDifficulty
    });
    const sprite = this.add.circle(projectile.x, projectile.y, projectile.radius, 0xff8a65, 1);

    this.enemyProjectiles.push({ ...projectile, sprite });
    this.root.dataset.enemyProjectileCount = String(this.enemyProjectiles.length);
  }

  updateEnemyProjectiles(deltaSeconds) {
    const advancedProjectiles = advanceEnemyProjectiles({ projectiles: this.enemyProjectiles, deltaSeconds });

    this.enemyProjectiles = advancedProjectiles.filter((projectile) => {
      projectile.sprite.y = projectile.y;

      if (projectile.y > GAMEPLAY_PLAYFIELD.height + projectile.radius) {
        projectile.sprite.destroy();
        return false;
      }

      return true;
    });
    this.root.dataset.enemyProjectileCount = String(this.enemyProjectiles.length);
  }

  resolveEnemyPlayerHits() {
    const result = resolveEnemyPlayerHits({
      stats: this.runStats,
      player: { x: this.player.x, y: this.player.y, radius: PLAYER_FLIGHT.radius },
      enemyProjectiles: this.enemyProjectiles,
      enemies: this.enemies,
      difficulty: this.selectedDifficulty
    });
    const remainingProjectiles = new Set(result.enemyProjectiles);
    const contactEnemyIds = new Set(result.contactEnemies.map((enemy) => enemy.id));

    this.enemyProjectiles.forEach((projectile) => {
      if (!remainingProjectiles.has(projectile)) {
        projectile.sprite.destroy();
      }
    });
    this.enemies = this.enemies.filter((enemy) => {
      if (contactEnemyIds.has(enemy.id)) {
        enemy.sprite.destroy();
        this.destroyNameMarker(enemy);
        return false;
      }

      return true;
    });
    this.enemyProjectiles = result.enemyProjectiles;
    this.runStats = result.stats;
    this.updateHud();
    this.endRunIfNeeded();
    this.root.dataset.enemyCount = String(this.enemies.length);
    this.root.dataset.enemyProjectileCount = String(this.enemyProjectiles.length);
  }
}

class ResultsScene extends Phaser.Scene {
  constructor() {
    super('results');
  }

  create(data) {
    const root = document.querySelector('#game-root');

    const resultsValues = createResultsValues({ clock: data.runClock, stats: data.runStats });

    this.cameras.main.setBackgroundColor('#09111f');
    this.add.text(this.scale.width / 2, 150, 'Run Complete', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
      color: '#f8fbff',
      align: 'center'
    }).setOrigin(0.5);
    this.add.text(this.scale.width / 2, 250, Object.values(resultsValues).join('\n'), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#9ed7ff',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5, 0);

    root.dataset.screen = 'results';
    root.dataset.endReason = data.endReason;
    root.dataset.resultsScore = String(data.runStats.score);
    root.dataset.resultsKills = String(data.runStats.kills);
    root.dataset.resultsTimeSurvived = resultsValues.timeSurvived.replace('Time Survived ', '');
    root.dataset.resultsPickups = String(data.runStats.pickups);
    root.dataset.resultsShotsFired = String(data.runStats.shotsFired);
    root.dataset.resultsDamageDealt = String(data.runStats.damageDealt);
    root.dataset.resultsDamageBoosted = String(data.runStats.damageBoosted);
    root.dataset.resultsShieldBlocked = String(data.runStats.shieldBlocked);
    root.dataset.resultsWeaponShape = data.runStats.weaponName;
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAMEPLAY_PLAYFIELD.width,
  height: GAMEPLAY_PLAYFIELD.height,
  backgroundColor: '#09111f',
  scene: [MainMenuScene, GameplayScene, ResultsScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
