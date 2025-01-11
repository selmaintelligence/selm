export function initChat() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message-button');
    const fileUploadButton = document.getElementById('file-upload-button');
    const fileInput = document.getElementById('fileUpload');
    const switchChatButton = document.getElementById('switch-chat-button');
    const viewModeButton = document.getElementById('view-mode-button');
    const chatMessages = document.getElementById('chat-messages');

    let currentChatMode = 'public';
    const chatHistory = {
        public: [],
        selm: [],
    };

    const appendMessage = (mode, message) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerText = `${mode === 'public' ? 'Public' : 'Selm'}: ${message}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatHistory[mode].push(message);
    };

    const handleMessage = async (message) => {
        const isCommand = message.startsWith('.');
        const trimmedMessage = message.trim();

        if (isCommand) {
            // Split the message into command name and arguments without removing the "."
            const [commandName, ...commandArgs] = trimmedMessage.split(' ');
            const encodedArgs = encodeURIComponent(commandArgs.join(' '));
            const url = `https://selmai.pythonanywhere.com/?name=${encodeURIComponent(commandName)}&args=${encodedArgs}`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

                const data = await response.json();
                if (!data || typeof data.processed_message !== 'string') throw new Error('Invalid response format');

                appendMessage(currentChatMode, data.processed_message);
            } catch (error) {
                console.error('Error processing command:', error.message);
                appendMessage(currentChatMode, `Error: ${error.message}`);
            }
        } else {
            try {
                // Simply append non-command messages to the chat
                appendMessage(currentChatMode, trimmedMessage);
            } catch (error) {
                console.error('Error sending chat message:', error.message);
                appendMessage(currentChatMode, `Error: ${error.message}`);
            }
        }
    };

    const sendMessage = () => {
        const message = messageInput.value.trim();
        if (!message) return alert('Message cannot be empty!');

        handleMessage(message);
        messageInput.value = '';
    };

    const switchChatMode = () => {
        currentChatMode = currentChatMode === 'public' ? 'selm' : 'public';
        switchChatButton.innerText = currentChatMode === 'public' ? 'Selm Chat' : 'Public Chat';
        messageInput.placeholder = `Type your message for ${currentChatMode} chat...`;
        loadChatHistory();
    };

    const loadChatHistory = () => {
        chatMessages.innerHTML = '';
        chatHistory[currentChatMode].forEach(message => appendMessage(currentChatMode, message));
    };

    const toggleViewMode = () => {
        document.body.classList.toggle('dark-mode');
        viewModeButton.innerText = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    };

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    fileUploadButton.addEventListener('click', () => fileInput.click());
    switchChatButton.addEventListener('click', switchChatMode);
    viewModeButton.addEventListener('click', toggleViewMode);
}
