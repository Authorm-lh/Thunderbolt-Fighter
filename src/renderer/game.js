import * as Phaser from '../../node_modules/phaser/dist/phaser.esm.js';

const RUN_LENGTH_OPTIONS = [
  { label: '1 min', runLengthMinutes: 1, xOffset: -144 },
  { label: '3 min', runLengthMinutes: 3, xOffset: 0 },
  { label: '5 min', runLengthMinutes: 5, xOffset: 144 }
];

const DIFFICULTY_OPTIONS = [
  { label: 'Simple', difficulty: 'simple', xOffset: -144 },
  { label: 'Normal', difficulty: 'normal', xOffset: 0 },
  { label: 'Hard', difficulty: 'hard', xOffset: 144 }
];

const MENU_ASSETS = {
  background: '../../assets/runtime/art/backgrounds/background_sky_1672x941.png',
  clouds: '../../assets/runtime/art/backgrounds/background_cloud_layer.png',
  titlePlate: '../../assets/runtime/art/ui/ui_title_plate.png',
  panel: '../../assets/runtime/art/ui/ui_panel_hud.png',
  button: '../../assets/runtime/art/ui/ui_button_primary.png'
};

const MENU_LAYOUT = {
  titleY: 116,
  mainMenuY: 238,
  panelY: 424,
  runLengthY: 330,
  runLengthButtonY: 384,
  difficultyY: 472,
  difficultyButtonY: 526,
  startButtonY: 638
};

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('main-menu');
    this.selectedRunLengthMinutes = 1;
    this.selectedDifficulty = 'normal';
  }

  preload() {
    this.load.image('menu-background', MENU_ASSETS.background);
    this.load.image('menu-clouds', MENU_ASSETS.clouds);
    this.load.image('menu-title-plate', MENU_ASSETS.titlePlate);
    this.load.image('menu-panel', MENU_ASSETS.panel);
    this.load.image('menu-button', MENU_ASSETS.button);
  }

  create() {
    this.cameras.main.setBackgroundColor('#09111f');

    const centerX = this.scale.width / 2;
    const root = document.querySelector('#game-root');

    this.add.image(centerX, this.scale.height / 2, 'menu-background')
      .setDisplaySize(this.scale.width, this.scale.height);
    this.add.image(centerX, 210, 'menu-clouds')
      .setAlpha(0.42)
      .setDisplaySize(this.scale.width, 320);
    this.add.rectangle(centerX, this.scale.height / 2, this.scale.width, this.scale.height, 0x06111f, 0.34);

    this.add.image(centerX, MENU_LAYOUT.titleY, 'menu-title-plate')
      .setDisplaySize(670, 150)
      .setAlpha(0.96);

    this.add.text(centerX, MENU_LAYOUT.titleY - 8, 'Thunderbolt Fighter', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '56px',
      color: '#f8fbff',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.image(centerX, MENU_LAYOUT.panelY, 'menu-panel')
      .setDisplaySize(700, 360)
      .setAlpha(0.94);
    this.add.rectangle(centerX, MENU_LAYOUT.panelY, 640, 310, 0x071827, 0.42)
      .setStrokeStyle(1, 0x3db7ff, 0.44);

    this.add.text(centerX, MENU_LAYOUT.mainMenuY, 'Main Menu', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      color: '#f8fbff',
      align: 'center',
      stroke: '#0b1c2e',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(centerX, MENU_LAYOUT.runLengthY, 'Run Length', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#9ed7ff',
      align: 'center'
    }).setOrigin(0.5);

    const runLengthButtons = RUN_LENGTH_OPTIONS.map((option) => this.createOptionButton(centerX + option.xOffset, MENU_LAYOUT.runLengthButtonY, option.label));

    const updateRunLengthSelection = (runLengthMinutes) => {
      this.selectedRunLengthMinutes = runLengthMinutes;
      root.dataset.runLengthMinutes = String(runLengthMinutes);
      this.updateSelectedButton(runLengthButtons, (option) => option.runLengthMinutes === runLengthMinutes);
    };

    this.bindOptionButtons(runLengthButtons, RUN_LENGTH_OPTIONS, (option) => updateRunLengthSelection(option.runLengthMinutes));

    this.add.text(centerX, MENU_LAYOUT.difficultyY, 'Difficulty', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#9ed7ff',
      align: 'center'
    }).setOrigin(0.5);

    const difficultyButtons = DIFFICULTY_OPTIONS.map((option) => this.createOptionButton(centerX + option.xOffset, MENU_LAYOUT.difficultyButtonY, option.label));

    const updateDifficultySelection = (difficulty) => {
      this.selectedDifficulty = difficulty;
      root.dataset.difficulty = difficulty;
      this.updateSelectedButton(difficultyButtons, (option) => option.difficulty === difficulty);
    };

    this.bindOptionButtons(difficultyButtons, DIFFICULTY_OPTIONS, (option) => updateDifficultySelection(option.difficulty));

    const startRunButton = this.createActionButton(centerX, MENU_LAYOUT.startButtonY, 'Start Run');

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
    const plate = this.add.image(x, y, 'menu-button')
      .setDisplaySize(124, 56)
      .setAlpha(0.84);
    const hitArea = this.add.rectangle(x, y, 124, 56, 0x000000, 0)
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

  createActionButton(x, y, labelText) {
    const plate = this.add.image(x, y, 'menu-button')
      .setDisplaySize(238, 72)
      .setAlpha(0.96);
    const hitArea = this.add.rectangle(x, y, 238, 72, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y - 1, labelText, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
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
      plate.setAlpha(isSelected ? 1 : 0.74);
      plate.setTint(isSelected ? 0xffffff : 0x79b8d9);
      label.setColor(isSelected ? '#f8fbff' : '#9ed7ff');
    });
  }
}

class GameplayScene extends Phaser.Scene {
  constructor() {
    super('gameplay');
  }

  create(data) {
    const runOptions = data.runOptions;
    const root = document.querySelector('#game-root');

    this.cameras.main.setBackgroundColor('#09111f');

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.text(centerX, centerY - 52, 'Run In Progress', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
      color: '#f8fbff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 24, `${runOptions.runLengthMinutes} min / ${runOptions.difficulty}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      color: '#9ed7ff',
      align: 'center'
    }).setOrigin(0.5);

    root.dataset.screen = 'gameplay';
    root.dataset.runLengthMinutes = String(runOptions.runLengthMinutes);
    root.dataset.difficulty = runOptions.difficulty;
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 1280,
  height: 720,
  backgroundColor: '#09111f',
  scene: [MainMenuScene, GameplayScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
