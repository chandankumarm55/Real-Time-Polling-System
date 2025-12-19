// src/components/teacher/CreateQuestionPage.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const colors = {
    primary: '#7765DA',
    secondary: '#5767D0',
    accent: '#4F0DCE',
    lightGray: '#F2F2F2',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const CreateQuestionPage = ({ onAskQuestion }) => {
    const [question, setQuestion] = useState('');
    const [timeLimit, setTimeLimit] = useState(60);
    const [options, setOptions] = useState([
        { id: 1, text: '', isCorrect: true },
        { id: 2, text: '', isCorrect: false },
    ]);

    const addOption = () => {
        setOptions([...options, { id: Date.now(), text: '', isCorrect: false }]);
    };

    const updateOption = (id, text) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
    };

    const updateCorrectAnswer = (id, value) => {
        setOptions(options.map(opt => ({ ...opt, isCorrect: opt.id === id ? value : !value })));
    };

    const handleAskQuestion = () => {
        onAskQuestion({ question, options, timeLimit });
    };

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-start mb-8">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                        <span className="text-lg">✦</span>
                        Intervue Poll
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2">Let's Get Started</h1>
                <p className="text-gray-600 mb-8">
                    you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                </p>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold">Enter your question</label>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{ timeLimit } seconds</span>
                            <ChevronDown size={ 20 } style={ { color: colors.primary } } />
                        </div>
                    </div>
                    <textarea
                        value={ question }
                        onChange={ (e) => setQuestion(e.target.value) }
                        placeholder="Rahul Bajaj"
                        className="w-full p-4 border border-gray-200 rounded-xl resize-none h-32 focus:outline-none focus:border-purple-400"
                    />
                    <div className="text-right text-sm text-gray-500 mt-1">0/100</div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-semibold mb-4">Edit Options</h3>
                        { options.map((option, index) => (
                            <div key={ option.id } className="mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                                        style={ { backgroundColor: colors.primary } }
                                    >
                                        { index + 1 }
                                    </div>
                                    <input
                                        value={ option.text }
                                        onChange={ (e) => updateOption(option.id, e.target.value) }
                                        placeholder="Rahul Bajaj"
                                        className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                            </div>
                        )) }
                        <button
                            onClick={ addOption }
                            className="text-purple-600 font-medium text-sm mt-2 hover:underline"
                        >
                            + Add More option
                        </button>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Is it Correct?</h3>
                        { options.map((option) => (
                            <div key={ option.id } className="mb-3 flex items-center gap-4 h-14">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={ `correct-${option.id}` }
                                        checked={ option.isCorrect }
                                        onChange={ () => updateCorrectAnswer(option.id, true) }
                                        className="w-5 h-5 accent-purple-600"
                                    />
                                    <span>Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={ `correct-${option.id}` }
                                        checked={ !option.isCorrect }
                                        onChange={ () => updateCorrectAnswer(option.id, false) }
                                        className="w-5 h-5 accent-gray-400"
                                    />
                                    <span>No</span>
                                </label>
                            </div>
                        )) }
                    </div>
                </div>

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