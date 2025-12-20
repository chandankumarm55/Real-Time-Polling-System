// FILE 3: frontend/src/pages/TeacherDashboard.jsx
// REPLACE YOUR EXISTING FILE WITH THIS COMPLETE CODE

import React, { useState, useEffect, useRef } from 'react';
import CreateQuestionPage from '../components/teacher/CreateQuestionPage';
import LiveQuestionPage from '../components/teacher/LiveQuestionPage';
import PollHistoryPage from '../components/teacher/PollHistoryPage';
import Header from '../components/common/Header';
import ChatPopup from '../components/common/ChatPopup';
import { useSocket } from '../context/SocketContext';

const TeacherDashboard = () => {
    const [currentPage, setCurrentPage] = useState('create-question');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [students, setStudents] = useState([]);
    const { socketService, socket, isConnected } = useSocket();

    // Use ref to track if listeners are set up and if teacher joined
    const listenersSetUp = useRef(false);
    const teacherJoined = useRef(false);

    // Join as teacher ONCE when socket is available
    useEffect(() => {
        if (!socket || teacherJoined.current) return;

        console.log('👨‍🏫 Teacher joining...');
        socketService.teacherJoin();
        teacherJoined.current = true;

        // Get initial student list
        setTimeout(() => {
            socketService.getActiveStudents();
        }, 500);

        return () => {
            teacherJoined.current = false;
        };
    }, [socket, socketService]);

    // Set up socket listeners ONCE when socket is available
    useEffect(() => {
        if (!socket || listenersSetUp.current) return;

        console.log('🎧 Setting up socket listeners for teacher');

        // Listen for question created confirmation
        const handleQuestionCreated = (question) => {
            console.log('✅ Question created confirmation:', question);
            setCurrentQuestion({
                _id: question._id,
                question: question.questionText,
                options: question.options.map((opt, idx) => ({
                    id: idx,
                    text: opt.text,
                    percentage: opt.percentage || 0,
                    votes: opt.votes || 0,
                })),
                timeLimit: question.timeLimit,
            });
            setCurrentPage('live-question');
        };

        // Listen for results updates
        const handleResultsUpdate = (data) => {
            console.log('📊 Results updated:', data);
            setCurrentQuestion(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    options: data.options.map((opt, idx) => ({
                        id: idx,
                        text: opt.text,
                        percentage: opt.percentage || 0,
                        votes: opt.votes || 0,
                    })),
                };
            });
        };

        // Listen for student updates
        const handleStudentJoined = (data) => {
            console.log('👨‍🎓 Student joined:', data);
            socketService.getActiveStudents();
        };

        const handleStudentLeft = (data) => {
            console.log('👋 Student left:', data);
            socketService.getActiveStudents();
        };

        const handleStudentsList = (studentsList) => {
            console.log('📋 Students list received:', studentsList.length, 'students');
            setStudents(studentsList);
        };

        // Error handling
        const handleError = (error) => {
            console.error('❌ Socket error:', error);
            alert(error.message);
        };

        // Attach listeners
        socketService.onQuestionCreated(handleQuestionCreated);
        socketService.onResultsUpdate(handleResultsUpdate);
        socketService.onStudentJoined(handleStudentJoined);
        socketService.onStudentLeft(handleStudentLeft);
        socketService.onStudentsList(handleStudentsList);
        socketService.onError(handleError);

        listenersSetUp.current = true;
        console.log('✅ Socket listeners set up successfully');

        // Cleanup function
        return () => {
            console.log('🧹 Cleaning up socket listeners');
            if (socket) {
                socket.off('question:created', handleQuestionCreated);
                socket.off('results:update', handleResultsUpdate);
                socket.off('student:joined', handleStudentJoined);
                socket.off('student:left', handleStudentLeft);
                socket.off('students:list', handleStudentsList);
                socket.off('error', handleError);
            }
            listenersSetUp.current = false;
        };
    }, [socket, socketService]); // Only depend on socket and socketService

    const handleAskQuestion = (questionData) => {
        if (!socket || !socket.connected) {
            alert('Socket not ready yet');
            return;
        }

        socketService.createQuestion({
            questionText: questionData.question,
            options: questionData.options.map(o => ({ text: o.text })),
            timeLimit: questionData.timeLimit,
        });
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

    const handleKickStudent = (studentId) => {
        console.log('👢 Kicking student:', studentId);
        socketService.kickStudent(studentId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header userName="Teacher" userRole="teacher" />

            { !isConnected && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    Disconnected from server...
                </div>
            ) }

            { currentPage === 'create-question' && (
                <CreateQuestionPage onAskQuestion={ handleAskQuestion } />
            ) }

            { currentPage === 'live-question' && currentQuestion && (
                <LiveQuestionPage
                    questionData={ currentQuestion }
                    onNewQuestion={ handleNewQuestion }
                    onViewHistory={ handleViewHistory }
                    students={ students }
                    onKickStudent={ handleKickStudent }
                />
            ) }

            { currentPage === 'poll-history' && (
                <PollHistoryPage onBack={ handleBackFromHistory } />
            ) }

            <ChatPopup userName="Teacher" userRole="teacher" />
        </div>
    );
};

export default TeacherDashboard;