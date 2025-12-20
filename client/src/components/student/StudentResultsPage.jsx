import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const StudentResultsPage = ({ question, studentName, initialTimeLeft }) => {
    const [timeLeft, setTimeLeft] = useState(initialTimeLeft || 0);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (timeLeft <= 10) return 'text-red-600';
        if (timeLeft <= 30) return 'text-orange-600';
        return 'text-gray-700';
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Question Header */ }
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold" style={ { color: colors.darkGray } }>
                        Question { question.questionNumber || 1 }
                    </h2>
                    { timeLeft > 0 && (
                        <div className={ `flex items-center gap-2 font-semibold ${getTimerColor()}` }>
                            <Clock size={ 18 } />
                            <span className="text-base">{ formatTime(timeLeft) }</span>
                        </div>
                    ) }
                </div>

                {/* Question Box with Gradient */ }
                <div
                    className="rounded-xl p-5 mb-6"
                    style={ {
                        background: 'linear-gradient(135deg, #343434 0%, #6E6E6E 100%)'
                    } }
                >
                    <p className="text-white text-base font-medium">{ question.text }</p>
                </div>

                {/* Results */ }
                <div className="space-y-3 mb-8 border border-gray-200 rounded-xl p-4 bg-white">
                    { question.options && question.options.map((option, index) => {
                        const percentage = option.percentage || 0;

                        return (
                            <div
                                key={ option.id || index }
                                className="relative h-12 rounded-lg overflow-hidden border border-gray-200"
                                style={ {
                                    background: `linear-gradient(to right, ${colors.primary} ${percentage}%, white ${percentage}%)`
                                } }
                            >
                                <div className="absolute inset-0 flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 border-2 border-white"
                                            style={ { backgroundColor: colors.primary } }
                                        >
                                            { index + 1 }
                                        </div>
                                        <span
                                            className="text-sm font-medium"
                                            style={ { color: colors.darkGray } }
                                        >
                                            { option.text }
                                        </span>
                                    </div>
                                    <div className="relative z-10">
                                        <span
                                            className="font-bold text-base"
                                            style={ { color: colors.darkGray } }
                                        >
                                            { percentage }%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    }) }
                </div>

                {/* Waiting Message */ }
                <div className="text-center">
                    <p className="text-base font-medium" style={ { color: colors.darkGray } }>
                        Wait for the teacher to ask a new question..
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentResultsPage;