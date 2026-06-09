import * as Phaser from '../../node_modules/phaser/dist/phaser.esm.js';
import {
  BASIC_ENEMY,
  GAMEPLAY_PLAYFIELD,
  HUD_LAYOUT,
  PICKUP_SPAWNING,
  PLAYER_FLIGHT,
  PLAYER_WEAPON,
  advanceBasicEnemies,
  advanceEnemyProjectiles,
  advancePickups,
  advanceRunClock,
  advanceTimedBuffs,
  applyDestroyedEnemyRewards,
  applyLocalRecordContext,
  applyPickupBuff,
  applyPlayerDamage,
  createBasicEnemyProjectile,
  createBossEnemySpawn,
  createBossWarningState,
  createBossHpHudState,
  createEnemySpawn,
  createHudValues,
  createPickupSpawn,
  createPlayerProjectiles,
  createResultsTitle,
  createResultsValues,
  createRunBaseline,
  createSpawnRandomizationState,
  createRunClock,
  createRunStats,
  createTutorialContent,
  createPauseMenuContent,
  clearTutorialReplayRequested,
  enableAudioOnLaunch,
  getEnemyClass,
  getRunEndReason,
  loadSettings,
  markTutorialReplayRequested,
  markTutorialSeen,
  markTutorialSkipped,
  persistCompletedRun,
  resetLocalRecords,
  resolveEscapedEnemyHits,
  resolveEnemyPlayerHits,
  resolveEnemyTypeForSpawn,
  resolvePlayerPickupHits,
  resolvePlayerProjectileEnemyHits,
  resolvePlayerVelocity,
  saveSettings,
  shouldAutoFire,
  shouldPersistRunOutcome,
  shouldShowTutorialOnLaunch,
  shouldBasicEnemyFire,
  shouldShowBossWarning,
  shouldSpawnBasicEnemy,
  shouldSpawnBoss,
  shouldSpawnPickup,
  toggleAudioEnabled,
  toggleFullscreenEnabled
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

const RUNTIME_VISUAL_ASSETS = {
  'gameplay-background': '../../assets/runtime/art/backgrounds/background_sky_1672x941.png',
  'cloud-layer': '../../assets/runtime/art/backgrounds/background_cloud_layer.png',
  'player-ship': '../../assets/runtime/art/player/player_ship.png',
  'enemy-basic': '../../assets/runtime/art/enemies/enemy_basic.png',
  'enemy-elite': '../../assets/runtime/art/enemies/enemy_elite.png',
  'enemy-boss': '../../assets/runtime/art/enemies/enemy_boss.png',
  'player-projectile': '../../assets/runtime/art/projectiles/projectile_player_bolt.png',
  'enemy-projectile': '../../assets/runtime/art/projectiles/projectile_enemy_orb.png',
  'pickup-power': '../../assets/runtime/art/pickups/pickup_power..png',
  'pickup-shield': '../../assets/runtime/art/pickups/pickup_shield.png',
  'hit-spark': '../../assets/runtime/art/fx/fx_hit_spark.png',
  'button-primary': '../../assets/runtime/art/ui/ui_button_primary.png',
  'life-icon': '../../assets/runtime/art/ui/ui_life_icon.png',
  'hud-panel': '../../assets/runtime/art/ui/ui_panel_hud.png',
  'title-plate': '../../assets/runtime/art/ui/ui_title_plate.png'
};

const RUNTIME_SPRITESHEET_ASSETS = {
  'boss-explosion': {
    path: '../../assets/runtime/art/fx/fx_explosion_spritesheet.png',
    config: { frameWidth: 256, frameHeight: 256 }
  }
};

const RUNTIME_AUDIO_ASSETS = {
  'music-menu': '../../assets/runtime/audio/music_menu_loop.wav',
  'music-run': '../../assets/runtime/audio/music_run_loop.wav',
  'music-boss': '../../assets/runtime/audio/music_boss_loop.wav',
  'ui-select': '../../assets/runtime/audio/ui_select.wav',
  'ui-confirm': '../../assets/runtime/audio/ui_confirm.wav',
  'ui-back': '../../assets/runtime/audio/ui_back.wav',
  'ui-pause-open': '../../assets/runtime/audio/ui_pause_open.wav',
  'player-bolt-fire': '../../assets/runtime/audio/player_bolt_fire.wav',
  'player-bolt-hit': '../../assets/runtime/audio/player_bolt_hit.wav',
  'player-damage': '../../assets/runtime/audio/player_damage.wav',
  'player-destroyed': '../../assets/runtime/audio/player_destroyed.wav',
  'enemy-destroyed-basic': '../../assets/runtime/audio/enemy_destroyed_basic.wav',
  'enemy-destroyed-elite': '../../assets/runtime/audio/enemy_destroyed_elite.wav',
  'boss-warning': '../../assets/runtime/audio/boss_warning.mp3',
  'boss-spawn': '../../assets/runtime/audio/boss_spawn.wav',
  'boss-destroyed': '../../assets/runtime/audio/boss_destroyed.wav',
  'pickup-heal': '../../assets/runtime/audio/pickup_heal.mp3',
  'pickup-power': '../../assets/runtime/audio/pickup_power.wav',
  'pickup-shield-sound': '../../assets/runtime/audio/pickup_shield.mp3'
};

const MUSIC_KEYS = ['music-menu', 'music-run', 'music-boss'];

const loadRuntimeVisualAssets = (scene) => {
  Object.entries(RUNTIME_VISUAL_ASSETS).forEach(([key, path]) => {
    if (!scene.textures.exists(key)) {
      scene.load.image(key, path);
    }
  });

  Object.entries(RUNTIME_SPRITESHEET_ASSETS).forEach(([key, asset]) => {
    if (!scene.textures.exists(key)) {
      scene.load.spritesheet(key, asset.path, asset.config);
    }
  });
};

const loadRuntimeAudioAssets = (scene) => {
  Object.entries(RUNTIME_AUDIO_ASSETS).forEach(([key, path]) => {
    if (!scene.cache.audio.exists(key)) {
      scene.load.audio(key, path);
    }
  });
};

const playRuntimeSound = (scene, key, config = {}) => {
  if (!loadSettings().audioEnabled || !scene.cache.audio.exists(key)) {
    return;
  }

  try {
    scene.sound.play(key, { volume: 0.42, ...config });
  } catch {
    // Audio playback can be locked or unavailable in smoke-test environments.
  }
};

const playRuntimeMusic = (scene, key) => {
  try {
    if (!loadSettings().audioEnabled) {
      MUSIC_KEYS.forEach((musicKey) => scene.sound.stopByKey(musicKey));
      return;
    }

    if (!scene.cache.audio.exists(key) || scene.sound.get(key)?.isPlaying) {
      return;
    }

    MUSIC_KEYS.forEach((musicKey) => {
      if (musicKey !== key) {
        scene.sound.stopByKey(musicKey);
      }
    });
    scene.sound.play(key, { loop: true, volume: key === 'music-boss' ? 0.34 : 0.26 });
  } catch {
    // Audio playback can be locked or unavailable in smoke-test environments.
  }
};

const enemyAssetKeyFor = (enemyType) => {
  if (enemyType === 'elite') {
    return 'enemy-elite';
  }

  if (enemyType === 'boss-class') {
    return 'enemy-boss';
  }

  return 'enemy-basic';
};

const pickupAssetKeyFor = (pickupType) => {
  if (pickupType === 'healing' || pickupType === 'shield') {
    return 'pickup-shield';
  }

  return 'pickup-power';
};

const enemyDisplayScaleFor = (enemyType) => {
  if (enemyType === 'elite') {
    return { width: 3.2, height: 2.8 };
  }

  if (enemyType === 'boss-class') {
    return { width: 3.6, height: 2.6 };
  }

  return { width: 2.7, height: 2.5 };
};

const enemyDestroyedSoundKeyFor = (enemyType) => {
  if (enemyType === 'elite') {
    return 'enemy-destroyed-elite';
  }

  if (enemyType === 'boss-class') {
    return 'boss-destroyed';
  }

  return 'enemy-destroyed-basic';
};

const pickupSoundKeyFor = (pickupType) => {
  if (pickupType === 'healing') {
    return 'pickup-heal';
  }

  if (pickupType === 'shield') {
    return 'pickup-shield-sound';
  }

  return 'pickup-power';
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
  settingsButtonY: 548,
  startButtonY: 616
};

class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    enableAudioOnLaunch();

    if (shouldShowTutorialOnLaunch()) {
      this.scene.start('tutorial');
      return;
    }

    this.scene.start('main-menu');
  }
}

