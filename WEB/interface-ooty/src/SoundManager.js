import { Howl } from "howler";

export default class SoundManager {
  constructor() {
    // this.soundLight = new Howl({ src: ["./Sounds/soundLight.wav"], volume: 0.2 });

    this.soundVersion = "A";
    // _______________________ Volume ______________________ //
    this.backGroundSoundVolume = 0.4;
    this.machineTypingVolume = 0.6;
    this.aspireVolume = 0.5;

    this.machineTyping = new Howl({
      src: ["./sounds/machineTyping.mp3"],
      loop: true,
      volume: this.machineTypingVolume,
      rate: 1,
    });

    const version = this.soundVersion == "A" ? "A" : "B";
    const soundPath = `./sounds/Version${version}/version${version}`;
    const soundOptions = { loop: true, volume: this.aspireVolume, rate: 1 };

    this.aspireSound = new Howl({
      ...soundOptions,
      src: [`${soundPath}aspire.mp3`],
    });

    this.replaceSound = new Howl({
      ...soundOptions,
      src: [`${soundPath}remplace.mp3`],
    });

    // // Jouer la loop background boackrooms
    this.backGroundSound = new Howl({
      src: ["./sounds/backgroundLoop.mp3"],
      loop: true,
      volume: this.backGroundSoundVolume,
    });

    this.backGroundSound.play();

    window.addEventListener("experience:powerOn", () => {
      console.log("power on received");
    });

    // _________________ Machine typing ____________ //

    window.addEventListener("experience:machineTyping", () => {
      this.machineTyping.stop();
      this.machineTyping.play();
      this.machineTyping.fade(0, this.machineTypingVolume, 200);
    });

    window.addEventListener("experience:endMachineTyping", () => {
      this.machineTyping.fade(this.machineTyping.volume(), 0, 200);
      this.delayEvent(0.2, this.stopMachineTypingSound);
    });

    // _________________ Aspire _____________________ //

    window.addEventListener("experience:aspire", () => {
      this.aspireSound.stop();
      this.aspireSound.play();
      this.aspireSound.fade(0, this.aspireVolume, 1000);
    });

    window.addEventListener("experience:stopAspire", () => {
      this.aspireSound.fade(this.aspireSound.volume(), 0, 1000);
      this.delayEvent(1, this.stopAspireSound);
    });
  }

  delayEvent(duration, callBack) {
    return setTimeout(() => callBack.call(this), duration * 1000);
  }

  stopMachineTypingSound() {
    this.machineTyping.stop();
  }
  stopAspireSound() {
    this.aspireSound.stop();
  }
}
