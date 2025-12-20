import React, { useState } from 'react';

const colors = {
    primary: '#7765DA',
    secondary: '#5767D0',
    accent: '#4F0DCE',
    lightGray: '#F2F2F2',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const StudentNameEntry = ({ onSubmit, isLoading = false }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && !isLoading) {
            onSubmit(name.trim());
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* Badge */ }
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                        px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
                        <span className="text-sm">✦</span>
                        Intervue Poll
                    </div>
                </div>

                {/* Heading */ }
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-3" style={ { color: colors.darkGray } }>
                        Let's Get Started
                    </h1>
                    <p className="text-sm leading-relaxed" style={ { color: colors.mediumGray } }>
                        If you're a student, you'll be able to <span className="font-semibold">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
                    </p>
                </div>

                {/* Form */ }
                <form onSubmit={ handleSubmit } className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold mb-2"
                            style={ { color: colors.darkGray } }
                        >
                            Enter your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={ name }
                            onChange={ (e) => setName(e.target.value) }
                            placeholder="Rahul Bajaj"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                            style={ { backgroundColor: colors.lightGray } }
                            required
                            disabled={ isLoading }
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={ !name.trim() || isLoading }
                        style={ { backgroundColor: colors.primary } }
                        className="w-full py-3 px-4 rounded-full font-medium text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        { isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="animate-spin h-5 w-5 mr-3"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Joining...
                            </span>
                        ) : (
                            'Continue'
                        ) }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentNameEntry;