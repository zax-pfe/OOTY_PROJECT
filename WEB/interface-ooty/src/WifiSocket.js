export default class WifiSocket {
  constructor() {
    this.ws = new WebSocket("ws://192.168.4.1:81");

    this.ws.addEventListener("message", (event) => {
      console.log("Message reçu du serveur ", event.data);
    });
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

    console.log("sending message");
    this.ws.send("Hello World");
    return true;
  }
}