class TutorialScene extends Phaser.Scene {
  constructor() {
    super('tutorial');
    this.returnScene = 'main-menu';
  }

  preload() {
    loadRuntimeVisualAssets(this);
    loadRuntimeAudioAssets(this);
  }

  create(data = {}) {
    const root = document.querySelector('#game-root');
    const tutorialContent = createTutorialContent();
    this.returnScene = data.returnScene ?? 'main-menu';

    this.cameras.main.setBackgroundColor('#09111f');
    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 760, 520, 0x071827, 0.74)
      .setStrokeStyle(1, 0x3db7ff, 0.52);
    this.add.text(this.scale.width / 2, 126, tutorialContent.title, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
      color: '#f8fbff',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 5
    }).setOrigin(0.5);
    this.add.text(this.scale.width / 2, 246, tutorialContent.controls, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#9ed7ff',
      align: 'center',
      wordWrap: { width: 620 },
      lineSpacing: 8
    }).setOrigin(0.5);
    this.add.text(this.scale.width / 2, 378, tutorialContent.goal, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      color: '#ffd166',
      align: 'center',
      wordWrap: { width: 620 },
      lineSpacing: 8
    }).setOrigin(0.5);

    this.createTutorialButton(this.scale.width / 2, 506, 'Continue', () => this.continueTutorial());
    this.createTutorialButton(this.scale.width / 2, 592, 'Skip Tutorial', () => this.skipTutorial());

    root.dataset.screen = 'tutorial';
    root.dataset.tutorialReplay = String(Boolean(data.replay));
    root.dataset.tutorialTitle = tutorialContent.title;
    root.dataset.tutorialControls = tutorialContent.controls;
    root.dataset.tutorialGoal = tutorialContent.goal;
  }

  continueTutorial() {
    markTutorialSeen();
    this.scene.start(this.returnScene);
  }

  skipTutorial() {
    markTutorialSkipped();
    this.scene.start(this.returnScene);
  }

  createTutorialButton(x, y, labelText, action) {
    const plate = this.add.image(x, y, 'button-primary')
      .setDisplaySize(220, 62);
    const hitArea = this.add.rectangle(x, y, 220, 62, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y - 1, labelText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ffd166',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 4
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const invoke = () => {
      playRuntimeSound(this, labelText === 'Skip Tutorial' ? 'ui-back' : 'ui-confirm');
      action();
    };

    hitArea.on('pointerdown', invoke);
    label.on('pointerdown', invoke);

    return { plate, hitArea, label };
  }
}

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('main-menu');
    this.selectedRunLengthMinutes = 1;
    this.selectedDifficulty = 'normal';
  }

  preload() {
    this.load.image('menu-background', MENU_ASSETS.background);
    loadRuntimeVisualAssets(this);
    loadRuntimeAudioAssets(this);
  }

  create() {
    this.cameras.main.setBackgroundColor('#09111f');

    const contentX = MENU_LAYOUT.contentX;
    const centerX = this.scale.width / 2;
    const root = document.querySelector('#game-root');

    playRuntimeMusic(this, 'music-menu');
    this.add.image(centerX, this.scale.height / 2, 'menu-background')
      .setDisplaySize(this.scale.width, this.scale.height);
    this.add.rectangle(300, this.scale.height / 2, 600, this.scale.height, 0x04101d, 0.5);
    this.add.rectangle(centerX, this.scale.height / 2, this.scale.width, this.scale.height, 0x06111f, 0.12);
    this.add.line(0, 0, 602, 0, 602, this.scale.height, 0x3db7ff, 0.28)
      .setOrigin(0, 0);

    this.add.image(contentX, MENU_LAYOUT.titleY, 'title-plate')
      .setDisplaySize(470, 94);

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

    const settingsButton = this.createSecondaryButton(contentX, MENU_LAYOUT.settingsButtonY, 'Settings');
    const openSettings = () => {
      playRuntimeSound(this, 'ui-confirm');
      this.scene.start('settings');
    };

    settingsButton.hitArea.on('pointerdown', openSettings);
    settingsButton.label.on('pointerdown', openSettings);

    const startRunButton = this.createActionButton(contentX, MENU_LAYOUT.startButtonY, 'Start Run');

    const startRun = () => {
      playRuntimeSound(this, 'ui-confirm');
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
    const plate = this.add.image(x, y, 'button-primary')
      .setDisplaySize(220, 62);
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

  createSecondaryButton(x, y, labelText) {
    const plate = this.add.rectangle(x, y, 220, 44, 0x0b2234, 0.72)
      .setStrokeStyle(1, 0x3db7ff, 0.6);
    const hitArea = this.add.rectangle(x, y, 220, 44, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y, labelText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#9ed7ff',
      align: 'center',
      stroke: '#071827',
      strokeThickness: 3
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
      if (isSelected) {
        playRuntimeSound(this, 'ui-select', { volume: 0.18 });
      }
    });
  }
}

