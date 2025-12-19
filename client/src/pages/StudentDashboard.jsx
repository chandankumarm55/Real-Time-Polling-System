// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import StudentNameEntry from '../components/student/StudentNameEntry';
import StudentWaitingPage from '../components/student/StudentWaitingPage';
import StudentQuestionPage from '../components/student/StudentQuestionPage';
import StudentResultsPage from '../components/student/StudentResultsPage';
import StudentKickedPage from '../components/student/StudentKickedPage';
import Header from '../components/common/Header';
import ChatPopup from '../components/common/ChatPopup';
import { useSocket } from '../context/SocketContext';
import { studentAPI } from '../services/api';

const StudentDashboard = () => {
    const [studentName, setStudentName] = useState('');
    const [currentPage, setCurrentPage] = useState('name-entry');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const { socketService, socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Listen for new questions
        socketService.onQuestionNew((question) => {
            console.log('New question received:', question);
            const formattedQuestion = {
                _id: question._id,
                questionNumber: 1,
                text: question.questionText,
                options: question.options.map((opt, idx) => ({
                    id: idx,
                    text: opt.text,
                })),
                timeLimit: question.timeLimit,
            };
            setCurrentQuestion(formattedQuestion);
            setCurrentPage('question');
        });

        // Listen for results updates
        socketService.onResultsUpdate((data) => {
            console.log('Results updated:', data);
            if (currentQuestion) {
                const updatedQuestion = {
                    ...currentQuestion,
                    options: data.options.map((opt, idx) => ({
                        id: idx,
                        text: opt.text,
                        votes: opt.votes,
                        percentage: opt.percentage,
                    })),
                };
                setCurrentQuestion(updatedQuestion);
            }
        });

        // Listen for being kicked
        socketService.onStudentKicked(() => {
            console.log('You have been kicked out');
            setCurrentPage('kicked');
        });

        // Listen for question ended
        socketService.onQuestionEnded((data) => {
            console.log('Question ended:', data);
            setCurrentPage('results');
        });

        // Error handling
        socketService.onError((error) => {
            console.error('Socket error:', error);
            alert(error.message);
        });

        return () => {
            socketService.removeAllListeners();
        };
    }, [socket, socketService, currentQuestion]);

    const handleNameSubmit = async (name) => {
        // Check if socket is connected
        if (!socket || !isConnected) {
            alert('Not connected to server. Please wait and try again.');
            return;
        }

        if (isRegistering) {
            console.log('Already registering, please wait...');
            return;
        }

        try {
            setIsRegistering(true);
            setStudentName(name);

            console.log('Registering student:', name, 'with socket ID:', socket.id);

            // Register student via API
            const response = await studentAPI.register({
                name,
                socketId: socket.id,
            });

            console.log('Registration successful:', response.data);

            // Join via socket
            socketService.studentJoin(name);

            // Move to waiting page
            setCurrentPage('waiting');

            console.log('✅ Student successfully joined and moved to waiting page');
        } catch (error) {
            console.error('Error registering student:', error);

            // More detailed error message
            if (error.response) {
                // Server responded with error
                console.error('Server error:', error.response.data);
                alert(`Failed to register: ${error.response.data.message || 'Server error'}`);
            } else if (error.request) {
                // Request made but no response
                console.error('No response from server:', error.request);
                alert('Cannot connect to server. Please check if the server is running on http://localhost:5000');
            } else {
                // Something else went wrong
                console.error('Error:', error.message);
                alert('Failed to register. Please try again.');
            }

            // Reset state on error
            setStudentName('');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleAnswerSubmit = (optionIndex) => {
        if (!currentQuestion) return;

        // Submit answer via socket
        socketService.submitAnswer(currentQuestion._id, optionIndex);

        // Move to results page
        setCurrentPage('results');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            { studentName && <Header userName={ studentName } userRole="student" /> }

            { !isConnected && currentPage !== 'name-entry' && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    Disconnected from server...
                </div>
            ) }

            { !isConnected && currentPage === 'name-entry' && (
                <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    Connecting to server...
                </div>
            ) }

            { currentPage === 'name-entry' && (
                <StudentNameEntry
                    onSubmit={ handleNameSubmit }
                    isLoading={ isRegistering }
                />
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

            { studentName && <ChatPopup userName={ studentName } userRole="student" /> }
        </div>
    );
};

export default StudentDashboard;