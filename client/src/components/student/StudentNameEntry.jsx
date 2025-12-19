// src/components/student/StudentNameEntry.jsx
import React, { useState } from 'react';

const colors = {
    primary: '#7765DA',
    secondary: '#5767D0',
    accent: '#4F0DCE',
    lightGray: '#F2F2F2',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const StudentNameEntry = ({ onSubmit }) => {
    const [name, setName] = useState('');

    const handleSubmit = () => {
        if (name.trim()) {
            onSubmit(name.trim());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && name.trim()) {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-2xl">
                {/* Logo Badge */ }
                <div className="flex justify-center mb-8">
                    <div
                        className="px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2"
                        style={ { backgroundColor: colors.primary } }
                    >
                        <span className="text-lg">✦</span>
                        <span>Intervue Poll</span>
                    </div>
                </div>

                {/* Main Card */ }
                <div className="bg-white rounded-3xl shadow-lg p-12">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4" style={ { color: colors.darkGray } }>
                            Let's Get Started
                        </h1>
                        <p className="text-base" style={ { color: colors.mediumGray } }>
                            If you're a student, you'll be able to <span className="font-semibold">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
                        </p>
                    </div>

                    {/* Input Field */ }
                    <div className="mb-8">
                        <label
                            className="block text-sm font-medium mb-3"
                            style={ { color: colors.darkGray } }
                        >
                            Enter your Name
                        </label>
                        <input
                            type="text"
                            value={ name }
                            onChange={ (e) => setName(e.target.value) }
                            onKeyPress={ handleKeyPress }
                            placeholder="Rahul Bajaj"
                            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-base"
                            style={ { backgroundColor: colors.lightGray } }
                        />
                    </div>

                    {/* Continue Button */ }
                    <div className="flex justify-center">
                        <button
                            onClick={ handleSubmit }
                            disabled={ !name.trim() }
                            className="px-12 py-3 rounded-full text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                            style={ { backgroundColor: colors.primary } }
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentNameEntry;