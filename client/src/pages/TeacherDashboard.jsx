import React, { useState, useEffect, useRef } from 'react';
import CreateQuestionPage from '../components/teacher/CreateQuestionPage';
import LiveQuestionPage from '../components/teacher/LiveQuestionPage';
import PollHistoryPage from '../components/teacher/PollHistoryPage';
import Header from '../components/common/Header';
import ChatPopup from '../components/common/ChatPopup';
import { useSocket } from '../context/SocketContext';
import toast, { Toaster } from 'react-hot-toast';

const TeacherDashboard = () => {
    const [currentPage, setCurrentPage] = useState('create-question');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [students, setStudents] = useState([]);
    const [canCreateQuestion, setCanCreateQuestion] = useState(true);
    const { socketService, socket, isConnected } = useSocket();

    const listenersSetUp = useRef(false);
    const teacherJoined = useRef(false);

    // Join as teacher ONCE
    useEffect(() => {
        if (!socket || teacherJoined.current) return;

        console.log('👨‍🏫 Teacher joining...');
        socketService.teacherJoin();
        teacherJoined.current = true;

        setTimeout(() => {
            socketService.getActiveStudents();
        }, 500);

        return () => {
            teacherJoined.current = false;
        };
    }, [socket, socketService]);

    // Set up socket listeners ONCE
    useEffect(() => {
        if (!socket || listenersSetUp.current) return;

        console.log('🎧 Setting up socket listeners for teacher');

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
                totalVotes: question.totalVotes || 0,
                expectedStudents: question.expectedStudents || 0,
            });
            setCurrentPage('live-question');
            setCanCreateQuestion(false);

        };

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
                    totalVotes: data.totalVotes || 0,
                };
            });
        };

        const handleQuestionTimeUp = (data) => {
            console.log('⏰ Question time up:', data);
            setCanCreateQuestion(true);

            // Update final results
            setCurrentQuestion(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    options: data.results.map((opt, idx) => ({
                        id: idx,
                        text: opt.text,
                        percentage: opt.percentage || 0,
                        votes: opt.votes || 0,
                    })),
                    totalVotes: data.totalVotes || 0,
                };
            });
        };

        const handleQuestionEnded = () => {
            console.log('🏁 Question ended');
            setCanCreateQuestion(true);

        };

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

        const handleError = (error) => {
            console.error('❌ Socket error:', error);

            if (error.noStudents) {
                toast.error('Cannot create question. No students in the room.');
            } else if (error.remainingStudents) {
                toast.error(
                    `Cannot create question. ${error.remainingStudents} student(s) haven't answered yet.`,
                    { duration: 4000 }
                );
            } else {
                toast.error(error.message || 'An error occurred');
            }
        };

        socket.on('question:created', handleQuestionCreated);
        socket.on('results:update', handleResultsUpdate);
        socket.on('question:timeup', handleQuestionTimeUp);
        socket.on('question:ended', handleQuestionEnded);
        socket.on('student:joined', handleStudentJoined);
        socket.on('student:left', handleStudentLeft);
        socket.on('students:list', handleStudentsList);
        socket.on('error', handleError);

        listenersSetUp.current = true;
        console.log('✅ Socket listeners set up successfully');

        return () => {
            console.log('🧹 Cleaning up socket listeners');
            if (socket) {
                socket.off('question:created', handleQuestionCreated);
                socket.off('results:update', handleResultsUpdate);
                socket.off('question:timeup', handleQuestionTimeUp);
                socket.off('question:ended', handleQuestionEnded);
                socket.off('student:joined', handleStudentJoined);
                socket.off('student:left', handleStudentLeft);
                socket.off('students:list', handleStudentsList);
                socket.off('error', handleError);
            }
            listenersSetUp.current = false;
        };
    }, [socket, socketService]);

    const handleAskQuestion = (questionData) => {
        if (!socket || !socket.connected) {
            toast.error('Socket not ready yet');
            return;
        }

        // Check if there are students
        if (students.length === 0) {
            toast.error('Cannot create question. No students in the room.');
            return;
        }

        // Check if can create new question
        if (!canCreateQuestion && currentQuestion) {
            const remaining = currentQuestion.expectedStudents - currentQuestion.totalVotes;
            if (remaining > 0) {
                toast.error(
                    `Cannot create question. ${remaining} student(s) haven't answered yet.`,
                    { duration: 4000 }
                );
                return;
            }
        }

        socketService.createQuestion({
            questionText: questionData.question,
            options: questionData.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
            timeLimit: questionData.timeLimit,
        });
    };

    const handleNewQuestion = () => {
        if (!canCreateQuestion && currentQuestion) {
            const remaining = currentQuestion.expectedStudents - currentQuestion.totalVotes;
            if (remaining > 0) {
                toast.error(
                    `Cannot create new question yet. ${remaining} student(s) haven't answered the current question.`,
                    { duration: 4000 }
                );
                return;
            }
        }

        setCurrentPage('create-question');
        setCurrentQuestion(null);
        setCanCreateQuestion(true);
    };

    const handleViewHistory = () => {
        setCurrentPage('poll-history');
    };

    const handleBackFromHistory = () => {
        if (currentQuestion) {
            setCurrentPage('live-question');
        } else {
            setCurrentPage('create-question');
        }
    };

    const handleKickStudent = (studentId) => {
        console.log('👢 Kicking student:', studentId);
        socketService.kickStudent(studentId);
        toast.success('Student kicked out');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            <Header userName="Teacher" userRole="teacher" />

            { !isConnected && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    Disconnected from server...
                </div>
            ) }

            { currentPage === 'create-question' && (
                <CreateQuestionPage
                    onAskQuestion={ handleAskQuestion }
                    studentsCount={ students.length }
                />
            ) }

            { currentPage === 'live-question' && currentQuestion && (
                <LiveQuestionPage
                    questionData={ currentQuestion }
                    onNewQuestion={ handleNewQuestion }
                    onViewHistory={ handleViewHistory }
                    students={ students }
                    onKickStudent={ handleKickStudent }
                    canCreateNew={ canCreateQuestion }
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