import Request from "./Request.js";
import WifiSocket from "./WifiSocket.js";
import setupCursor from "./cursor.js";
import createLoadingMatrix from "./loadingMatrix.js";
import TerminalBackground from "./TerminalBackground.js";
import SoundManager from "./SoundManager.js";
import IntroManager from "./IntroManager.js";

const form = document.querySelector("#chat-form");
const input = document.querySelector("#message");
setupCursor(input, document.querySelector(".input-cursor"));
const output = document.querySelector("#output");
// Nombre d'echanges precedents conserves (une question + une reponse).
const historySize = 5;
// Duree minimale de chargement en secondes avant l'envoi au modele.
const minimumLoadingDuration = 2;
// Intervalle minimal entre caracteres affiches en streaming, en secondes (0 = immediat).
const streamDuration = 0.05;
const request = new Request(true, historySize, streamDuration);
let followLatestMessage = true;
let typing = false;

new TerminalBackground(document.getElementById("bg"));
const wifiSocket = new WifiSocket();
const soundManager = new SoundManager();
new IntroManager();

function eventCaller(eventName, eventData = {}) {
  window.dispatchEvent(new CustomEvent(eventName, eventData));
}

function showLatestMessage() {
  if (followLatestMessage) {
    output.scrollTop = output.scrollHeight;
  }
}

document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("chat-started")) return;
  if (event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

  event.preventDefault();

  // Une ligne de texte : font-size 20px * line-height 1.4.
  const lineHeight = 28;
  output.scrollTop += event.key === "ArrowUp" ? -lineHeight : lineHeight;
  followLatestMessage = output.scrollTop + output.clientHeight >= output.scrollHeight - 1;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message || input.disabled) return;

  if (message === "/reset") {
    request.reset();
    output.replaceChildren();
    document.body.classList.remove("chat-started");
    input.value = "";
    followLatestMessage = true;
    typing = false;
    input.focus({ preventScroll: true });
    input.dispatchEvent(new Event("input"));
    wifiSocket.sendResetMessage();
    return;
  }

  eventCaller("experience:aspire");
  typing = false;
  wifiSocket.sendMessage();

  document.body.classList.add("chat-started");
  followLatestMessage = true;

  const userMessage = document.createElement("p");
  userMessage.className = "message message--user";
  userMessage.textContent = message;
  const aiMessage = document.createElement("p");
  aiMessage.className = "message message--machine";
  aiMessage.append(createLoadingMatrix());
  output.append(userMessage, aiMessage);
  showLatestMessage();
  input.value = "";
  input.disabled = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, minimumLoadingDuration * 1000));
    const data = await request.ask(message, (reply) => {
      aiMessage.textContent = reply;
      showLatestMessage();
      if (!typing) {
        eventCaller("experience:machineTyping");
        eventCaller("experience:stopAspire");
        typing = true;
      }
    });

    console.log("Model :", data);
    aiMessage.textContent = data.reply;
    // console.log("Le message du modele a fini d'etre ecrit.");
    eventCaller("experience:endMachineTyping");
  } catch (error) {
    console.error("ERROR :", error);
    aiMessage.textContent = `Erreur : ${error.message}`;
  } finally {
    input.disabled = false;
    input.focus({ preventScroll: true });
    showLatestMessage();
  }
});
