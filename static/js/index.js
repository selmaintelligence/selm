import { initChatUI } from './ui.js';
import { initChatCommands } from './commands.js';

function initChat() {
    const chatElements = {
        messageInput: document.getElementById('message-input'),
        sendButton: document.getElementById('send-message-button'),
        fileUploadButton: document.getElementById('file-upload-button'),
        fileInput: document.getElementById('fileUpload'),
        copyChatButton: document.getElementById('copy-chat-button'),
        switchChatButton: document.getElementById('switch-chat-button'),
        viewModeButton: document.getElementById('view-mode-button')
    };

    initChatUI(chatElements);
    initChatCommands(chatElements);
}

initChat();
