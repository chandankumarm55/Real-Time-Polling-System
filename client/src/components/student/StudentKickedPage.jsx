// src/components/student/StudentKickedPage.jsx
import React from 'react';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const StudentKickedPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-2xl text-center">
                {/* Logo Badge */ }
                <div className="flex justify-center mb-12">
                    <div
                        className="px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2"
                        style={ { backgroundColor: colors.primary } }
                    >
                        <span className="text-lg">✦</span>
                        <span>Intervue Poll</span>
                    </div>
                </div>

                {/* Icon */ }
                <div className="mb-8 flex justify-center">
                    <div
                        className="w-24 h-24 rounded-full flex items-center justify-center"
                        style={ { backgroundColor: '#FEE2E2' } }
                    >
                        <svg
                            className="w-12 h-12 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={ 2 }
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                </div>

                {/* Message */ }
                <h2 className="text-3xl font-bold mb-3" style={ { color: colors.darkGray } }>
                    You've been Kicked out !
                </h2>
                <p className="text-base" style={ { color: colors.mediumGray } }>
                    Looks like the teacher had removed you from the poll system. Please Try again sometime.
                </p>
            </div>
        </div>
    );
};

export default StudentKickedPage;