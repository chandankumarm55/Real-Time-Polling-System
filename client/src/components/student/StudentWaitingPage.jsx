import React from 'react';

const colors = {
    primary: '#7765DA',
    secondary: '#5767D0',
    darkGray: '#373737',
};

const StudentWaitingPage = ({ studentName }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
            <div className="w-full max-w-2xl text-center">
                {/* Badge */ }
                <div className="flex justify-center mb-8">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                        px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
                        <span className="text-sm">✦</span>
                        Intervue Poll
                    </div>
                </div>

                {/* Loading Spinner */ }
                <div className="mb-8 flex justify-center">
                    <div className="relative w-16 h-16">
                        <div
                            className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                            style={ { borderColor: colors.primary, borderTopColor: 'transparent' } }
                        ></div>
                    </div>
                </div>


                <h2 className="text-xl font-medium" style={ { color: colors.darkGray } }>
                    Wait for the teacher to ask questions..
                </h2>
            </div>
        </div>
    );
};

export default StudentWaitingPage;