export default class WifiSocket {
  constructor() {
    this.ws = new WebSocket("ws://192.168.4.1:81");
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
