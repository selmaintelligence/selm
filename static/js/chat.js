export function initChat() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message-button');
    const fileUploadButton = document.getElementById('file-upload-button');
    const fileInput = document.getElementById('fileUpload');
    const viewModeButton = document.getElementById('view-mode-button');
    const chatMessages = document.getElementById('chat-messages');

    const chatHistory = [];
    const userMessages = []; // Stores user messages
    const userCommands = []; // Stores user commands

    const appendMessage = (message) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerText = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatHistory.push(message);
    };

    const handleMessage = async (message) => {
        const trimmedMessage = message.trim();
        const [commandName, ...commandArgs] = trimmedMessage.split(' ');

        if (!commandName) {
            return appendMessage(trimmedMessage);
        }

        // Handle local commands
        if (commandName === '!chat') {
            const allMessages = userMessages.join('\n');
            appendMessage(`Stored Messages:\n${allMessages || 'No messages found.'}`);
            return;
        }

        if (commandName === '!commands') {
            const allCommands = userCommands.join('\n');
            appendMessage(`Stored Commands:\n${allCommands || 'No commands found.'}`);
            return;
        }

        // Store messages or commands based on first char of the first token
        if (commandName.startsWith('.')) {
            userCommands.push(trimmedMessage);
        } else {
            userMessages.push(trimmedMessage);
        }

        // Process remote commands
        const encodedArgs = encodeURIComponent(commandArgs.join(' '));
        const url = `https://selmai.pythonanywhere.com/?name=${encodeURIComponent(commandName)}&args=${encodedArgs}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

            const data = await response.json();
            if (!data || typeof data.processed_message !== 'string') throw new Error('Invalid response format');

            appendMessage(data.processed_message);
        } catch (error) {
            console.error('Error processing command:', error.message);
            appendMessage(`Error: ${error.message}`);
        }
    };

    const sendMessage = () => {
        const message = messageInput.value.trim();
        if (!message) return alert('Message cannot be empty!');

        handleMessage(message);
        messageInput.value = '';
    };

    const toggleViewMode = () => {
        document.body.classList.toggle('dark-mode');
        viewModeButton.innerText = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    };

    // Initialize in dark mode
    document.body.classList.add('dark-mode');
    viewModeButton.innerText = 'Light Mode';

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    fileUploadButton.addEventListener('click', () => fileInput.click());
    viewModeButton.addEventListener('click', toggleViewMode);
}
