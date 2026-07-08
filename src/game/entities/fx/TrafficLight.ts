import Phaser from 'phaser';

export class TrafficLight extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, duration: number) {
    super(scene, x, y);

    // Build the traffic light visual
    const post = scene.add.rectangle(0, 0, 12, 110, 0x475569); // Thicker, taller post
    post.setOrigin(0.5, 1); // anchor at bottom

    // Black backplate for contrast
    const backplate = scene.add.rectangle(0, -110, 48, 100, 0x000000); 
    
    // Main housing
    const box = scene.add.rectangle(0, -110, 36, 88, 0x1e293b); 

    // The three lights (Radius 10)
    const redLight = scene.add.circle(0, -135, 10, 0xef4444); 
    const yellowLight = scene.add.circle(0, -110, 10, 0x374151); // Off
    const greenLight = scene.add.circle(0, -85, 10, 0x374151); // Off

    // Visors above each light
    const visorR = scene.add.rectangle(0, -147, 24, 4, 0x000000);
    const visorY = scene.add.rectangle(0, -122, 24, 4, 0x000000);
    const visorG = scene.add.rectangle(0, -97, 24, 4, 0x000000);
    // Big pulsing circular glow
    const glow = scene.add.circle(0, -135, 40, 0xef4444, 0.5);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    
    this.add([post, backplate, box, visorR, visorY, visorG, redLight, yellowLight, greenLight, glow]);
    scene.add.existing(this);

    this.setScale(1.5); // Make it globally bigger

    // Initial state: hidden underground
    const finalY = y;
    this.y = y + 100;

    // Pop up animation
    scene.tweens.add({
      targets: this,
      y: finalY,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Pulse the red glow
        scene.tweens.add({
          targets: glow,
          alpha: 0.8,
          scale: 1.5,
          yoyo: true,
          repeat: -1,
          duration: 300
        });

        // Sink back down when duration ends
        scene.time.delayedCall(duration, () => {
          scene.tweens.killTweensOf(glow);
          scene.tweens.add({
            targets: this,
            y: finalY + 100,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => this.destroy()
          });
        });
      }
    });
  }
}
