// src/components/teacher/PollHistoryPage.jsx
import React from 'react';
import { MessageSquare } from 'lucide-react';

const colors = {
    primary: '#7765DA',
    secondary: '#5767D0',
    accent: '#4F0DCE',
    lightGray: '#F2F2F2',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const PollHistoryPage = ({ onBack }) => {
    const historyData = [
        {
            id: 1,
            question: 'Which planet is known as the Red Planet?',
            options: [
                { text: 'Mars', percentage: 75 },
                { text: 'Venus', percentage: 5 },
                { text: 'Jupiter', percentage: 5 },
                { text: 'Saturn', percentage: 15 },
            ],
        },
        {
            id: 2,
            question: 'Which planet is known as the Red Planet?',
            options: [
                { text: 'Mars', percentage: 75 },
                { text: 'Venus', percentage: 5 },
                { text: 'Jupiter', percentage: 5 },
                { text: 'Saturn', percentage: 15 },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">View Poll History</h1>

                <div className="space-y-8">
                    { historyData.map((poll) => (
                        <div key={ poll.id } className="border-b border-gray-200 pb-8">
                            <h2 className="font-semibold mb-4">Question { poll.id }</h2>

                            <div className="bg-gray-800 text-white p-6 rounded-t-2xl">
                                <p>{ poll.question }</p>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-b-2xl space-y-3">
                                { poll.options.map((option, index) => (
                                    <div key={ index } className="relative">
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
                                )) }
                            </div>
                        </div>
                    )) }
                </div>

                <button
                    onClick={ onBack }
                    className="fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity"
                    style={ { backgroundColor: colors.primary } }
                >
                    <MessageSquare size={ 24 } />
                </button>
            </div>
        </div>
    );
};

export default PollHistoryPage;