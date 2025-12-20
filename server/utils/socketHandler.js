const Question = require('../models/Question');
const Student = require('../models/Student');
const Chat = require('../models/Chat');

module.exports = (io) => {
    const connectedClients = {
        teachers: new Set(),
        students: new Map(),
    };

    let questionTimer = null;
    let currentQuestionId = null;

    // Track participants: socketId => questionId
    const participantTracker = new Map();

    const clearQuestionState = () => {
        if (questionTimer) {
            clearTimeout(questionTimer);
            questionTimer = null;
        }
        participantTracker.clear();
        currentQuestionId = null;
    };

    // Helper function to broadcast results immediately
    const broadcastResults = (question) => {
        const resultsPayload = {
            questionId: question._id,
            options: question.options.map(opt => ({
                text: opt.text,
                votes: opt.votes,
                percentage: opt.percentage,
                isCorrect: opt.isCorrect,
            })),
            totalVotes: question.totalVotes,
            expectedStudents: question.expectedStudents,
        };

        // Broadcast to EVERYONE immediately
        io.emit('results:update', resultsPayload);
        console.log('📊 Results broadcasted to all clients');
    };

    io.on('connection', (socket) => {
        console.log('✅ Connected:', socket.id);

        /* ================= TEACHER JOIN ================= */
        socket.on('teacher:join', async() => {
            connectedClients.teachers.add(socket.id);
            socket.join('teachers');
            console.log('👨‍🏫 Teacher joined:', socket.id);

            // Send students list
            const students = await Student.find({ isActive: true, isKicked: false });
            socket.emit('students:list', students);

            // Send active question if exists
            if (currentQuestionId) {
                const activeQuestion = await Question.findById(currentQuestionId);
                if (activeQuestion && activeQuestion.isActive) {
                    socket.emit('question:created', activeQuestion);
                }
            }
        });

        /* ================= STUDENT JOIN ================= */
        socket.on('student:join', async({ name }) => {
            try {
                const hasTeacher = connectedClients.teachers.size > 0;

                let student = await Student.findOne({ socketId: socket.id });
                if (!student) {
                    student = new Student({ name, socketId: socket.id, isActive: true });
                } else {
                    student.name = name;
                    student.isActive = true;
                    student.isKicked = false;
                }
                await student.save();

                connectedClients.students.set(socket.id, { name, id: student._id });
                socket.join('students');

                console.log(`👨‍🎓 Student joined: ${name} (${socket.id})`);

                // Notify teachers
                io.to('teachers').emit('student:joined', { name, socketId: socket.id });

                // Update students list
                const allStudents = await Student.find({ isActive: true, isKicked: false });
                io.emit('students:list', allStudents);

                // Only send question if teacher is online AND there's an active question
                if (hasTeacher && currentQuestionId) {
                    const activeQuestion = await Question.findById(currentQuestionId);
                    if (activeQuestion && activeQuestion.isActive) {
                        console.log(`📤 Sending active question to ${name}`);
                        socket.emit('question:new', activeQuestion);

                        // Add to participant tracker
                        participantTracker.set(socket.id, currentQuestionId);

                        // Update expected count in the question
                        activeQuestion.expectedStudents = participantTracker.size;
                        await activeQuestion.save();

                        // Notify teachers about updated count
                        io.to('teachers').emit('question:created', activeQuestion);
                    }
                }
            } catch (error) {
                console.error('❌ Error in student:join:', error);
            }
        });

        /* ================= GET STUDENTS ================= */
        socket.on('students:get', async() => {
            try {
                const students = await Student.find({ isActive: true, isKicked: false });
                socket.emit('students:list', students);
            } catch (error) {
                console.error('❌ Error getting students:', error);
            }
        });

        /* ================= KICK STUDENT ================= */
        socket.on('student:kick', async({ studentId }) => {
            try {
                await Student.findOneAndUpdate({ socketId: studentId }, { isKicked: true, isActive: false });

                // Remove from tracker
                participantTracker.delete(studentId);

                io.to(studentId).emit('student:kicked');

                const students = await Student.find({ isActive: true, isKicked: false });
                io.emit('students:list', students);

                console.log(`👢 Student kicked: ${studentId}`);
            } catch (error) {
                console.error('❌ Error kicking student:', error);
            }
        });

        /* ================= CHAT MESSAGE ================= */
        socket.on('chat:message', async({ sender, message, senderRole }) => {
            try {
                console.log('💬 Chat message received:', { sender, senderRole, message });

                if (!sender || !message || !senderRole) {
                    console.error('❌ Invalid chat message data');
                    return;
                }

                // Save message to database
                const chatMessage = new Chat({
                    sender,
                    senderRole,
                    message,
                    socketId: socket.id,
                });

                await chatMessage.save();

                // Broadcast to all connected clients (teachers and students)
                io.emit('chat:newMessage', {
                    _id: chatMessage._id,
                    sender: chatMessage.sender,
                    senderRole: chatMessage.senderRole,
                    message: chatMessage.message,
                    timestamp: chatMessage.timestamp,
                });

                console.log('✅ Chat message broadcasted');
            } catch (error) {
                console.error('❌ Error handling chat message:', error);
            }
        });

        /* ================= CREATE QUESTION ================= */
        socket.on('question:create', async({ questionText, options, timeLimit }) => {
            try {
                console.log('📝 Creating question:', questionText);

                // Close existing question
                if (currentQuestionId) {
                    const oldQuestion = await Question.findById(currentQuestionId);
                    if (oldQuestion && oldQuestion.isActive) {
                        const remaining = participantTracker.size;

                        if (remaining > 0) {
                            socket.emit('error', {
                                message: `Cannot create new question. ${remaining} student(s) haven't answered yet.`,
                                remainingStudents: remaining,
                            });
                            return;
                        }

                        oldQuestion.isActive = false;
                        oldQuestion.endedAt = new Date();
                        await oldQuestion.save();
                    }
                    clearQuestionState();
                }

                // Count connected students
                const expectedStudents = connectedClients.students.size;

                if (expectedStudents === 0) {
                    socket.emit('error', {
                        message: 'Cannot create question. No students in the room.',
                        noStudents: true,
                    });
                    return;
                }

                // Create question
                const formattedOptions = options.map((opt) => ({
                    text: typeof opt === 'string' ? opt : opt.text,
                    isCorrect: opt.isCorrect || false,
                    votes: 0,
                    percentage: 0,
                    votedBy: [],
                }));

                const question = new Question({
                    questionText,
                    options: formattedOptions,
                    timeLimit: timeLimit || 60,
                    expectedStudents,
                    isActive: true,
                    totalVotes: 0,
                });

                await question.save();
                currentQuestionId = question._id.toString();

                console.log(`✅ Question created: ${question._id}`);

                // Initialize participant tracker
                participantTracker.clear();
                connectedClients.students.forEach((_, socketId) => {
                    participantTracker.set(socketId, currentQuestionId);
                });

                console.log(`📊 Tracking ${participantTracker.size} participants`);

                // Notify everyone
                io.to('teachers').emit('question:created', question);
                io.to('students').emit('question:new', question);

                // Set timeout timer
                questionTimer = setTimeout(async() => {
                    try {
                        const q = await Question.findById(currentQuestionId);
                        if (!q || !q.isActive) return;

                        const timedOutStudents = Array.from(participantTracker.keys());

                        console.log(`⏰ Timer expired`);
                        console.log(`🧮 Students who didn't answer: ${timedOutStudents.length}`);

                        // DO NOT count timed-out students in totalVotes
                        // Keep totalVotes as is (only actual votes count)

                        q.isActive = false;
                        q.allStudentsAnswered = true;
                        q.endedAt = new Date();

                        // Recalculate percentages based on actual votes only
                        q.calculatePercentages();
                        await q.save();

                        // Update students as timed out
                        await Student.updateMany({ socketId: { $in: timedOutStudents } }, {
                            currentAnswer: {
                                questionId: q._id,
                                optionIndex: null,
                                answeredAt: new Date(),
                                timedOut: true,
                            },
                        });

                        const resultsPayload = {
                            questionId: q._id,
                            results: q.options.map((opt) => ({
                                text: opt.text,
                                votes: opt.votes,
                                percentage: opt.percentage,
                                isCorrect: opt.isCorrect,
                            })),
                            totalVotes: q.totalVotes,
                            expectedStudents: q.expectedStudents,
                        };

                        // Send to everyone
                        io.emit('question:timeup', resultsPayload);

                        clearQuestionState();
                        console.log('✅ Question closed via timeout');
                    } catch (err) {
                        console.error('❌ Timeout handler error:', err);
                    }
                }, timeLimit * 1000);
            } catch (error) {
                console.error('❌ Error creating question:', error);
                socket.emit('error', { message: 'Failed to create question' });
            }
        });

        /* ================= ANSWER SUBMISSION ================= */
        socket.on('answer:submit', async({ questionId, optionIndex }) => {
            try {
                const question = await Question.findById(questionId);

                if (!question || !question.isActive) {
                    socket.emit('error', { message: 'Question not active' });
                    return;
                }

                // Check already voted
                const alreadyVoted = question.options.some((opt) =>
                    opt.votedBy.includes(socket.id)
                );

                if (alreadyVoted) {
                    socket.emit('error', { message: 'Already voted' });
                    return;
                }

                // Remove from participant tracker
                participantTracker.delete(socket.id);

                // Record vote
                question.options[optionIndex].votes += 1;
                question.options[optionIndex].votedBy.push(socket.id);
                question.totalVotes += 1;

                // Recalculate percentages based on ACTUAL votes (totalVotes)
                question.calculatePercentages();
                await question.save();

                console.log(
                    `✅ Answer recorded. Total Votes: ${question.totalVotes}, Remaining: ${participantTracker.size}`
                );

                // Broadcast results IMMEDIATELY to everyone
                broadcastResults(question);

                // Check if all answered
                const allAnswered = participantTracker.size === 0;

                if (allAnswered) {
                    question.isActive = false;
                    question.allStudentsAnswered = true;
                    question.endedAt = new Date();
                    await question.save();

                    // Clear timer
                    if (questionTimer) {
                        clearTimeout(questionTimer);
                        questionTimer = null;
                    }

                    // Send final results
                    io.emit('question:ended', {
                        questionId: question._id,
                        results: question.options.map((opt) => ({
                            text: opt.text,
                            votes: opt.votes,
                            percentage: opt.percentage,
                            isCorrect: opt.isCorrect,
                        })),
                        totalVotes: question.totalVotes,
                    });

                    clearQuestionState();
                    console.log(`✅ Question ended - all students answered`);
                }

                // Update student DB
                try {
                    await Student.findOneAndUpdate({ socketId: socket.id }, {
                        currentAnswer: {
                            questionId: question._id,
                            optionIndex,
                            answeredAt: new Date(),
                            timedOut: false,
                        },
                    });
                } catch (err) {
                    console.error('Error updating student answer:', err);
                }
            } catch (error) {
                console.error('❌ Error submitting answer:', error);
                socket.emit('error', { message: 'Failed to submit answer' });
            }
        });

        /* ================= DISCONNECT ================= */
        socket.on('disconnect', async() => {
            console.log(`❌ Disconnected: ${socket.id}`);

            // Teacher disconnected
            if (connectedClients.teachers.has(socket.id)) {
                connectedClients.teachers.delete(socket.id);
                console.log('👨‍🏫 Teacher left');

                // If no teachers left, end session
                if (connectedClients.teachers.size === 0) {
                    console.log('⚠️ No teachers online - ending session');

                    if (currentQuestionId) {
                        const activeQuestion = await Question.findById(currentQuestionId);
                        if (activeQuestion && activeQuestion.isActive) {
                            activeQuestion.isActive = false;
                            activeQuestion.endedAt = new Date();
                            await activeQuestion.save();
                        }
                    }

                    clearQuestionState();

                    // Notify students
                    io.to('students').emit('question:ended', {
                        teacherLeft: true,
                        sessionEnded: true,
                    });

                    console.log('✅ Session ended');
                }
            }

            // Student disconnected
            if (connectedClients.students.has(socket.id)) {
                const studentInfo = connectedClients.students.get(socket.id);
                connectedClients.students.delete(socket.id);

                // Remove from tracker
                participantTracker.delete(socket.id);

                // Mark inactive
                await Student.findOneAndUpdate({ socketId: socket.id }, { isActive: false });

                io.to('teachers').emit('student:left', {
                    socketId: socket.id,
                    name: studentInfo.name,
                });

                const students = await Student.find({ isActive: true, isKicked: false });
                io.emit('students:list', students);

                console.log(`👋 Student left: ${studentInfo.name}`);
            }
        });
    });

    console.log('🔌 Socket.io handler initialized');
};