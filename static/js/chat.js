export function initChat() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message-button');
    const fileUploadButton = document.getElementById('file-upload-button'); // Reference to the upload button
    const fileInput = document.getElementById('fileUpload'); // Reference to the hidden file input
    const copyChatButton = document.getElementById('copy-chat-button'); // Reference to the copy button
    const switchChatButton = document.getElementById('switch-chat-button'); // Reference to the switch chat button
    const viewModeButton = document.getElementById('view-mode-button'); // Reference to the view mode button
    const gameModeButton = document.getElementById('game-mode-button'); // Reference to the game mode button

    let currentChatMode = 'public'; // Track the current chat mode
    let publicChatMessages = []; // Array to hold public chat messages
    let selmChatMessages = []; // Array to hold SELM chat messages

    // Function to handle commands that start with a period
    function handleCommand(message) {
        const tokens = message.split(' ');
        const firstToken = tokens[0];
        const commandName = firstToken.substring(1); // Remove the leading period
        const commandParams = tokens.slice(1).join(' '); // Get the rest of the message
    
        // Construct the URL with params
        const url = `https://selmai.pythonanywhere.com/?type=command&name=${encodeURIComponent(commandName)}&params=${encodeURIComponent(commandParams)}`;
    
        // Send the request to the external endpoint
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // Handle the response from the server (display it in the chat)
                appendMessage(currentChatMode, data.processed_message || 'No response from server');
            })
            .catch(error => {
                console.error('Error:', error);
                appendMessage(currentChatMode, 'Error processing the command.');
            });
    }

    // Function to send the message
    function sendMessage() {
        const message = messageInput.value.trim(); // Get trimmed message
    
        if (message) {
            if (message.startsWith('.')) {
                // If the message starts with a period, it's a command
                handleCommand(message);
            } else {
                // Otherwise, append message to chat and store in appropriate chat history
                appendMessage(currentChatMode, message);
            }
            messageInput.value = ''; // Clear the input after sending
        }
    }

    // Function to append messages to the chat window
    function appendMessage(mode, message) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.innerText = `${mode === 'public' ? 'Public' : 'Selm'}: ${message}`;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom

        // Store the message in the appropriate chat history
        if (mode === 'public') {
            publicChatMessages.push(message);
        } else {
            selmChatMessages.push(message);
        }
    }

    // Function to copy chat messages to clipboard
    function copyChatToClipboard() {
        const chatMessages = document.getElementById('chat-messages');
        const chatText = Array.from(chatMessages.children)
            .map(messageDiv => messageDiv.innerText)
            .join('\n'); // Join messages with new lines

        navigator.clipboard.writeText(chatText).then(() => {
            console.log('Chat copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    // Function to switch chat modes
    function switchChatMode() {
        if (currentChatMode === 'public') {
            currentChatMode = 'selm';
            switchChatButton.innerText = 'Public Chat'; // Update button text
            messageInput.placeholder = 'Type your message for selm...'; // Change placeholder
            // Load SELM chat history if needed
            loadChatHistory(selmChatMessages);
        } else {
            currentChatMode = 'public';
            switchChatButton.innerText = 'Selm Chat'; // Update button text
            messageInput.placeholder = 'Type your message for public chat...'; // Change placeholder
            // Load Public chat history if needed
            loadChatHistory(publicChatMessages);
        }
    }

    // Function to load chat history into the chat window
    function loadChatHistory(messages) {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = ''; // Clear current chat messages

        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.innerText = `${currentChatMode === 'public' ? 'Public' : 'Selm'}: ${message}`;
            chatMessages.appendChild(messageDiv);
        });

        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to bottom
    }

    // Function to toggle dark/light mode
    function toggleViewMode() {
        document.body.classList.toggle('dark-mode');
        viewModeButton.innerText = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    }

    // Function to toggle game mode
    function toggleGameMode() {

    }

    // Event listener for sending message on button click
    sendButton.addEventListener('click', sendMessage);

    // Event listener for sending message on Enter key press
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage(); // Call sendMessage when Enter is pressed
            event.preventDefault(); // Prevent default behavior of the Enter key
        }
    });

    // Add event listener for the file upload button
    fileUploadButton.addEventListener('click', function() {
        fileInput.click(); // Open the file dialog when the button is clicked
    });

    // Add event listener for the copy button
    copyChatButton.addEventListener('click', copyChatToClipboard);

    // Add event listener for the switch chat button
    switchChatButton.addEventListener('click', switchChatMode);

    // Add event listener for the view mode button (Dark/Light mode toggle)
    viewModeButton.addEventListener('click', toggleViewMode);

    // Add event listener for the game mode button
    gameModeButton.addEventListener('click', toggleGameMode);
}
