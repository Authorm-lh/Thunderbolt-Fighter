import * as Phaser from '../../node_modules/phaser/dist/phaser.esm.js';

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('main-menu');
  }

  create() {
    this.cameras.main.setBackgroundColor('#09111f');

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

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

    this.add.text(centerX, centerY + 76, 'Start Run', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#ffd166',
      align: 'center'
    }).setOrigin(0.5);

    const root = document.querySelector('#game-root');
    root.dataset.screen = 'main-menu';
    root.dataset.title = 'Thunderbolt Fighter';
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
