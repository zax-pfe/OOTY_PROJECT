import Request from "./Request.js";

const form = document.querySelector("#chat-form");
const input = document.querySelector("#message");
const output = document.querySelector("#output");
const request = new Request(true);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message || input.disabled) return;

  const userMessage = document.createElement("span");
  userMessage.textContent = `USER : ${message}\n`;
  const aiMessage = document.createElement("span");
  aiMessage.textContent = "MODEL : ...\n\n";
  output.append(userMessage, aiMessage);
  input.value = "";
  input.disabled = true;

  try {
    const data = await request.ask(message, (reply) => {
      aiMessage.textContent = `MODEL : ${reply}\n\n`;
    });
    console.log("Model :", data);
    aiMessage.textContent = `MODEL : ${data.reply}\n\n`;
  } catch (error) {
    console.error("ERROR :", error);
    aiMessage.textContent = `ERROR : ${error.message}\n\n`;
  } finally {
    input.disabled = false;
    input.focus();
  }
});
