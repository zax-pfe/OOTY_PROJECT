export default class Request {
  constructor(stream = false, historySize = 5) {
    if (!Number.isInteger(historySize) || historySize < 0) {
      throw new Error("History size must be a non-negative integer");
    }
    this.stream = stream;
    this.url = "http://localhost:8000/chat?stream=false";
    this.streamUrl = "http://localhost:8000/chat?stream=true";
    this.historySize = historySize;
    this.conversation = [];
    this.pending = false;
  }

  reset() {
    this.conversation = [];
  }

  async ask(userMessage, onReply = () => {}) {
    const message = userMessage.trim();
    if (!message) {
      throw new Error("Empty message");
    }
    if (this.pending) {
      throw new Error("Pending");
    }

    const history = this.historySize === 0
      ? []
      : this.conversation.slice(-(this.historySize * 2));

    this.pending = true;

    try {
      const response = await fetch(this.stream ? this.streamUrl : this.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || `Erreur HTTP ${response.status}`);
      }

      const data = this.stream ? await this.readStream(response, onReply) : await response.json();
      if (typeof data.reply !== "string") {
        throw new Error("Invalid API reply");
      }

      this.conversation.push(
        { role: "user", content: message },
        { role: "assistant", content: data.reply },
      );

      const maxMessages = this.historySize * 2;
      if (this.conversation.length > maxMessages) {
        this.conversation.splice(0, this.conversation.length - maxMessages);
      }
      return data;
    } finally {
      this.pending = false;
    }
  }

  async readStream(response, onReply) {
    if (!response.body) throw new Error("Stream unavailable");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let reply = "";
    let completed = false;

    const readLine = (line) => {
      if (!line.trim()) return;
      const chunk = JSON.parse(line);
      if (chunk.error) throw new Error(chunk.error);
      if (typeof chunk.reply !== "string") throw new Error("Invalid stream reply");
      reply += chunk.reply;
      if (chunk.reply) onReply(reply);
      if (chunk.done) completed = true;
    };

    try {
      while (!completed) {
        const { value, done } = await reader.read();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });

        let newline;
        while (!completed && (newline = buffer.indexOf("\n")) !== -1) {
          readLine(buffer.slice(0, newline));
          buffer = buffer.slice(newline + 1);
        }

        if (done) {
          if (!completed && buffer.trim()) readLine(buffer);
          if (!completed) throw new Error("Stream interrupted");
          break;
        }
      }
      return { reply };
    } finally {
      try {
        await reader.cancel();
      } finally {
        reader.releaseLock();
      }
    }
  }
}
