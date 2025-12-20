
import React from 'react';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const StudentKickedPage = () => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="w-full max-w-2xl text-center">
                {/* Badge */ }
                <div className="flex justify-center mb-8">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                        px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
                        <span className="text-sm">✦</span>
                        Intervue Poll
                    </div>
                </div>

                {/* Message */ }
                <h2 className="text-3xl font-bold mb-3" style={ { color: colors.darkGray } }>
                    You've been Kicked out !
                </h2>
                <p className="text-sm" style={ { color: colors.mediumGray } }>
                    Looks like the teacher had removed you from the poll system. Please Try again sometime.
                </p>
            </div>
        </div>
    );
};

export default StudentKickedPage;