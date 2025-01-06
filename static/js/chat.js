export function initChat() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message-button');
    const fileUploadButton = document.getElementById('file-upload-button');
    const fileInput = document.getElementById('fileUpload');
    const copyChatButton = document.getElementById('copy-chat-button');
    const switchChatButton = document.getElementById('switch-chat-button');
    const viewModeButton = document.getElementById('view-mode-button');

    let currentChatMode = 'public';
    let publicChatMessages = [];
    let selmChatMessages = [];

    async function handleCommand(message) {
        const tokens = message.split(' ');
        const firstToken = tokens[0];
        const commandName = firstToken.substring(1);
        const commandParams = tokens.slice(1).join(' ');

        const url = `https://selmai.pythonanywhere.com/?type=command&name=${encodeURIComponent(commandName)}&params=${encodeURIComponent(commandParams)}`;

        try {
            const response = await fetch(url, { method: 'GET' });
            
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const data = await response.json();
            
            if (!data || typeof data.processed_message !== 'string') {
                throw new Error('Invalid response format');
            }

            appendMessage(currentChatMode, data.processed_message);
        } catch (error) {
            console.error('Error processing command:', error.message);
            appendMessage(currentChatMode, `Error: ${error.message}`);
        }
    }

    function sendMessage() {
        const message = messageInput.value.trim();

        if (!message) {
            alert('Message cannot be empty!');
            return;
        }

        if (message.startsWith('.')) {
            handleCommand(message);
        } else {
            appendMessage(currentChatMode, message);
        }

        messageInput.value = '';
    }

    function appendMessage(mode, message) {
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

    function toggleViewMode() {
        document.body.classList.toggle('dark-mode');
        viewModeButton.innerText = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    fileUploadButton.addEventListener('click', () => fileInput.click());
    copyChatButton.addEventListener('click', copyChatToClipboard);
    switchChatButton.addEventListener('click', switchChatMode);
    viewModeButton.addEventListener('click', toggleViewMode);
}
