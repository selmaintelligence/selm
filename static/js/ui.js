export function initChatUI({ messageInput, sendButton, fileUploadButton, fileInput, copyChatButton, switchChatButton, viewModeButton }) {
    let currentChatMode = 'public';
    let publicChatMessages = [];
    let selmChatMessages = [];

    sendButton.addEventListener('click', () => sendMessage(messageInput, currentChatMode, publicChatMessages, selmChatMessages));
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage(messageInput, currentChatMode, publicChatMessages, selmChatMessages);
        }
    });

    fileUploadButton.addEventListener('click', () => fileInput.click());
    copyChatButton.addEventListener('click', () => copyChatToClipboard());
    switchChatButton.addEventListener('click', () => switchChatMode());
    viewModeButton.addEventListener('click', () => toggleViewMode(viewModeButton));
}

function sendMessage(messageInput, currentChatMode, publicChatMessages, selmChatMessages) {
    const message = messageInput.value.trim();
    if (!message) {
        alert('Message cannot be empty!');
        return;
    }

    appendMessage(currentChatMode, message, publicChatMessages, selmChatMessages);
    messageInput.value = '';
}

function appendMessage(mode, message, publicChatMessages, selmChatMessages) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerText = `${mode === 'public' ? 'Public' : 'Selm'}: ${message}`;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (mode === 'public') {
        publicChatMessages.push(message);
    } else {
        selmChatMessages.push(message);
    }
}

function copyChatToClipboard() {
    const chatMessages = document.getElementById('chat-messages');
    const chatText = Array.from(chatMessages.children)
        .map(messageDiv => messageDiv.innerText)
        .join('\n');

    navigator.clipboard.writeText(chatText)
        .then(() => console.log('Chat copied to clipboard!'))
        .catch(err => console.error('Failed to copy:', err));
}

function switchChatMode() {
    currentChatMode = currentChatMode === 'public' ? 'selm' : 'public';
    switchChatButton.innerText = currentChatMode === 'public' ? 'Selm Chat' : 'Public Chat';
    messageInput.placeholder = `Type your message for ${currentChatMode} chat...`;
    loadChatHistory(currentChatMode === 'public' ? publicChatMessages : selmChatMessages);
}

function loadChatHistory(messages) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';

    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerText = `${currentChatMode === 'public' ? 'Public' : 'Selm'}: ${message}`;
        chatMessages.appendChild(messageDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function toggleViewMode(viewModeButton) {
    document.body.classList.toggle('dark-mode');
    viewModeButton.innerText = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
}
