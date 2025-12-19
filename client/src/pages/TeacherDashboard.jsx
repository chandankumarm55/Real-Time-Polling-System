// src/pages/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import CreateQuestionPage from '../components/teacher/CreateQuestionPage';
import LiveQuestionPage from '../components/teacher/LiveQuestionPage';
import PollHistoryPage from '../components/teacher/PollHistoryPage';
import Header from '../components/common/Header';
import ChatPopup from '../components/common/ChatPopup';
import { useSocket } from '../context/SocketContext';
import { questionAPI } from '../services/api';

const TeacherDashboard = () => {
    const [currentPage, setCurrentPage] = useState('create-question');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [students, setStudents] = useState([]);
    const { socketService, socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Join as teacher
        socketService.teacherJoin();

        // Listen for question created confirmation
        socketService.onQuestionCreated((question) => {
            console.log('Question created:', question);
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
        });

        // Listen for results updates
        socketService.onResultsUpdate((data) => {
            console.log('Results updated:', data);
            if (currentQuestion) {
                setCurrentQuestion(prev => ({
                    ...prev,
                    options: data.options.map((opt, idx) => ({
                        id: idx,
                        text: opt.text,
                        percentage: opt.percentage || 0,
                        votes: opt.votes || 0,
                    })),
                }));
            }
        });

        // Listen for student updates
        socketService.onStudentJoined((data) => {
            console.log('Student joined:', data);
            socketService.getActiveStudents();
        });

        socketService.onStudentLeft((data) => {
            console.log('Student left:', data);
            socketService.getActiveStudents();
        });

        socketService.onStudentsList((studentsList) => {
            console.log('Students list:', studentsList);
            setStudents(studentsList);
        });

        socketService.onStudentsUpdate((data) => {
            console.log('Students update:', data);
            socketService.getActiveStudents();
        });

        // Get initial student list
        socketService.getActiveStudents();

        // Error handling
        socketService.onError((error) => {
            console.error('Socket error:', error);
            alert(error.message);
        });

        return () => {
            socketService.removeAllListeners();
        };
    }, [socket, socketService, currentQuestion]);

    const handleAskQuestion = (questionData) => {
        // Send question via socket
        socketService.createQuestion({
            questionText: questionData.question,
            options: questionData.options.map(opt => opt.text),
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
        socketService.kickStudent(studentId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header userName="Teacher" userRole="teacher" />

            { !isConnected && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
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