// src/components/teacher/CreateQuestionPage.jsx
import React, { useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
    lightGray: '#F2F2F2',
};

const CreateQuestionPage = ({ onAskQuestion }) => {
    const [question, setQuestion] = useState('');
    const [timeLimit, setTimeLimit] = useState(60);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [options, setOptions] = useState([
        { id: 1, text: '', isCorrect: true },
        { id: 2, text: '', isCorrect: false },
    ]);

    const timeOptions = [30, 45, 60, 90, 120];

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, { id: Date.now(), text: '', isCorrect: false }]);
        }
    };

    const removeOption = (id) => {
        if (options.length > 2) {
            setOptions(options.filter(opt => opt.id !== id));
        }
    };

    const updateOption = (id, text) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
    };

    const setCorrectOption = (id) => {
        setOptions(options.map(opt => ({
            ...opt,
            isCorrect: opt.id === id
        })));
    };

    const handleAskQuestion = () => {
        // Validation
        if (!question.trim()) {
            alert('Please enter a question');
            return;
        }

        const filledOptions = options.filter(opt => opt.text.trim());
        if (filledOptions.length < 2) {
            alert('Please provide at least 2 options');
            return;
        }

        // Check if at least one correct answer is selected
        const hasCorrectAnswer = filledOptions.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
            alert('Please mark at least one option as correct');
            return;
        }

        onAskQuestion({
            question: question.trim(),
            options: filledOptions,
            timeLimit
        });
    };

    return (
        <div className="min-h-screen bg-white p-8 pt-24">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2" style={ { color: colors.darkGray } }>
                    Let's Get Started
                </h1>
                <p className="mb-8" style={ { color: colors.mediumGray } }>
                    You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                </p>

                {/* Question Input */ }
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold" style={ { color: colors.darkGray } }>
                            Enter your question
                        </label>
                        <div className="relative">
                            <button
                                onClick={ () => setShowTimePicker(!showTimePicker) }
                                className="flex items-center gap-2 font-semibold"
                                style={ { color: colors.primary } }
                            >
                                <span>{ timeLimit } seconds</span>
                                <ChevronDown size={ 20 } />
                            </button>

                            { showTimePicker && (
                                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                                    { timeOptions.map(time => (
                                        <button
                                            key={ time }
                                            onClick={ () => {
                                                setTimeLimit(time);
                                                setShowTimePicker(false);
                                            } }
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
                                        >
                                            { time } seconds
                                        </button>
                                    )) }
                                </div>
                            ) }
                        </div>
                    </div>
                    <textarea
                        value={ question }
                        onChange={ (e) => setQuestion(e.target.value) }
                        placeholder="Which planet is known as the Red Planet?"
                        className="w-full p-4 border border-gray-200 rounded-xl resize-none h-32 focus:outline-none focus:border-purple-400"
                        maxLength={ 200 }
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">
                        { question.length }/200
                    </div>
                </div>

                {/* Options */ }
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold" style={ { color: colors.darkGray } }>
                            Edit Options
                        </h3>
                        <h3 className="font-semibold" style={ { color: colors.darkGray } }>
                            Is it Correct?
                        </h3>
                    </div>
                    <div className="space-y-3">
                        { options.map((option, index) => (
                            <div key={ option.id } className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                                    style={ { backgroundColor: colors.primary } }
                                >
                                    { index + 1 }
                                </div>
                                <input
                                    value={ option.text }
                                    onChange={ (e) => updateOption(option.id, e.target.value) }
                                    placeholder={ `Option ${index + 1}` }
                                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                                    maxLength={ 100 }
                                />

                                {/* Radio buttons for correct answer */ }
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={ option.isCorrect === true }
                                            onChange={ () => setCorrectOption(option.id) }
                                            className="w-4 h-4 accent-purple-600"
                                        />
                                        <span className="text-sm">Yes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={ `incorrect-${option.id}` }
                                            checked={ option.isCorrect === false }
                                            onChange={ () => { } }
                                            className="w-4 h-4 accent-purple-600"
                                            disabled
                                        />
                                        <span className="text-sm">No</span>
                                    </label>
                                </div>

                                { options.length > 2 && (
                                    <button
                                        onClick={ () => removeOption(option.id) }
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={ 20 } />
                                    </button>
                                ) }
                            </div>
                        )) }
                    </div>

                    { options.length < 6 && (
                        <button
                            onClick={ addOption }
                            className="text-purple-600 font-medium text-sm mt-3 hover:underline"
                        >
                            + Add More option
                        </button>
                    ) }
                </div>

                {/* Submit Button */ }
                <div className="flex justify-end">
                    <button
                        onClick={ handleAskQuestion }
                        style={ { backgroundColor: colors.primary } }
                        className="px-10 py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        Ask Question
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateQuestionPage;