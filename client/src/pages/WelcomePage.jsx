// src/components/WelcomePage.jsx
import React, { useState } from 'react';

const colors = {
    primary: '#7765DA',
    secondary: '#5767D0',
    accent: '#4F0DCE',
    lightGray: '#F2F2F2',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const WelcomePage = ({ onSelectRole }) => {
    const [selectedRole, setSelectedRole] = useState('');

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="w-full max-w-3xl">
                <div className="flex justify-center mb-8">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                        <span className="text-lg">✦</span>
                        Intervue Poll
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-center mb-4">
                    Welcome to the <span className="font-extrabold">Live Polling System</span>
                </h1>
                <p className="text-center text-gray-600 mb-12">
                    Please select the role that best describes you to begin using the live polling system
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div
                        onClick={ () => setSelectedRole('student') }
                        className={ `border-2 rounded-2xl p-8 cursor-pointer transition-all ${selectedRole === 'student'
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }` }
                    >
                        <h3 className="text-xl font-bold mb-3">I'm a Student</h3>
                        <p className="text-gray-600 text-sm">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry
                        </p>
                    </div>

                    <div
                        onClick={ () => setSelectedRole('teacher') }
                        className={ `border-2 rounded-2xl p-8 cursor-pointer transition-all ${selectedRole === 'teacher'
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }` }
                    >
                        <h3 className="text-xl font-bold mb-3">I'm a Teacher</h3>
                        <p className="text-gray-600 text-sm">
                            Submit answers and view live poll results in real-time.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={ () => selectedRole && onSelectRole(selectedRole) }
                        disabled={ !selectedRole }
                        style={ { backgroundColor: colors.primary } }
                        className="px-12 py-3 rounded-full text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity hover:pointer"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;