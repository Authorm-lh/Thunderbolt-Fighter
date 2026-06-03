import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    this.cameras.main.setBackgroundColor('#09111f');
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 1280,
  height: 720,
  backgroundColor: '#09111f',
  scene: [BootScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
