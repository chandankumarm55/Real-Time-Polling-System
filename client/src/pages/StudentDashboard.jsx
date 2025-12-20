import React, { useState, useEffect } from 'react';
import StudentNameEntry from '../components/student/StudentNameEntry';
import StudentWaitingPage from '../components/student/StudentWaitingPage';
import StudentQuestionPage from '../components/student/StudentQuestionPage';
import StudentResultsPage from '../components/student/StudentResultsPage';
import StudentKickedPage from '../components/student/StudentKickedPage';
import Header from '../components/common/Header';
import ChatPopup from '../components/common/ChatPopup';
import { useSocket } from '../context/SocketContext';
import { studentAPI, questionAPI } from '../services/api';

const StudentDashboard = () => {
    const [studentName, setStudentName] = useState('');
    const [currentPage, setCurrentPage] = useState('name-entry');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);

    const { socketService, socket, isConnected } = useSocket();

    /* ===============================
       SOCKET LISTENERS (NO CLEANUP)
       =============================== */
    useEffect(() => {
        if (!socket) return;

        console.log('🎧 Student socket listeners attached');

        socket.on('question:new', (question) => {
            console.log('📨 Question received:', question);

            setCurrentQuestion({
                _id: question._id,
                questionNumber: 1,
                text: question.questionText,
                options: question.options.map((opt, idx) => ({
                    id: idx,
                    text: opt.text,
                })),
                timeLimit: question.timeLimit,
            });

            setCurrentPage('question');
        });

        socket.on('results:update', (data) => {
            setCurrentQuestion((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    options: data.options.map((opt, idx) => ({
                        id: idx,
                        text: opt.text,
                        votes: opt.votes,
                        percentage: opt.percentage,
                    })),
                };
            });
        });

        socket.on('student:kicked', () => {
            setCurrentPage('kicked');
        });

        socket.on('question:ended', () => {
            setCurrentPage('results');
        });

        socket.on('error', (err) => {
            console.error('❌ Socket error:', err);
        });

    }, [socket]);

    /* ===============================
       STUDENT NAME SUBMIT
       =============================== */
    const handleNameSubmit = async (name) => {
        if (!socket || !isConnected || isRegistering) return;

        try {
            setIsRegistering(true);
            setStudentName(name);

            console.log('📝 Registering student:', name, socket.id);

            await studentAPI.register({
                name,
                socketId: socket.id,
            });

            socketService.studentJoin(name);

            /* 🔥 IMPORTANT FALLBACK */
            const active = await questionAPI.getActive().catch(() => null);

            if (active?.data?.data) {
                console.log('📥 Active question fetched via API');

                setCurrentQuestion({
                    _id: active.data.data._id,
                    questionNumber: 1,
                    text: active.data.data.questionText,
                    options: active.data.data.options.map((opt, idx) => ({
                        id: idx,
                        text: opt.text,
                    })),
                    timeLimit: active.data.data.timeLimit,
                });

                setCurrentPage('question');
            } else {
                setCurrentPage('waiting');
            }

        } catch (err) {
            console.error('❌ Registration failed:', err);
            setCurrentPage('name-entry');
        } finally {
            setIsRegistering(false);
        }
    };

    /* ===============================
       ANSWER SUBMIT
       =============================== */
    const handleAnswerSubmit = (optionIndex) => {
        if (!currentQuestion) return;
        socketService.submitAnswer(currentQuestion._id, optionIndex);
        setCurrentPage('results');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            { studentName && <Header userName={ studentName } userRole="student" /> }

            { currentPage === 'name-entry' && (
                <StudentNameEntry onSubmit={ handleNameSubmit } isLoading={ isRegistering } />
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

            { currentPage === 'kicked' && <StudentKickedPage /> }

            { studentName && <ChatPopup userName={ studentName } userRole="student" /> }
        </div>
    );
};

export default StudentDashboard;
