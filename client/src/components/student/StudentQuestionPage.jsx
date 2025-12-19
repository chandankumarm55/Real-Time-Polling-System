// src/components/student/StudentQuestionPage.jsx
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
    lightGray: '#F2F2F2',
};

const StudentQuestionPage = ({ question, studentName, onSubmit }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [timeLeft, setTimeLeft] = useState(question.timeLimit || 60);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        if (!selectedOption) {
                            onSubmit(null);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [timeLeft, selectedOption, onSubmit]);

    const handleSubmit = () => {
        if (selectedOption) {
            onSubmit(selectedOption);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Question Header */ }
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold" style={ { color: colors.darkGray } }>
                        Question { question.questionNumber }
                    </h2>
                    <div
                        className="flex items-center gap-2 text-red-600 font-semibold"
                    >
                        <Clock size={ 20 } />
                        <span>{ formatTime(timeLeft) }</span>
                    </div>
                </div>

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
                            onClick={ () => setSelectedOption(option.id) }
                            className={ `flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedOption === option.id
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
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

                {/* Submit Button */ }
                <div className="flex justify-center">
                    <button
                        onClick={ handleSubmit }
                        disabled={ !selectedOption }
                        className="px-16 py-3 rounded-full text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                        style={ { backgroundColor: colors.primary } }
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentQuestionPage;