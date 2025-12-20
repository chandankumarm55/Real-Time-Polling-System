import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { chatAPI, studentAPI } from '../../services/api';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const ChatPopup = ({ userName, userRole }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('chat');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const { socketService, socket } = useSocket();
    const messagesEndRef = useRef(null);
    const listenersSetUp = useRef(false);

    // Set up socket listeners
    useEffect(() => {
        if (!socket || listenersSetUp.current) return;

        console.log('🎧 Setting up chat listeners');

        // Listen for new chat messages
        const handleNewMessage = (newMessage) => {
            console.log('💬 New chat message:', newMessage);
            setMessages(prev => [...prev, {
                id: newMessage._id || Date.now(),
                text: newMessage.message,
                sender: newMessage.sender,
                senderRole: newMessage.senderRole,
                time: new Date(newMessage.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
            }]);
        };

        // Listen for participant updates
        const handleStudentsList = (studentsList) => {
            console.log('👥 Participants updated:', studentsList.length);
            setParticipants(studentsList);
        };

        socket.on('chat:newMessage', handleNewMessage);
        socket.on('students:list', handleStudentsList);

        listenersSetUp.current = true;

        return () => {
            socket.off('chat:newMessage', handleNewMessage);
            socket.off('students:list', handleStudentsList);
            listenersSetUp.current = false;
        };
    }, [socket]);

    // Load chat history and participants on mount
    useEffect(() => {
        loadChatHistory();
        loadParticipants();
    }, []);

    // Auto-scroll to bottom when new messages arrive
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

    const loadParticipants = async () => {
        try {
            // Request via socket
            if (socketService && socket) {
                socketService.getActiveStudents();
            }

            // Also fetch via API as backup
            const response = await studentAPI.getActive();
            if (response.data.data) {
                setParticipants(response.data.data);
            }
        } catch (error) {
            console.error('Error loading participants:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = () => {
        if (message.trim() === '') return;

        socketService.sendChatMessage(userName, message.trim(), userRole);
        setMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleKickStudent = (studentId) => {
        socketService.kickStudent(studentId);

    };

    const isMyMessage = (msg) => {
        return msg.sender === userName && msg.senderRole === userRole;
    };

    // Refresh participants when tab is opened
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'participants') {
            loadParticipants();
        }
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

                    {/* Tabs */ }
                    <div className="flex border-b border-gray-200 bg-white">
                        <button
                            onClick={ () => handleTabChange('chat') }
                            className={ `flex-1 py-3 px-4 font-semibold text-sm transition-all ${activeTab === 'chat'
                                ? 'border-b-2 text-purple-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }` }
                            style={ {
                                borderBottomColor: activeTab === 'chat' ? colors.primary : 'transparent'
                            } }
                        >
                            Chat
                        </button>
                        <button
                            onClick={ () => handleTabChange('participants') }
                            className={ `flex-1 py-3 px-4 font-semibold text-sm transition-all ${activeTab === 'participants'
                                ? 'border-b-2 text-purple-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }` }
                            style={ {
                                borderBottomColor: activeTab === 'participants' ? colors.primary : 'transparent'
                            } }
                        >
                            Participants ({ participants.length })
                        </button>
                    </div>

                    {/* Chat Tab Content */ }
                    { activeTab === 'chat' && (
                        <>
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
                        </>
                    ) }

                    {/* Participants Tab Content */ }
                    { activeTab === 'participants' && (
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            { participants.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    No participants yet
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Header Row */ }
                                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4 pb-2 border-b border-gray-300">
                                        <span className="font-semibold">Name</span>
                                        { userRole === 'teacher' && (
                                            <span className="font-semibold">Action</span>
                                        ) }
                                    </div>

                                    {/* Participants List */ }
                                    { participants.map((participant) => (
                                        <div
                                            key={ participant.socketId || participant._id }
                                            className="flex justify-between items-center py-3 px-3 hover:bg-white rounded-lg transition"
                                        >
                                            <span className="font-medium text-gray-800">
                                                { participant.name }
                                            </span>
                                            { userRole === 'teacher' && (
                                                <button
                                                    onClick={ () => handleKickStudent(participant.socketId) }
                                                    className="text-[rgba(29,104,189,1)] text-sm hover:underline font-medium"
                                                >
                                                    Kick out
                                                </button>

                                            ) }
                                        </div>
                                    )) }
                                </div>
                            ) }
                        </div>
                    ) }
                </div>
            ) }
        </>
    );
};

export default ChatPopup;