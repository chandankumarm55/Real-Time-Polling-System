// src/components/student/StudentNameEntry.jsx
import React, { useState } from 'react';

const StudentNameEntry = ({ onSubmit, isLoading = false }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && !isLoading) {
            onSubmit(name.trim());
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome Student! 👋
                    </h1>
                    <p className="text-gray-600">
                        Enter your name to join the session
                    </p>
                </div>

                <form onSubmit={ handleSubmit } className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={ name }
                            onChange={ (e) => setName(e.target.value) }
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            required
                            disabled={ isLoading }
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={ !name.trim() || isLoading }
                        className={ `w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${!name.trim() || isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                            }` }
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
                            'Join Session'
                        ) }
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Make sure your internet connection is stable
                </div>
            </div>
        </div>
    );
};

export default StudentNameEntry;