// src/components/common/ChatPopup.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { chatAPI } from '../../services/api';

const colors = {
    primary: '#7765DA',
};

const ChatPopup = ({ userName, userRole }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const { socketService } = useSocket();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Load chat history
        loadChatHistory();

        // Listen for new chat messages
        socketService.onChatNewMessage((newMessage) => {
            console.log('New chat message:', newMessage);
            setMessages(prev => [...prev, {
                id: newMessage.id,
                text: newMessage.message,
                sender: newMessage.sender,
                senderRole: newMessage.senderRole,
                time: new Date(newMessage.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
            }]);
        });

        return () => {
            socketService.removeAllListeners();
        };
    }, [socketService]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadChatHistory = async () => {
        try {
            const response = await chatAPI.getHistory(50);
            const chatHistory = response.data.data.map(msg => ({
                id: msg._id,
                text: msg.message,
                sender: msg.sender,
                senderRole: msg.senderRole,
                time: new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
            }));
            setMessages(chatHistory);
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = () => {
        if (message.trim() === '') return;

        // Send via socket
        socketService.sendChatMessage(userName, message.trim(), userRole);

        // Clear input
        setMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isMyMessage = (msg) => {
        return msg.sender === userName && msg.senderRole === userRole;
    };

    return (
        <>
            {/* Floating Chat Button */ }
            <button
                onClick={ () => setIsOpen(!isOpen) }
                className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-300 z-50"
                style={ { backgroundColor: colors.primary } }
            >
                { isOpen ? <X size={ 28 } /> : <MessageSquare size={ 28 } /> }
            </button>

            {/* Chat Popup Window */ }
            { isOpen && (
                <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300">
                    {/* Header */ }
                    <div
                        className="p-4 text-white flex items-center justify-between"
                        style={ { backgroundColor: colors.primary } }
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <MessageSquare size={ 20 } />
                            </div>
                            <div>
                                <h3 className="font-semibold">Class Chat</h3>
                                <p className="text-sm opacity-90">Real-time messaging</p>
                            </div>
                        </div>
                        <button
                            onClick={ () => setIsOpen(false) }
                            className="hover:bg-white/20 p-2 rounded-lg transition"
                        >
                            <X size={ 20 } />
                        </button>
                    </div>

                    {/* Messages Area */ }
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        { messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={ msg.id }
                                    className={ `flex ${isMyMessage(msg) ? 'justify-end' : 'justify-start'}` }
                                >
                                    <div className="max-w-xs">
                                        { !isMyMessage(msg) && (
                                            <p className="text-xs text-gray-600 mb-1 px-2">
                                                { msg.sender } ({ msg.senderRole })
                                            </p>
                                        ) }
                                        <div
                                            className={ `px-4 py-3 rounded-2xl ${isMyMessage(msg)
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-800 text-white'
                                                }` }
                                        >
                                            <p className="text-sm break-words">{ msg.text }</p>
                                            <p className="text-xs opacity-70 mt-1">{ msg.time }</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) }
                        <div ref={ messagesEndRef } />
                    </div>

                    {/* Input Area */ }
                    <div className="p-4 border-t border-gray-200 bg-white">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={ message }
                                onChange={ (e) => setMessage(e.target.value) }
                                onKeyPress={ handleKeyPress }
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500 transition"
                            />
                            <button
                                onClick={ handleSend }
                                disabled={ !message.trim() }
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:opacity-90 transition disabled:opacity-50"
                                style={ { backgroundColor: colors.primary } }
                            >
                                <Send size={ 20 } />
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </>
    );
};

export default ChatPopup;