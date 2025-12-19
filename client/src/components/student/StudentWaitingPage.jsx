// src/components/student/StudentWaitingPage.jsx
import React from 'react';

const colors = {
    primary: '#7765DA',
    secondary: '#5767D0',
    darkGray: '#373737',
};

const StudentWaitingPage = ({ studentName }) => {
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

                {/* Loading Spinner */ }
                <div className="mb-8 flex justify-center">
                    <div className="relative w-20 h-20">
                        <div
                            className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                            style={ { borderColor: colors.primary, borderTopColor: 'transparent' } }
                        ></div>
                    </div>
                </div>

                {/* Message */ }
                <h2 className="text-2xl font-bold mb-2" style={ { color: colors.darkGray } }>
                    Wait for the teacher to ask questions..
                </h2>
            </div>
        </div>
    );
};

export default StudentWaitingPage;