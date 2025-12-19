import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const colors = {
    primary: '#7765DA',
};

const ChatPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: 'Hey There, how can I help?', sender: 'other', time: '10:30 AM' },
        { id: 2, text: 'Nothing bro..just chilll!', sender: 'me', time: '10:32 AM' },
        { id: 3, text: 'Great! Let me know if you need anything.', sender: 'other', time: '10:33 AM' },
    ]);

    const handleSend = () => {
        if (message.trim() === '') return;

        const newMessage = {
            id: messages.length + 1,
            text: message,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([...messages, newMessage]);
        setMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
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
                <div className="fixed bottom-24 right-8 w-96 h-96 md:h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300">
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
                                <p className="text-sm opacity-90">5 participants</p>
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
                        { messages.map((msg) => (
                            <div
                                key={ msg.id }
                                className={ `flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}` }
                            >
                                <div
                                    className={ `max-w-xs px-4 py-3 rounded-2xl ${msg.sender === 'me'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-800 text-white'
                                        }` }
                                >
                                    <p className="text-sm">{ msg.text }</p>
                                    <p className="text-xs opacity-70 mt-1">{ msg.time }</p>
                                </div>
                            </div>
                        )) }
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
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:opacity-90 transition"
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