import React from 'react';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const StudentResultsPage = ({ question, studentName }) => {
    return (
        <div className="min-h-screen bg-white pt-24 pb-12 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Question Header */ }
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold" style={ { color: colors.darkGray } }>
                        Question { question.questionNumber || 1 }
                    </h2>
                    <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="text-base">00:15</span>
                    </div>
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