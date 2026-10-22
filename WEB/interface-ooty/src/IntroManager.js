export default class IntroManager {
  constructor() {
    this.fadeOutDuration = 3; // secondes
    this.introScreen = document.querySelector(".intro-screen");

    window.addEventListener("experience:powerOn", () => {
      console.log("power on received in Intro");
      this.fadingOutIntro();
    });
  }

  fadingOutIntro() {
    if (!this.introScreen) return;

    return this.introScreen.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: this.fadeOutDuration * 1000,
      easing: "ease-out",
      fill: "forwards",
    });
  }
}
