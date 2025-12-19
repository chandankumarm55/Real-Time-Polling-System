// src/pages/StudentDashboard.jsx
import React, { useState } from 'react';
import StudentNameEntry from '../components/student/StudentNameEntry';
import StudentWaitingPage from '../components/student/StudentWaitingPage';
import StudentQuestionPage from '../components/student/StudentQuestionPage';
import StudentResultsPage from '../components/student/StudentResultsPage';
import StudentKickedPage from '../components/student/StudentKickedPage';
import Header from '../components/common/Header';
import ChatPopup from '../components/common/ChatPopup';

const StudentDashboard = () => {
    const [studentName, setStudentName] = useState('');
    const [currentPage, setCurrentPage] = useState('name-entry');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);

    const handleNameSubmit = (name) => {
        setStudentName(name);
        setCurrentPage('waiting');
    };

    // Simulate receiving a question from teacher
    const handleQuestionReceived = (question) => {
        setCurrentQuestion(question);
        setHasAnswered(false);
        setCurrentPage('question');
    };

    const handleAnswerSubmit = (answer) => {
        setHasAnswered(true);
        setCurrentPage('results');
    };

    const handleKicked = () => {
        setCurrentPage('kicked');
    };

    // For demo purposes - simulate question arrival
    React.useEffect(() => {
        if (currentPage === 'waiting') {
            const timer = setTimeout(() => {
                handleQuestionReceived({
                    questionNumber: 1,
                    text: 'Which planet is known as the Red Planet?',
                    options: [
                        { id: 1, text: 'Mars' },
                        { id: 2, text: 'Venus' },
                        { id: 3, text: 'Jupiter' },
                        { id: 4, text: 'Saturn' }
                    ],
                    timeLimit: 60
                });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentPage]);

    return (
        <div className="min-h-screen bg-gray-50">
            { studentName && <Header userName={ studentName } userRole="student" /> }

            { currentPage === 'name-entry' && (
                <StudentNameEntry onSubmit={ handleNameSubmit } />
            ) }

            { currentPage === 'waiting' && (
                <StudentWaitingPage studentName={ studentName } />
            ) }

            { currentPage === 'question' && currentQuestion && (
                <StudentQuestionPage
                    question={ currentQuestion }
                    studentName={ studentName }
                    onSubmit={ handleAnswerSubmit }
                />
            ) }

            { currentPage === 'results' && currentQuestion && (
                <StudentResultsPage
                    question={ currentQuestion }
                    studentName={ studentName }
                />
            ) }

            { currentPage === 'kicked' && (
                <StudentKickedPage />
            ) }

            <ChatPopup />
        </div>
    );
};

export default StudentDashboard;