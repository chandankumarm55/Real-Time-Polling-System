import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
    lightGray: '#F2F2F2',
};

const StudentQuestionPage = ({ question, studentName, onSubmit, hasAnswered }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [timeLeft, setTimeLeft] = useState(question.timeLimit || 60);

    // Timer countdown effect
    useEffect(() => {
        if (hasAnswered || timeLeft <= 0) return;

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
    }, [hasAnswered, timeLeft]);

    const handleOptionClick = (optionId) => {
        // Can't click if already answered OR time is up
        if (hasAnswered || timeLeft === 0) return;

        setSelectedOption(optionId);
        onSubmit(optionId);
    };

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

    // Check if disabled (answered or timed out)
    const isDisabled = hasAnswered || timeLeft === 0;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Question Header */ }
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold" style={ { color: colors.darkGray } }>
                        Question { question.questionNumber }
                    </h2>
                    <div className={ `flex items-center gap-2 font-semibold ${getTimerColor()}` }>
                        <Clock size={ 20 } />
                        <span className="text-lg">{ formatTime(timeLeft) }</span>
                    </div>
                </div>

                {/* Timer Warning */ }
                { timeLeft <= 10 && timeLeft > 0 && !hasAnswered && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm font-medium text-center">
                            ⚠️ Hurry! Only { timeLeft } seconds left
                        </p>
                    </div>
                ) }

                {/* Time Up Message */ }
                { timeLeft === 0 && !hasAnswered && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-orange-800 text-sm font-bold text-center">
                            ⏰ Time's up! Waiting for results...
                        </p>
                    </div>
                ) }

                {/* Question Box */ }
                <div
                    className="rounded-2xl p-6 mb-6"
                    style={ { backgroundColor: colors.darkGray } }
                >
                    <p className="text-white text-lg font-medium">{ question.text }</p>
                </div>

                {/* Options */ }
                <div className="space-y-4 mb-8">
                    { question.options.map((option) => (
                        <div
                            key={ option.id }
                            onClick={ () => handleOptionClick(option.id) }
                            className={ `flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${isDisabled
                                ? 'cursor-not-allowed opacity-70'
                                : 'cursor-pointer hover:border-gray-300 hover:shadow-md'
                                } ${selectedOption === option.id
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-200 bg-white'
                                }` }
                        >
                            <div
                                className={ `w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedOption === option.id
                                    ? 'border-purple-600'
                                    : 'border-gray-300'
                                    }` }
                            >
                                { selectedOption === option.id && (
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={ { backgroundColor: colors.primary } }
                                    ></div>
                                ) }
                            </div>
                            <span
                                className="text-base font-medium"
                                style={ { color: colors.darkGray } }
                            >
                                { option.text }
                            </span>
                        </div>
                    )) }
                </div>

                {/* Info Message */ }
                { hasAnswered && (
                    <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">
                            ✓ Answer submitted! Waiting for results...
                        </p>
                    </div>
                ) }
            </div>
        </div>
    );
};

export default StudentQuestionPage;