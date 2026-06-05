import * as Phaser from '../../node_modules/phaser/dist/phaser.esm.js';

const RUN_LENGTH_OPTIONS = [
  { label: '1 min', runLengthMinutes: 1, xOffset: -144 },
  { label: '3 min', runLengthMinutes: 3, xOffset: 0 },
  { label: '5 min', runLengthMinutes: 5, xOffset: 144 }
];

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('main-menu');
    this.selectedRunLengthMinutes = 1;
  }

  create() {
    this.cameras.main.setBackgroundColor('#09111f');

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const root = document.querySelector('#game-root');

    this.add.text(centerX, centerY - 112, 'Thunderbolt Fighter', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '56px',
      color: '#f8fbff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 24, 'Main Menu', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#9ed7ff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 52, 'Run Length', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#9ed7ff',
      align: 'center'
    }).setOrigin(0.5);

    const runLengthButtons = RUN_LENGTH_OPTIONS.map((option) => this.createRunLengthButton(centerX + option.xOffset, centerY + 108, option));

    const updateRunLengthSelection = (runLengthMinutes) => {
      this.selectedRunLengthMinutes = runLengthMinutes;
      root.dataset.runLengthMinutes = String(runLengthMinutes);

      runLengthButtons.forEach(({ option, plate, label }) => {
        const isSelected = option.runLengthMinutes === runLengthMinutes;
        plate.setFillStyle(isSelected ? 0x1f8dd6 : 0x18263d, 1);
        plate.setStrokeStyle(2, isSelected ? 0xffd166 : 0x46627f);
        label.setColor(isSelected ? '#f8fbff' : '#9ed7ff');
      });
    };

    runLengthButtons.forEach(({ option, plate, label }) => {
      plate.on('pointerdown', () => updateRunLengthSelection(option.runLengthMinutes));
      label.on('pointerdown', () => updateRunLengthSelection(option.runLengthMinutes));
    });

    this.add.text(centerX, centerY + 204, 'Start Run', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#ffd166',
      align: 'center'
    }).setOrigin(0.5);

    root.dataset.screen = 'main-menu';
    root.dataset.title = 'Thunderbolt Fighter';
    updateRunLengthSelection(this.selectedRunLengthMinutes);
  }

  createRunLengthButton(x, y, option) {
    const plate = this.add.rectangle(x, y, 112, 52, 0x18263d, 1)
      .setStrokeStyle(2, 0x46627f)
      .setInteractive({ useHandCursor: true });

    const label = this.add.text(x, y, option.label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#9ed7ff',
      align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    return { option, plate, label };
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 1280,
  height: 720,
  backgroundColor: '#09111f',
  scene: [MainMenuScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
