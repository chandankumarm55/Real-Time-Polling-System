import React, { useState, useEffect, useRef } from 'react';
import StudentNameEntry from '../components/student/StudentNameEntry';
import StudentWaitingPage from '../components/student/StudentWaitingPage';
import StudentQuestionPage from '../components/student/StudentQuestionPage';
import StudentResultsPage from '../components/student/StudentResultsPage';
import StudentKickedPage from '../components/student/StudentKickedPage';
import Header from '../components/common/Header';
import ChatPopup from '../components/common/ChatPopup';
import { useSocket } from '../context/SocketContext';
import { studentAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const StudentDashboard = () => {
    const [studentName, setStudentName] = useState('');
    const [currentPage, setCurrentPage] = useState('name-entry');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const { socketService, socket, isConnected } = useSocket();
    const listenersSetUp = useRef(false);

    // Socket listeners setup
    useEffect(() => {
        if (!socket || listenersSetUp.current) return;

        console.log('🎧 Student socket listeners attached');

        const handleQuestionNew = (question) => {
            console.log('📨 New question received:', question);

            setCurrentQuestion({
                _id: question._id,
                questionNumber: 1,
                text: question.questionText,
                options: question.options.map((opt, idx) => ({
                    id: idx,
                    text: opt.text,
                    votes: opt.votes || 0,
                    percentage: opt.percentage || 0,
                })),
                timeLimit: question.timeLimit,
            });

            setHasAnswered(false);
            setCurrentPage('question');
            toast.success('New question received!');
        };

        const handleResultsUpdate = (data) => {
            console.log('📊 Results update received:', data);

            setCurrentQuestion((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    options: data.options.map((opt, idx) => ({
                        id: idx,
                        text: opt.text,
                        votes: opt.votes || 0,
                        percentage: opt.percentage || 0,
                    })),
                };
            });
        };

        const handleStudentKicked = () => {
            console.log('👢 Student kicked');
            setCurrentPage('kicked');
            toast.error('You have been kicked out by the teacher');
        };

        const handleQuestionTimeUp = (data) => {
            console.log('⏰ Time up received:', data);
            toast.error('Time is up!');

            // Update question with final results
            setCurrentQuestion((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    options: data.results.map((opt, idx) => ({
                        id: idx,
                        text: opt.text,
                        votes: opt.votes || 0,
                        percentage: opt.percentage || 0,
                    })),
                };
            });

            // Force move to results page
            setHasAnswered(true);
            setCurrentPage('results');
        };

        const handleQuestionEnded = (data) => {
            console.log('🏁 Question ended', data);

            // If teacher left, go back to waiting page
            if (data.teacherLeft) {
                toast.info('Teacher has left the session');
                setCurrentPage('waiting');
                setCurrentQuestion(null);
                setHasAnswered(false);
            } else {
                // Update results if available
                if (data.results) {
                    setCurrentQuestion((prev) => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            options: data.results.map((opt, idx) => ({
                                id: idx,
                                text: opt.text,
                                votes: opt.votes || 0,
                                percentage: opt.percentage || 0,
                            })),
                        };
                    });
                }

                // Move to results if answered or time is up
                if (hasAnswered || currentPage === 'results') {
                    setCurrentPage('results');
                } else {
                    // If student didn't answer, show results anyway
                    setHasAnswered(true);
                    setCurrentPage('results');
                }
            }
        };

        const handleError = (err) => {
            console.error('❌ Socket error:', err);
            toast.error(err.message || 'An error occurred');
        };

        socket.on('question:new', handleQuestionNew);
        socket.on('results:update', handleResultsUpdate);
        socket.on('student:kicked', handleStudentKicked);
        socket.on('question:timeup', handleQuestionTimeUp);
        socket.on('question:ended', handleQuestionEnded);
        socket.on('error', handleError);

        listenersSetUp.current = true;

        return () => {
            socket.off('question:new', handleQuestionNew);
            socket.off('results:update', handleResultsUpdate);
            socket.off('student:kicked', handleStudentKicked);
            socket.off('question:timeup', handleQuestionTimeUp);
            socket.off('question:ended', handleQuestionEnded);
            socket.off('error', handleError);
            listenersSetUp.current = false;
        };
    }, [socket, hasAnswered, currentPage]);

    // Handle name submit
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

            toast.success(`Welcome, ${name}!`);

            // Always start at waiting page
            setCurrentPage('waiting');

        } catch (err) {
            console.error('❌ Registration failed:', err);
            toast.error('Failed to join. Please try again.');
            setCurrentPage('name-entry');
        } finally {
            setIsRegistering(false);
        }
    };

    // Handle answer submit
    const handleAnswerSubmit = (optionIndex) => {
        if (!currentQuestion || hasAnswered) return;

        console.log('✅ Submitting answer:', optionIndex);
        socketService.submitAnswer(currentQuestion._id, optionIndex);
        setHasAnswered(true);
        setCurrentPage('results');
        toast.success('Answer submitted successfully!');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

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
                    hasAnswered={ hasAnswered }
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