class SettingsScene extends Phaser.Scene {
  constructor() {
    super('settings');
    this.settings = null;
    this.root = null;
    this.statusText = null;
    this.audioButton = null;
    this.fullscreenButton = null;
  }

  preload() {
    loadRuntimeVisualAssets(this);
    loadRuntimeAudioAssets(this);
  }

  create() {
    this.root = document.querySelector('#game-root');
    this.settings = loadSettings();

    playRuntimeMusic(this, 'music-menu');
    this.cameras.main.setBackgroundColor('#09111f');
    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 640, 560, 0x071827, 0.72)
      .setStrokeStyle(1, 0x3db7ff, 0.48);
    this.add.text(this.scale.width / 2, 104, 'Settings', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
      color: '#f8fbff',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.audioButton = this.createSettingsButton(440, 210, this.getAudioLabel(), () => {
      this.settings = saveSettings({ settings: toggleAudioEnabled(this.settings) });
      this.refreshSettingsDisplay('Audio preference updated');
    });
    this.fullscreenButton = this.createSettingsButton(840, 210, this.getFullscreenLabel(), () => {
      this.settings = saveSettings({ settings: toggleFullscreenEnabled(this.settings) });
      this.applyFullscreenPreference();
      this.refreshSettingsDisplay('Fullscreen preference updated');
    });
    this.createSettingsButton(440, 330, 'Replay Tutorial', () => {
      this.settings = saveSettings({ settings: markTutorialReplayRequested(this.settings) });
      this.refreshSettingsDisplay('Tutorial replay queued');
      this.settings = saveSettings({ settings: clearTutorialReplayRequested(this.settings) });
      this.scene.start('tutorial', { returnScene: 'settings', replay: true });
    });
    this.createSettingsButton(840, 330, 'Reset Records', () => {
      resetLocalRecords();
      this.root.dataset.recordsReset = 'true';
      this.refreshSettingsDisplay('Local records reset');
    });
    this.createSettingsButton(640, 510, 'Back', () => this.scene.start('main-menu'), { soundKey: 'ui-back' });

    this.statusText = this.add.text(this.scale.width / 2, 424, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#9ed7ff',
      align: 'center'
    }).setOrigin(0.5);

