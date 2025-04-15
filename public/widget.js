;(() => {
  // Configuration
  const config = {
    apiUrl: window.location.origin,
    chatbotId: window.CHATEE_CHATBOT_ID || "",
    primaryColor: window.CHATEE_PRIMARY_COLOR || "#d0ff00",
    textColor: window.CHATEE_TEXT_COLOR || "#ffffff",
    position: window.CHATEE_POSITION || "right",
    welcomeMessage: window.CHATEE_WELCOME_MESSAGE || "Hi there! How can I help you today?",
  }

  // Generate a unique session ID
  const sessionId = generateSessionId()

  // Create styles
  const styles = document.createElement("style")
  styles.innerHTML = `
    .chatee-widget {
      position: fixed;
      bottom: 20px;
      ${config.position === "right" ? "right: 20px;" : "left: 20px;"}
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    .chatee-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: ${config.primaryColor};
      color: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
    }
    
    .chatee-button:hover {
      transform: scale(1.05);
    }
    
    .chatee-chat {
      position: absolute;
      bottom: 80px;
      ${config.position === "right" ? "right: 0;" : "left: 0;"}
      width: 350px;
      height: 500px;
      background-color: #1a1a1a;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
    }
    
    .chatee-chat.open {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
    
    .chatee-header {
      background-color: #2a2a2a;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: ${config.textColor};
    }
    
    .chatee-close {
      cursor: pointer;
      font-size: 20px;
    }
    
    .chatee-messages {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .chatee-message {
      max-width: 80%;
      padding: 10px 15px;
      border-radius: 18px;
      word-break: break-word;
    }
    
    .chatee-message.user {
      align-self: flex-end;
      background-color: ${config.primaryColor};
      color: #000000;
    }
    
    .chatee-message.bot {
      align-self: flex-start;
      background-color: #2a2a2a;
      color: ${config.textColor};
    }
    
    .chatee-input-container {
      padding: 15px;
      background-color: #2a2a2a;
      display: flex;
      gap: 10px;
    }
    
    .chatee-input {
      flex: 1;
      padding: 10px 15px;
      border-radius: 20px;
      border: none;
      background-color: #3a3a3a;
      color: ${config.textColor};
      outline: none;
    }
    
    .chatee-send {
      background-color: ${config.primaryColor};
      color: #000000;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    
    .chatee-typing {
      display: flex;
      gap: 5px;
      padding: 10px 15px;
      background-color: #2a2a2a;
      border-radius: 18px;
      align-self: flex-start;
      margin-top: 5px;
    }
    
    .chatee-typing-dot {
      width: 8px;
      height: 8px;
      background-color: ${config.textColor};
      border-radius: 50%;
      opacity: 0.6;
      animation: chatee-typing 1s infinite;
    }
    
    .chatee-typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .chatee-typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes chatee-typing {
      0%, 100% { opacity: 0.6; transform: translateY(0); }
      50% { opacity: 1; transform: translateY(-5px); }
    }
  `
  document.head.appendChild(styles)

  // Create widget container
  const widgetContainer = document.createElement("div")
  widgetContainer.className = "chatee-widget"

  // Create chat button
  const chatButton = document.createElement("div")
  chatButton.className = "chatee-button"
  chatButton.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'

  // Create chat container
  const chatContainer = document.createElement("div")
  chatContainer.className = "chatee-chat"

  // Create chat header
  const chatHeader = document.createElement("div")
  chatHeader.className = "chatee-header"
  chatHeader.innerHTML = '<div>Chat Support</div><div class="chatee-close">×</div>'

  // Create messages container
  const messagesContainer = document.createElement("div")
  messagesContainer.className = "chatee-messages"

  // Create input container
  const inputContainer = document.createElement("div")
  inputContainer.className = "chatee-input-container"

  const input = document.createElement("input")
  input.className = "chatee-input"
  input.placeholder = "Type your message..."

  const sendButton = document.createElement("button")
  sendButton.className = "chatee-send"
  sendButton.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>'

  // Assemble the widget
  inputContainer.appendChild(input)
  inputContainer.appendChild(sendButton)

  chatContainer.appendChild(chatHeader)
  chatContainer.appendChild(messagesContainer)
  chatContainer.appendChild(inputContainer)

  widgetContainer.appendChild(chatButton)
  widgetContainer.appendChild(chatContainer)

  document.body.appendChild(widgetContainer)

  // Chat history
  const messages = []

  // Event listeners
  chatButton.addEventListener("click", () => {
    chatContainer.classList.add("open")
    if (messages.length === 0) {
      addBotMessage(config.welcomeMessage)
    }
  })

  chatHeader.querySelector(".chatee-close").addEventListener("click", () => {
    chatContainer.classList.remove("open")
  })

  sendButton.addEventListener("click", sendMessage)

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  })

  // Functions
  function addUserMessage(text) {
    const message = document.createElement("div")
    message.className = "chatee-message user"
    message.textContent = text
    messagesContainer.appendChild(message)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    messages.push({ role: "user", content: text })
  }

  function addBotMessage(text) {
    const message = document.createElement("div")
    message.className = "chatee-message bot"
    message.textContent = text
    messagesContainer.appendChild(message)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    messages.push({ role: "assistant", content: text })
  }

  function showTypingIndicator() {
    const typing = document.createElement("div")
    typing.className = "chatee-typing"
    typing.innerHTML =
      '<div class="chatee-typing-dot"></div><div class="chatee-typing-dot"></div><div class="chatee-typing-dot"></div>'
    messagesContainer.appendChild(typing)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
    return typing
  }

  function sendMessage() {
    const text = input.value.trim()
    if (!text) return

    addUserMessage(text)
    input.value = ""

    const typingIndicator = showTypingIndicator()

    // Send message to API
    fetch(`${config.apiUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatbotId: config.chatbotId,
        sessionId: sessionId,
        message: text,
        history: messages.slice(-10), // Send last 10 messages for context
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        typingIndicator.remove()
        if (data.success) {
          addBotMessage(data.message.content)
        } else {
          addBotMessage("Sorry, I encountered an error. Please try again later.")
        }
      })
      .catch((error) => {
        typingIndicator.remove()
        addBotMessage("Sorry, I encountered an error. Please try again later.")
        console.error("Chat error:", error)
      })
  }

  function generateSessionId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
})()
