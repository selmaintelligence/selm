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
    let timer; // Timer reference for repeating the request
    let isRegularChat = true; // Track whether the last message was a regular chat message
    let currentTimerInterval = 10000; // Initial 10 seconds interval

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

        // Reset the regular chat flag if a command is issued
        if (commandName.startsWith('.')) {
            isRegularChat = false;
        } else {
            isRegularChat = true;
        }

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

        // Store messages or commands based on the first token
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
        
        // Check if the last message was a regular chat message and start the timer
        if (isRegularChat && !timer) {
            startRepeatingRequest();
        }
    };

    const toggleViewMode = () => {
        document.body.classList.toggle('dark-mode');
        viewModeButton.innerText = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    };

    const startRepeatingRequest = () => {
        // Only start the timer if it isn't already running
        if (timer) return;

        // Send the request with the last 3 chat messages every `currentTimerInterval`
        timer = setInterval(() => {
            const lastThreeMessages = userMessages.slice(-3);
            const encodedArgs = encodeURIComponent(lastThreeMessages.join('\n'));
            const url = `https://selmai.pythonanywhere.com/?name=.chat&args=${encodedArgs}`;

            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    if (data && data.processed_message) {
                        appendMessage(data.processed_message); // Print data if received
                        currentTimerInterval = 10000; // Reset to 10 seconds
                    } else {
                        // If no data is received, increase the timer by 5 seconds
                        currentTimerInterval += 5000;
                    }
                })
                .catch((error) => {
                    console.error('Error during polling:', error);
                });
        }, currentTimerInterval); // Timer interval
    };

    const stopRepeatingRequest = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
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