    this.root.dataset.screen = 'settings';
    this.root.dataset.recordsReset = 'false';
    this.refreshSettingsDisplay('Adjust desktop preferences');
  }

  createSettingsButton(x, y, labelText, action, { soundKey = 'ui-confirm' } = {}) {
    const plate = this.add.rectangle(x, y, 280, 68, 0x0b2234, 0.78)
      .setStrokeStyle(1, 0x3db7ff, 0.66);
    const hitArea = this.add.rectangle(x, y, 280, 68, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y, labelText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#f8fbff',
      align: 'center',
      stroke: '#071827',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const invoke = () => {
      playRuntimeSound(this, soundKey);
      action();
    };

    hitArea.on('pointerdown', invoke);
    label.on('pointerdown', invoke);

    return { plate, hitArea, label };
  }

  getAudioLabel() {
    return `Audio ${this.settings.audioEnabled ? 'On' : 'Off'}`;
  }

  getFullscreenLabel() {
    return `Fullscreen ${this.settings.fullscreenEnabled ? 'On' : 'Off'}`;
  }

  applyFullscreenPreference() {
    if (this.settings.fullscreenEnabled && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    if (!this.settings.fullscreenEnabled && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  refreshSettingsDisplay(statusText) {
    this.audioButton.label.setText(this.getAudioLabel());
    this.fullscreenButton.label.setText(this.getFullscreenLabel());
    this.statusText?.setText(statusText);
    this.root.dataset.audioEnabled = String(this.settings.audioEnabled);
    this.root.dataset.fullscreenEnabled = String(this.settings.fullscreenEnabled);
    this.root.dataset.tutorialReplayRequested = String(this.settings.tutorialReplayRequested);
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
    this.lastFiredMs = -PLAYER_WEAPON.fireIntervalMs;
    this.lastEnemySpawnedMs = -BASIC_ENEMY.spawnIntervalMs;
    this.lastPickupSpawnedMs = -PICKUP_SPAWNING.spawnIntervalMs;
    this.enemySpawnCount = 0;
    this.pickupSpawnCount = 0;
    this.runBaseline = null;
    this.runClock = null;
    this.runStats = null;
    this.spawnRandomization = null;
    this.hudText = null;
    this.bossHpHudText = null;
    this.bossWarningText = null;
    this.bossWarningDetailText = null;
    this.bossWarningShown = false;
    this.bossSpawned = false;
    this.bossExplosionPending = false;
    this.pauseOverlay = [];
    this.pauseKey = null;
    this.paused = false;
    this.root = null;
    this.selectedRunLengthMinutes = 1;
    this.selectedDifficulty = 'normal';
  }

  resetRunState() {
    this.player = null;
    this.cursorKeys = null;
    this.wasdKeys = null;
    this.projectiles = [];
    this.enemies = [];
    this.enemyProjectiles = [];
    this.pickups = [];
    this.lastFiredMs = -PLAYER_WEAPON.fireIntervalMs;
    this.lastEnemySpawnedMs = -BASIC_ENEMY.spawnIntervalMs;
    this.lastPickupSpawnedMs = -PICKUP_SPAWNING.spawnIntervalMs;
    this.enemySpawnCount = 0;
    this.pickupSpawnCount = 0;
    this.runBaseline = null;
    this.runClock = null;
    this.runStats = null;
    this.spawnRandomization = null;
    this.hudText = null;
    this.bossHpHudText = null;
    this.bossWarningText = null;
    this.bossWarningDetailText = null;
    this.bossWarningShown = false;
    this.bossSpawned = false;
    this.bossExplosionPending = false;
    this.pauseOverlay = [];
    this.pauseKey = null;
    this.paused = false;
    this.root = null;
  }

  preload() {
    loadRuntimeVisualAssets(this);
    loadRuntimeAudioAssets(this);
  }

  create(data) {
    this.resetRunState();

    const runOptions = data.runOptions;
    const root = document.querySelector('#game-root');
    this.root = root;
    this.selectedRunLengthMinutes = runOptions.runLengthMinutes;
    this.selectedDifficulty = runOptions.difficulty;
    this.bossWarningShown = false;
    this.bossSpawned = false;
    this.bossExplosionPending = false;
    this.runBaseline = createRunBaseline({ difficulty: runOptions.difficulty });
    this.runClock = createRunClock({ runLengthMinutes: runOptions.runLengthMinutes });
    this.runStats = applyLocalRecordContext({
      stats: createRunStats(),
      runLengthMinutes: runOptions.runLengthMinutes,
      difficulty: runOptions.difficulty
    });
    this.spawnRandomization = createSpawnRandomizationState();

    playRuntimeMusic(this, 'music-run');
    this.cameras.main.setBackgroundColor('#09111f');
    this.createBossExplosionAnimation();
    this.createGameplayBackdrop();

    this.player = this.add.image(
      this.runBaseline.player.startX,
      this.runBaseline.player.startY,
      'player-ship'
    ).setDisplaySize(this.runBaseline.player.radius * 3.2, this.runBaseline.player.radius * 3.2);
    this.player.radius = PLAYER_FLIGHT.radius;

    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.paused) {
        playRuntimeSound(this, 'ui-back');
        this.closePauseMenu();
        return;
      }

      playRuntimeSound(this, 'ui-pause-open');
      this.openPauseMenu();
    });

    this.add.image(HUD_LAYOUT.regularHud.x + 132, HUD_LAYOUT.regularHud.y + 88, 'hud-panel')
      .setDisplaySize(300, 198)
      .setAlpha(0.82);
    this.add.image(HUD_LAYOUT.runSummary.x - 22, HUD_LAYOUT.runSummary.y + 14, 'life-icon')
      .setDisplaySize(28, 28);
    this.add.text(HUD_LAYOUT.runSummary.x, HUD_LAYOUT.runSummary.y, `${runOptions.runLengthMinutes} min / ${runOptions.difficulty}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#9ed7ff',
      align: 'left'
    });
    this.hudText = this.add.text(HUD_LAYOUT.regularHud.x, HUD_LAYOUT.regularHud.y, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#f8fbff',
      align: 'left',
      lineSpacing: 6
    });
    this.bossHpHudText = this.add.text(HUD_LAYOUT.bossHp.x, HUD_LAYOUT.bossHp.y, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffd166',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 4
    }).setOrigin(0.5, 0).setVisible(false);
    this.createBossWarningDisplay();

    root.dataset.screen = 'gameplay';
    root.dataset.runLengthMinutes = String(runOptions.runLengthMinutes);
    root.dataset.difficulty = runOptions.difficulty;
    root.dataset.bossWarning = '';
    root.dataset.bossSpawned = 'false';
    root.dataset.paused = 'false';
    this.updateHud();
  }

  update(_time, delta) {
    if (!this.player || !this.cursorKeys || !this.wasdKeys || this.paused) {
      return;
    }

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

  createGameplayBackdrop() {
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameplay-background')
      .setDisplaySize(this.scale.width, this.scale.height);
    this.add.image(this.scale.width / 2, this.scale.height / 2, 'cloud-layer')
      .setDisplaySize(this.scale.width, this.scale.height)
      .setAlpha(0.54);
  }

  createBossExplosionAnimation() {
    if (this.anims.exists('boss-explosion-flow')) {
      return;
    }

    this.anims.create({
      key: 'boss-explosion-flow',
      frames: this.anims.generateFrameNumbers('boss-explosion', { start: 0, end: 15 }),
      duration: 3000,
      repeat: 0
    });
  }

  openPauseMenu() {
    if (this.paused) {
      return;
    }

    this.paused = true;
    this.root.dataset.paused = 'true';
    this.renderPauseMenu();
  }

  closePauseMenu() {
    this.paused = false;
    this.root.dataset.paused = 'false';
    this.pauseOverlay.forEach((element) => element.destroy());
    this.pauseOverlay = [];
  }

  renderPauseMenu() {
    const settings = loadSettings();
    const content = createPauseMenuContent(settings);
    const centerX = this.scale.width / 2;

    this.pauseOverlay.forEach((element) => element.destroy());
    this.pauseOverlay = [
      this.add.rectangle(centerX, this.scale.height / 2, 620, 560, 0x071827, 0.86)
        .setStrokeStyle(1, 0x3db7ff, 0.52),
      this.add.text(centerX, 118, content.title, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '42px',
        color: '#f8fbff',
        align: 'center',
        stroke: '#0b1c2e',
        strokeThickness: 5
      }).setOrigin(0.5),
      this.add.text(centerX, 448, `Key Reference\n${content.keyReference}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '21px',
        color: '#9ed7ff',
        align: 'center',
        wordWrap: { width: 520 },
        lineSpacing: 8
      }).setOrigin(0.5)
    ];

    [
      ['Continue', () => this.closePauseMenu()],
      ['Restart', () => this.restartRun()],
      ['Return to Menu', () => this.returnToMenu()],
      [content.actions.at(-1), () => this.togglePauseAudio()]
    ].forEach(([labelText, action], index) => {
      const y = 206 + index * 68;
      const plate = this.add.rectangle(centerX, y, 280, 52, 0x0b2234, 0.78)
        .setStrokeStyle(1, 0x3db7ff, 0.66);
      const hitArea = this.add.rectangle(centerX, y, 280, 52, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(centerX, y, labelText, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#f8fbff',
        align: 'center',
        stroke: '#071827',
        strokeThickness: 3
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      const invoke = () => action();

      hitArea.on('pointerdown', invoke);
      label.on('pointerdown', invoke);
      this.pauseOverlay.push(plate, hitArea, label);
    });
  }

  restartRun() {
    this.scene.restart({
      runOptions: {
        runLengthMinutes: this.selectedRunLengthMinutes,
        difficulty: this.selectedDifficulty
      }
    });
  }

  returnToMenu() {
    this.scene.start('main-menu');
  }

  togglePauseAudio() {
    const settings = saveSettings({ settings: toggleAudioEnabled(loadSettings()) });

    this.root.dataset.audioEnabled = String(settings.audioEnabled);
    this.renderPauseMenu();
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

    playRuntimeSound(this, 'boss-warning', { volume: 0.55 });
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
    this.root.dataset.bestScore = hudValues.bestScore === 'Best —' ? '' : hudValues.bestScore.replace('Best ', '');
    this.root.dataset.hudWeapon = hudValues.weapon;
    this.root.dataset.hudBuff = hudValues.buff;
    this.root.dataset.hudPickups = hudValues.pickups;
    this.root.dataset.hudBestScore = hudValues.bestScore;
  }

  updateBossHpHud() {
    const bossHpHud = createBossHpHudState({ enemies: this.enemies });

    this.bossHpHudText.setText(bossHpHud.text).setVisible(bossHpHud.visible);
    this.root.dataset.bossHpHudVisible = String(bossHpHud.visible);
    this.root.dataset.bossHpCurrent = String(bossHpHud.currentHealth);
    this.root.dataset.bossHpMax = String(bossHpHud.maxHealth);
    this.root.dataset.bossHpText = bossHpHud.text;
  }

  applyDamage(damage) {
    playRuntimeSound(this, 'player-damage');
    this.runStats = applyPlayerDamage({ stats: this.runStats, damage });
    this.updateHud();
    this.endRunIfNeeded();
  }

  applyPickup(pickupType) {
    playRuntimeSound(this, pickupSoundKeyFor(pickupType));
    this.runStats = applyPickupBuff({ stats: this.runStats, pickupType });
    this.updateHud();
  }

  endRunIfNeeded() {
    if (this.bossExplosionPending) {
      return;
    }

    const endReason = getRunEndReason({ clock: this.runClock, stats: this.runStats, enemies: this.enemies });

    if (endReason) {
      if (endReason === 'health-depleted') {
        playRuntimeSound(this, 'player-destroyed', { volume: 0.55 });
      }
      if (shouldPersistRunOutcome({ endReason })) {
        persistCompletedRun({
          runLengthMinutes: this.selectedRunLengthMinutes,
          difficulty: this.selectedDifficulty,
          endReason,
          clock: this.runClock,
          stats: this.runStats
        });
      }
      this.scene.start('results', {
        endReason,
        runClock: this.runClock,
        runStats: this.runStats,
        runOptions: {
          runLengthMinutes: this.selectedRunLengthMinutes,
          difficulty: this.selectedDifficulty
        }
      });
    }
  }

  spawnPlayerProjectile() {
    const projectiles = createPlayerProjectiles({
      player: { x: this.player.x, y: this.player.y, radius: PLAYER_FLIGHT.radius },
      stats: this.runStats
    }).map((projectileState) => {
      const projectile = this.add.image(projectileState.x, projectileState.y, 'player-projectile')
        .setDisplaySize(projectileState.radius * 5, projectileState.radius * 10);

      return Object.assign(projectile, projectileState);
    });

    if (projectiles.length > 0) {
      playRuntimeSound(this, 'player-bolt-fire', { volume: 0.16 });
    }
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

      if (pickup.y > GAMEPLAY_PLAYFIELD.height + pickup.radius) {
        pickup.sprite.destroy();
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
      }
    });

    this.runStats = result.stats;
    this.pickups = result.pickups;
    this.root.dataset.pickupCount = String(this.pickups.length);

    if (result.collectedPickups.length > 0) {
      result.collectedPickups.forEach((pickup) => playRuntimeSound(this, pickupSoundKeyFor(pickup.type)));
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
      }
    });

    this.projectiles = result.projectiles;
    this.enemies = result.enemies;

    if (result.damageDealt > 0) {
      playRuntimeSound(this, 'player-bolt-hit', { volume: 0.2 });
    }

    if (result.destroyedEnemies.length > 0) {
      result.destroyedEnemies.forEach((enemy) => playRuntimeSound(this, enemyDestroyedSoundKeyFor(enemy.type)));
      result.destroyedEnemies.forEach((enemy) => this.playEnemyDestroyedEffect(enemy));
      this.runStats = applyDestroyedEnemyRewards({
        stats: this.runStats,
        destroyedEnemies: result.destroyedEnemies,
        damageDealt: result.damageDealt,
        difficulty: this.selectedDifficulty
      });
      this.updateHud();
      this.updateBossHpHud();
      if (result.destroyedEnemies.some((enemy) => enemy.type === 'boss-class')) {
        return;
      }
    } else if (result.damageDealt > 0) {
      this.updateBossHpHud();
    }

    this.root.dataset.enemyCount = String(this.enemies.length);
  }

  playEnemyDestroyedEffect(enemy) {
    if (enemy.type === 'boss-class') {
      this.spawnBossExplosion(enemy);
      return;
    }

    this.spawnHitSpark(enemy);
  }

  spawnHitSpark(enemy) {
    const spark = this.add.image(enemy.x, enemy.y, 'hit-spark')
      .setDisplaySize(96, 96)
      .setAlpha(0.9);

    this.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 1.35,
      duration: 1000,
      onComplete: () => spark.destroy()
    });
  }

  spawnBossExplosion(enemy) {
    if (this.bossExplosionPending) {
      return;
    }

    this.bossExplosionPending = true;
    const explosion = this.add.sprite(enemy.x, enemy.y, 'boss-explosion')
      .setDisplaySize(300, 300)
      .setDepth(10);

    explosion.once('animationcomplete', () => {
      explosion.destroy();
      this.time.delayedCall(2000, () => this.finishBossExplosion());
    });
    explosion.play('boss-explosion-flow');
  }

  finishBossExplosion() {
    this.bossExplosionPending = false;
    this.endRunIfNeeded();
  }

  spawnBasicEnemy() {
    const enemyType = resolveEnemyTypeForSpawn({ spawnIndex: this.enemySpawnCount, spawnRandomization: this.spawnRandomization });
    const enemy = createEnemySpawn({
      spawnIndex: this.enemySpawnCount,
      enemyType,
      spawnRandomization: this.spawnRandomization
    });

    this.addEnemy(enemy);
    this.enemySpawnCount += 1;
  }

  spawnBossEnemy() {
    this.bossSpawned = true;
    playRuntimeMusic(this, 'music-boss');
    playRuntimeSound(this, 'boss-spawn', { volume: 0.58 });
    this.addEnemy(createBossEnemySpawn({ spawnIndex: 0 }));
    this.root.dataset.bossSpawned = 'true';
    this.updateBossHpHud();
  }

  addEnemy(enemy) {
    const enemyClass = getEnemyClass(enemy.type);
    const displayScale = enemyDisplayScaleFor(enemy.type);
    const sprite = this.add.image(enemy.x, enemy.y, enemyAssetKeyFor(enemy.type))
      .setDisplaySize(enemyClass.radius * displayScale.width, enemyClass.radius * displayScale.height);

    this.enemies.push({ ...enemy, sprite });
    this.root.dataset.enemyCount = String(this.enemies.length);
  }

  spawnPickup() {
    const pickup = createPickupSpawn({ spawnIndex: this.pickupSpawnCount, spawnRandomization: this.spawnRandomization });
    const sprite = this.add.image(pickup.x, pickup.y, pickupAssetKeyFor(pickup.type))
      .setDisplaySize(pickup.radius * 3, pickup.radius * 3);

    this.pickups.push({ ...pickup, sprite });
    this.pickupSpawnCount += 1;
    this.root.dataset.pickupCount = String(this.pickups.length);
  }

  updateEnemies(deltaSeconds, elapsedMs) {
    const advancedEnemies = advanceBasicEnemies({ enemies: this.enemies, deltaSeconds });

    advancedEnemies.forEach((enemy) => {
      enemy.sprite.x = enemy.x;
      enemy.sprite.y = enemy.y;
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
    const sprite = this.add.image(projectile.x, projectile.y, 'enemy-projectile')
      .setDisplaySize(projectile.radius * 5, projectile.radius * 5);

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
    this.runOptions = null;
  }

  create(data) {
    const root = document.querySelector('#game-root');

    this.runOptions = data.runOptions;
    const resultsTitle = createResultsTitle({ endReason: data.endReason });
    const resultsValues = createResultsValues({ clock: data.runClock, stats: data.runStats });

    this.cameras.main.setBackgroundColor('#09111f');
    this.add.text(this.scale.width / 2, 150, resultsTitle, {
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

    this.createResultsButton(this.scale.width / 2 - 380, 380, 'Main Menu', () => this.returnToMenu());
    this.createResultsButton(this.scale.width / 2 + 380, 380, 'Replay', () => this.replayRun());

    root.dataset.screen = 'results';
    root.dataset.bossHpHudVisible = 'false';
    root.dataset.endReason = data.endReason;
    root.dataset.resultsTitle = resultsTitle;
    root.dataset.resultsScore = String(data.runStats.score);
    root.dataset.resultsKills = String(data.runStats.kills);
    root.dataset.resultsBossesDefeated = String(data.runStats.bossesDefeated);
    root.dataset.resultsTimeSurvived = resultsValues.timeSurvived.replace('Time Survived ', '');
    root.dataset.resultsPickups = String(data.runStats.pickups);
    root.dataset.resultsShotsFired = String(data.runStats.shotsFired);
    root.dataset.resultsDamageDealt = String(data.runStats.damageDealt);
    root.dataset.resultsDamageBoosted = String(data.runStats.damageBoosted);
    root.dataset.resultsShieldBlocked = String(data.runStats.shieldBlocked);
    root.dataset.resultsWeaponShape = data.runStats.weaponName;
    root.dataset.resultsBestScore = data.runStats.bestScore === null ? '' : String(data.runStats.bestScore);
    root.dataset.resultsLocalRecord = String(Math.max(data.runStats.score, data.runStats.bestScore ?? 0));
    root.dataset.resultsReplayRunLengthMinutes = String(this.runOptions.runLengthMinutes);
    root.dataset.resultsReplayDifficulty = this.runOptions.difficulty;
    root.dataset.resultsActions = 'Main Menu,Replay';
  }

  returnToMenu() {
    this.scene.start('main-menu');
  }

  replayRun() {
    this.scene.start('gameplay', {
      runOptions: this.runOptions
    });
  }

  createResultsButton(x, y, labelText, action) {
    const plate = this.add.rectangle(x, y, 280, 56, 0x0b2234, 0.78)
      .setStrokeStyle(1, 0x3db7ff, 0.66);
    const hitArea = this.add.rectangle(x, y, 280, 56, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y, labelText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#f8fbff',
      align: 'center',
      stroke: '#071827',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const invoke = () => action();

    hitArea.on('pointerdown', invoke);
    label.on('pointerdown', invoke);

    return { plate, hitArea, label };
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAMEPLAY_PLAYFIELD.width,
  height: GAMEPLAY_PLAYFIELD.height,
  backgroundColor: '#09111f',
  scene: [BootScene, TutorialScene, MainMenuScene, SettingsScene, GameplayScene, ResultsScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

globalThis.__thunderboltFighterGame = new Phaser.Game(config);
