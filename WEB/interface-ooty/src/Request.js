export default class Request {
  constructor(stream = false, historySize = 5, streamDuration = 0) {
    if (!Number.isInteger(historySize) || historySize < 0) {
      throw new Error("History size must be a non-negative integer");
    }
    if (!Number.isFinite(streamDuration) || streamDuration < 0) {
      throw new Error("Stream duration must be a non-negative number");
    }
    this.stream = stream;
    this.streamDuration = streamDuration;
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
    let lastCharacterTime = -Infinity;

    const readLine = async (line) => {
      if (!line.trim()) return;
      const chunk = JSON.parse(line);
      if (chunk.error) throw new Error(chunk.error);
      if (typeof chunk.reply !== "string") throw new Error("Invalid stream reply");
      if (this.streamDuration === 0) {
        reply += chunk.reply;
        if (chunk.reply) onReply(reply);
      } else {
        for (const character of chunk.reply) {
          let remaining = this.streamDuration * 1000 - (performance.now() - lastCharacterTime);
          while (remaining > 0) {
            await new Promise((resolve) => setTimeout(resolve, remaining));
            remaining = this.streamDuration * 1000 - (performance.now() - lastCharacterTime);
          }
          reply += character;
          onReply(reply);
          lastCharacterTime = performance.now();
        }
      }
      if (chunk.done) completed = true;
    };

    try {
      while (!completed) {
        const { value, done } = await reader.read();
        buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });

        let newline;
        while (!completed && (newline = buffer.indexOf("\n")) !== -1) {
          await readLine(buffer.slice(0, newline));
          buffer = buffer.slice(newline + 1);
        }

        if (done) {
          if (!completed && buffer.trim()) await readLine(buffer);
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
