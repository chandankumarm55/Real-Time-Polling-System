// src/components/student/StudentResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const StudentResultsPage = ({ question, studentName }) => {
    const [results, setResults] = useState([]);

    useEffect(() => {
        // Simulate poll results
        const mockResults = question.options.map((opt) => ({
            ...opt,
            percentage: Math.floor(Math.random() * 100),
        }));
        setResults(mockResults);
    }, [question]);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Question Header */ }
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold" style={ { color: colors.darkGray } }>
                        Question { question.questionNumber }
                    </h2>
                    <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <Clock size={ 20 } />
                        <span>00:15</span>
                    </div>
                </div>

                {/* Question Box */ }
                <div
                    className="rounded-2xl p-6 mb-6"
                    style={ { backgroundColor: colors.darkGray } }
                >
                    <p className="text-white text-lg font-medium">{ question.text }</p>
                </div>

                {/* Results */ }
                <div className="space-y-4 mb-8">
                    { results.map((option) => (
                        <div
                            key={ option.id }
                            className="bg-white rounded-2xl p-5 border-2 border-gray-200"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center"
                                        style={ { backgroundColor: colors.primary } }
                                    >
                                        <div className="w-3 h-3 rounded-full bg-white"></div>
                                    </div>
                                    <span
                                        className="text-base font-medium"
                                        style={ { color: colors.darkGray } }
                                    >
                                        { option.text }
                                    </span>
                                </div>
                                <span
                                    className="font-bold text-lg"
                                    style={ { color: colors.darkGray } }
                                >
                                    { option.percentage }%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={ {
                                        width: `${option.percentage}%`,
                                        backgroundColor: colors.primary,
                                    } }
                                ></div>
                            </div>
                        </div>
                    )) }
                </div>

                {/* Waiting Message */ }
                <div className="text-center">
                    <p className="text-lg font-semibold" style={ { color: colors.darkGray } }>
                        Wait for the teacher to ask a new question..
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentResultsPage;