const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';
  // Display a thinking message for the bot
  appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    // Remove the "thinking..." message
    const thinkingMessage = chatBox.querySelector('.message.bot:last-child');
    if (thinkingMessage && thinkingMessage.textContent.includes('thinking...')) {
      chatBox.removeChild(thinkingMessage);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.reply || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    appendMessage('bot', data.reply);
  } catch (error) {
    console.error('Error fetching from /api/chat:', error);
    appendMessage('bot', `Sorry, something went wrong: ${error.message}`);
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  if (sender === 'bot') {
    // Parse Markdown to HTML for bot messages
    // Pastikan library 'marked' sudah disertakan di HTML Anda
    msg.innerHTML = marked.parse(text);
  } else {
    // Untuk pesan pengguna, cukup gunakan textContent
    msg.textContent = text;
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
