// src/components/teacher/LiveQuestionPage.jsx
import React, { useState } from 'react';
import { Eye, MessageSquare } from 'lucide-react';

const colors = {
    primary: '#7765DA',
    secondary: '#5767D0',
    accent: '#4F0DCE',
    lightGray: '#F2F2F2',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const LiveQuestionPage = ({ questionData, onNewQuestion, onViewHistory }) => {
    const [activeTab, setActiveTab] = useState('chat');
    const [chatMessages] = useState([
        { id: 1, user: 'User 1', message: 'Hey There, how can I help?', isTeacher: false },
        { id: 2, user: 'User 2', message: 'Nothing bro..just chilll!', isTeacher: true },
    ]);

    const participants = [
        { id: 1, name: 'Rahul Arora' },
        { id: 2, name: 'Pushpender Rautela' },
        { id: 3, name: 'Rijul Zaipuri' },
        { id: 4, name: 'Nadeem N' },
        { id: 5, name: 'Ashwin Sharma' },
    ];

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <h1 className="text-2xl font-bold">Question</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={ onViewHistory }
                            style={ { backgroundColor: colors.primary } }
                            className="px-6 py-2 rounded-full text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            <Eye size={ 18 } />
                            View Poll history
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 text-white p-6 rounded-t-2xl">
                            <p className="text-lg">{ questionData.question }</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-b-2xl space-y-3">
                            { questionData.options.map((option, index) => (
                                <div
                                    key={ index }
                                    className="flex items-center gap-4 rounded-xl overflow-hidden"
                                >
                                    <div className="relative w-full">
                                        <div
                                            className="h-12 rounded-xl flex items-center justify-between px-4"
                                            style={ {
                                                background: `linear-gradient(to right, ${colors.primary} ${option.percentage}%, transparent ${option.percentage}%)`,
                                            } }
                                        >
                                            <div className="flex items-center gap-3 relative z-10">
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                                    style={ { backgroundColor: colors.primary } }
                                                >
                                                    { index + 1 }
                                                </div>
                                                <span className="font-medium">{ option.text }</span>
                                            </div>
                                            <span className="font-bold relative z-10">{ option.percentage }%</span>
                                        </div>
                                    </div>
                                </div>
                            )) }
                        </div>

                        <div className="flex justify-center mt-8">
                            <button
                                onClick={ onNewQuestion }
                                style={ { backgroundColor: colors.primary } }
                                className="px-10 py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity"
                            >
                                + Ask a new question
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={ () => setActiveTab('chat') }
                                className={ `flex-1 py-3 font-medium ${activeTab === 'chat'
                                    ? 'border-b-2 text-purple-600'
                                    : 'text-gray-500'
                                    }` }
                                style={ { borderColor: activeTab === 'chat' ? colors.primary : 'transparent' } }
                            >
                                Chat
                            </button>
                            <button
                                onClick={ () => setActiveTab('participants') }
                                className={ `flex-1 py-3 font-medium ${activeTab === 'participants'
                                    ? 'border-b-2 text-purple-600'
                                    : 'text-gray-500'
                                    }` }
                                style={ { borderColor: activeTab === 'participants' ? colors.primary : 'transparent' } }
                            >
                                Participants
                            </button>
                        </div>

                        <div className="p-4 h-96 overflow-y-auto">
                            { activeTab === 'chat' ? (
                                <div className="space-y-4">
                                    { chatMessages.map((msg) => (
                                        <div key={ msg.id }>
                                            <div className="text-xs text-gray-500 mb-1">{ msg.user }</div>
                                            <div
                                                className={ `inline-block px-4 py-2 rounded-2xl ${msg.isTeacher
                                                    ? 'bg-purple-600 text-white ml-auto'
                                                    : 'bg-gray-800 text-white'
                                                    }` }
                                            >
                                                { msg.message }
                                            </div>
                                        </div>
                                    )) }
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                                        <span>Name</span>
                                        <span>Action</span>
                                    </div>
                                    { participants.map((participant) => (
                                        <div key={ participant.id } className="flex justify-between items-center py-2">
                                            <span>{ participant.name }</span>
                                            <button className="text-purple-600 text-sm hover:underline">
                                                Kick out
                                            </button>
                                        </div>
                                    )) }
                                </div>
                            ) }
                        </div>
                    </div>
                </div>

                <button
                    className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity"
                    style={ { backgroundColor: colors.primary } }
                >
                    <MessageSquare size={ 24 } />
                </button>
            </div>
        </div>
    );
};

export default LiveQuestionPage;