export default class WifiSocket {
  constructor() {
    this.ws = new WebSocket("ws://192.168.4.1:81");

    this.powerOn = false;

    this.ws.addEventListener("open", () => {
      console.log("Connected to ESP");
    });

    this.ws.addEventListener("message", (event) => {
      console.log("received from ESP ", event.data);
      if (this.powerOn) return;
      if (event.data == "esp:powerOn") {
        this.powerOn = true;
        this.eventCaller("experience:powerOn");
      }
    });
  }

  eventCaller(eventName, eventData = {}) {
    window.dispatchEvent(new CustomEvent(eventName, eventData));
  }

  receiveOn() {
    // if message = esp:powerOn
    console.log("event power on received from webSocet");
  }

  receiveMessage() {
    // if message = esp:message
    console.log("event message received from webSocet");
  }

  sendMessage() {
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.warn("Wi-Fi socket is not connected; message skipped");
      return false;
    }

    console.log("sending infection message");
    this.ws.send("experience:infection");
    return true;
  }

  sendResetMessage() {
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.warn("Wi-Fi socket is not connected; message skipped");
      return false;
    }

    console.log("sending reset message");
    this.ws.send("experience:reset");
    return true;
  }
}
