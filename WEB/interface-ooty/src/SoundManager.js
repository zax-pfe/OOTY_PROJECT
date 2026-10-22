import { Howl } from "howler";

export default class SoundManager {
  constructor() {
    console.log("sound manager init");
    // this.soundLight = new Howl({ src: ["./Sounds/soundLight.wav"], volume: 0.2 });

    // this.soundResponse = new Howl({
    //   src: ["./Sounds/FootStepMetal.wav"],
    //   loop: true,
    //   volume: 0.1,
    //   rate: 1.7,
    // });

    // // Jouer la loop background boackrooms
    // this.backGroundSoundVolume = 0.4;
    // this.backGroundSound = new Howl({
    //   src: ["./Sounds/soundLoop.mp3"],
    //   loop: true,
    //   volume: this.backGroundSoundVolume,
    // });

    // this.backGroundSound.play();

    window.addEventListener("experience:powerOn", () => {
      // if (this.eventFireReceived) return;
      // if (this.laserEventReceived) console.log("play sound");
      // this.soundLight.play();
      // this.eventFireReceived = true;
      // this.eventEndFireReceived = false;
      console.log("power on received");
    });

    window.addEventListener("experience:machineType", () => {
      // if (this.eventLaserReceived) return;
      // this.soundLight.stop();
      // this.soundLaser.play();
      // // this.soundLaser.play();
      // this.eventLaserReceived = true;

      console.log("Machine typing received");
    });

    window.addEventListener("experience:loading", () => {
      // if (this.eventEndFireReceived) return;
      // this.soundLight.stop();
      // this.soundLaser.stop();
      // this.eventEndFireReceived = true;
      // this.eventLaserReceived = false;
      // this.eventFireReceived = false;
      console.log("loading event received");
    });

    // window.addEventListener("game:hit", () => {
    //   this.soundBurn.play();
    //   this.soundLoop.fade(this.loopVolume, 0, 1);
    // });

    // window.addEventListener("game:walking", () => {
    //   // console.log
    //   this.soundWalk.stop();
    //   this.soundWalk.fade(0, 0.1, 0.2);

    //   // this.soundWalk.volume = Math.random() * 0.1 + 0.05 - 0.05;
    //   this.soundWalk.play();
    // });

    // window.addEventListener("game:stopWalking", () => {
    //   this.soundWalk.fade(0.2, 0, 0.2);
    // });

    // window.addEventListener("game:hit", () => {
    //   this.soundWalk.stop();
    // });

    // window.addEventListener("game:restart", () => {
    //   this.regenerate.play();
    //   this.soundLoop.fade(0, this.loopVolume, 1);
    // });
  }
}
