import Phaser from 'phaser';

class FirstPlayableScene extends Phaser.Scene {
  constructor() {
    super('first-playable');
  }

  create() {
    this.cameras.main.setBackgroundColor('#09111f');

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add.text(centerX, centerY - 96, 'Thunderbolt Fighter', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '56px',
      color: '#f8fbff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 16, 'Arcade flight combat shell', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#9ed7ff',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY + 76, 'Press Start', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#ffd166',
      align: 'center'
    }).setOrigin(0.5);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 1280,
  height: 720,
  backgroundColor: '#09111f',
  scene: [FirstPlayableScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
