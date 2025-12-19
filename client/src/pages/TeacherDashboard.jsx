// src/pages/TeacherDashboard.jsx
import React, { useState } from 'react';
import CreateQuestionPage from '../components/teacher/CreateQuestionPage';
import LiveQuestionPage from '../components/teacher/LiveQuestionPage';
import PollHistoryPage from '../components/teacher/PollHistoryPage';
import Header from '../components/common/Header';
import ChatPopup from '../components/common/ChatPopup';

const TeacherDashboard = () => {
    const [currentPage, setCurrentPage] = useState('create-question');
    const [currentQuestion, setCurrentQuestion] = useState(null);

    const handleAskQuestion = (questionData) => {
        setCurrentQuestion({
            ...questionData,
            options: questionData.options.map(opt => ({
                ...opt,
                percentage: Math.floor(Math.random() * 100),
            })),
        });
        setCurrentPage('live-question');
    };

    const handleNewQuestion = () => {
        setCurrentPage('create-question');
        setCurrentQuestion(null);
    };

    const handleViewHistory = () => {
        setCurrentPage('poll-history');
    };

    const handleBackFromHistory = () => {
        setCurrentPage('live-question');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header userName="Teacher" userRole="teacher" />

            { currentPage === 'create-question' && (
                <CreateQuestionPage onAskQuestion={ handleAskQuestion } />
            ) }

            { currentPage === 'live-question' && currentQuestion && (
                <LiveQuestionPage
                    question={ currentQuestion }
                    onNewQuestion={ handleNewQuestion }
                    onViewHistory={ handleViewHistory }
                />
            ) }

            { currentPage === 'poll-history' && (
                <PollHistoryPage onBack={ handleBackFromHistory } />
            ) }

            <ChatPopup />
        </div>
    );
};

export default TeacherDashboard;