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
        console.log('Option clicked:', optionId);
        if (hasAnswered || timeLeft === 0) {
            console.log('Cannot select - already answered or time up');
            return;
        }
        console.log('Setting selected option to:', optionId);
        setSelectedOption(optionId);
    };

    const handleSubmit = () => {
        console.log('Submit clicked, selected option:', selectedOption);
        if (selectedOption !== null && !hasAnswered && timeLeft > 0) {
            onSubmit(selectedOption);
        } else {
            console.log('Cannot submit:', { selectedOption, hasAnswered, timeLeft });
        }
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

    const isDisabled = hasAnswered || timeLeft === 0;

    return (
        <div className="min-h-screen bg-white pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Question Header */ }
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold" style={ { color: colors.darkGray } }>
                        Question { question.questionNumber || 1 }
                    </h2>
                    <div className={ `flex items-center gap-2 font-semibold ${getTimerColor()}` }>
                        <Clock size={ 18 } />
                        <span className="text-base">{ formatTime(timeLeft) }</span>
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

                {/* Question Box with Gradient */ }
                <div
                    className="rounded-xl p-5 mb-6"
                    style={ {
                        background: 'linear-gradient(135deg, #343434 0%, #6E6E6E 100%)'
                    } }
                >
                    <p className="text-white text-base font-medium">{ question.text }</p>
                </div>

                {/* Options */ }
                <div className="space-y-3 mb-6">
                    { question.options && question.options.map((option, index) => {
                        const optionId = option.id !== undefined ? option.id : index;
                        const isSelected = selectedOption === optionId;

                        return (
                            <button
                                key={ optionId }
                                type="button"
                                onClick={ () => handleOptionClick(optionId) }
                                disabled={ isDisabled }
                                className={ `w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${isDisabled
                                    ? 'cursor-not-allowed opacity-70'
                                    : 'cursor-pointer hover:border-purple-300 hover:bg-purple-50'
                                    } ${isSelected
                                        ? 'border-purple-600 bg-purple-50'
                                        : 'border-gray-200 bg-white'
                                    }` }
                            >
                                <div
                                    className={ `w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold transition-all ${isSelected
                                        ? 'text-white'
                                        : 'text-gray-400 border-2 border-gray-300'
                                        }` }
                                    style={ isSelected ? { backgroundColor: colors.primary } : {} }
                                >
                                    { index + 1 }
                                </div>
                                <span
                                    className="text-sm font-medium text-left"
                                    style={ { color: colors.darkGray } }
                                >
                                    { option.text }
                                </span>
                            </button>
                        );
                    }) }
                </div>

                {/* Submit Button */ }
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={ handleSubmit }
                        disabled={ selectedOption === null || hasAnswered || timeLeft === 0 }
                        style={ { backgroundColor: colors.primary } }
                        className="px-12 py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit
                    </button>
                </div>

                {/* Info Message */ }
                { hasAnswered && (
                    <div className="text-center mt-6">
                        <p className="text-base font-semibold text-green-600">
                            ✓ Answer submitted! Waiting for results...
                        </p>
                    </div>
                ) }
            </div>
        </div>
    );
};

export default StudentQuestionPage;