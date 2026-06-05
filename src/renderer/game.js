import * as Phaser from '../../node_modules/phaser/dist/phaser.esm.js';
import { GAMEPLAY_PLAYFIELD } from './gameplay-state.js';

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
  width: GAMEPLAY_PLAYFIELD.width,
  height: GAMEPLAY_PLAYFIELD.height,
  backgroundColor: '#09111f',
  scene: [MainMenuScene, GameplayScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
