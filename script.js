
const form = document.getElementById("chat-form");
const promptInput = document.getElementById("prompt");
const messages = document.getElementById("messages");
const sendButton = document.getElementById("send-button");
const newChatButton = document.getElementById("new-chat");
const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menu-button");

let conversation = [];
let isWaiting = false;

function addMessage(text, sender) {
  const welcome = document.getElementById("welcome");
  if (welcome) welcome.remove();

  const message = document.createElement("div");
  message.className = `message ${sender}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = sender === "user" ? "You" : "✦";

  const content = document.createElement("div");
  content.className = "message-content";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  content.appendChild(paragraph);
  message.appendChild(avatar);
  message.appendChild(content);
  messages.appendChild(message);

  messages.scrollTop = messages.scrollHeight;

  return message;
}

async function sendMessage(text) {
  const messageText = text.trim();

  if (!messageText || isWaiting) return;

  addMessage(messageText, "user");
  promptInput.value = "";
  promptInput.style.height = "auto";

  conversation.push({
    role: "user",
    content: messageText
  });

  isWaiting = true;
  sendButton.disabled = true;
  sendButton.textContent = "…";

  const loadingMessage = addMessage(
    "ARISE AI is thinking...",
    "assistant"
  );

  try {
    // The secure backend will be connected in the next step.
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: conversation
      })
    });

    if (!response.ok) {
      throw new Error(
        "The AI server is not connected yet. Please try again later."
      );
    }

    const data = await response.json();
    const reply = data.reply;

    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error("The AI returned an empty response.");
    }

    loadingMessage.remove();

    addMessage(reply, "assistant");

    conversation.push({
      role: "assistant",
      content: reply
    });

  } catch (error) {
    loadingMessage.remove();

    addMessage(
      error.message ||
      "Unable to connect to ARISE AI. Please try again.",
      "error"
    );

    conversation.pop();
  } finally {
    isWaiting = false;
    sendButton.disabled = false;
    sendButton.textContent = "➤";
    promptInput.focus();
  }
}

form.addEventListener("submit", function(event) {
  event.preventDefault();
  sendMessage(promptInput.value);
});

promptInput.addEventListener("input", function() {
  promptInput.style.height = "auto";
  promptInput.style.height =
    Math.min(promptInput.scrollHeight, 160) + "px";
});

promptInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll(".suggestion").forEach(function(button) {
  button.addEventListener("click", function() {
    sendMessage(button.textContent.trim());
  });
});

newChatButton.addEventListener("click", function() {
  if (isWaiting) return;

  conversation = [];
  messages.innerHTML = `
    <div class="welcome" id="welcome">
      <div class="ai-orb">✦</div>
      <h2>Rise beyond limits.</h2>
      <p>I'm ARISE AI. What would you like to know today?</p>
      <div class="suggestions">
        <button class="suggestion">Explain something difficult</button>
        <button class="suggestion">Help me create a website</button>
        <button class="suggestion">Teach me something new</button>
      </div>
    </div>
  `;

  messages.scrollTop = 0;

  document.querySelectorAll(".suggestion").forEach(function(button) {
    button.addEventListener("click", function() {
      sendMessage(button.textContent.trim());
    });
  });

  sidebar.classList.remove("open");
});

menuButton.addEventListener("click", function() {
  sidebar.classList.toggle("open");
});
