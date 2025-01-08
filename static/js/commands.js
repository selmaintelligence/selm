export function initChatCommands({ messageInput, currentChatMode }) {
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

    function appendMessage(mode, message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerText = `${mode === 'public' ? 'Public' : 'Selm'}: ${message}`;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const message = messageInput.value.trim();
            if (message.startsWith('.')) {
                handleCommand(message);
            }
        }
    });
}
