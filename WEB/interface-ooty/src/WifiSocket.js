export default class WifiSocket {
  constructor() {
    this.ws = new WebSocket("ws://192.168.4.1:81");
  }

  sendMessage() {
    this.ws.send("Hello World");
  }
}
