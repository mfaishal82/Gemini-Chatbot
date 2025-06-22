document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');
    const themeToggle = document.getElementById('theme-toggle');

    let thinkingMessageElement = null;
    let thinkingIntervalId = null;

    // --- Logika Pengalih Tema ---
    const userTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const themeCheck = () => {
        if (userTheme === 'dark' || (!userTheme && systemTheme)) {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        } else {
            themeToggle.textContent = '🌙';
        }
    };

    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙';
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️';
        }
    });

    themeCheck();

    // --- Logika Pesan "Thinking" ---
    function showThinkingMessage() {
        if (thinkingMessageElement) return; // Mencegah pesan "thinking" ganda

        thinkingMessageElement = document.createElement('div');
        thinkingMessageElement.classList.add('message', 'bot', 'thinking');
        thinkingMessageElement.innerHTML = 'Gemini is thinking<span class="ellipsis"></span>';
        chatBox.appendChild(thinkingMessageElement);
        chatBox.scrollTop = chatBox.scrollHeight;

        const ellipsisSpan = thinkingMessageElement.querySelector('.ellipsis');
        let dots = 0;
        thinkingIntervalId = setInterval(() => {
            dots = (dots + 1) % 4; // Siklus: 0, 1, 2, 3
            ellipsisSpan.textContent = '.'.repeat(dots);
        }, 300); // Perbarui setiap 300ms
    }

    function hideThinkingMessage() {
        if (thinkingIntervalId) {
            clearInterval(thinkingIntervalId);
            thinkingIntervalId = null;
        }
        if (thinkingMessageElement && thinkingMessageElement.parentNode) {
            thinkingMessageElement.parentNode.removeChild(thinkingMessageElement);
            thinkingMessageElement = null;
        }
    }

    // --- Logika Chat ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;

        appendMessage(userMessage, 'user');
        messageInput.value = '';
        messageInput.focus();

        showThinkingMessage(); // Tampilkan pesan "thinking"

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            hideThinkingMessage(); // Sembunyikan pesan "thinking" sebelum menampilkan balasan
            
            // Konversi respon Markdown ke HTML menggunakan marked.js
            // PENTING: Untuk production, sangat disarankan untuk membersihkan output HTML ini untuk mencegah XSS.
            appendMessage(marked.parse(data.reply), 'bot');
        } catch (error) {
            console.error('Error:', error);
            hideThinkingMessage(); // Sembunyikan pesan "thinking" jika terjadi error
            appendMessage('Maaf, terjadi kesalahan. Silakan coba lagi.', 'bot');
        }
    });

    function appendMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        messageElement.innerHTML = message; // Menggunakan innerHTML untuk merender markdown (misal: code blocks)
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});