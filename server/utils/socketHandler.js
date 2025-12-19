const Student = require('../models/Student');
const Question = require('../models/Question');
const ChatMessage = require('../models/ChatMessage');

const socketHandler = (io) => {
    // Store connected users
    const connectedUsers = new Map(); // socketId -> { role, name }

    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        // Student joins
        socket.on('student:join', async(data) => {
            try {
                const { name } = data;

                // Register student in database
                const student = new Student({
                    name,
                    socketId: socket.id,
                    isActive: true,
                });
                await student.save();

                connectedUsers.set(socket.id, { role: 'student', name });
                socket.join('students');

                // Notify all about new student
                io.emit('student:joined', {
                    studentId: socket.id,
                    name,
                    totalStudents: await Student.countDocuments({ isActive: true, isKicked: false }),
                });

                // Send active question if exists
                const activeQuestion = await Question.findOne({ isActive: true });
                if (activeQuestion) {
                    socket.emit('question:new', activeQuestion);
                }

                console.log(`Student joined: ${name} (${socket.id})`);
            } catch (error) {
                console.error('Error in student:join:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Teacher joins
        socket.on('teacher:join', () => {
            connectedUsers.set(socket.id, { role: 'teacher', name: 'Teacher' });
            socket.join('teachers');
            console.log(`Teacher joined: ${socket.id}`);
        });

        // Teacher creates new question
        socket.on('question:create', async(data) => {
            try {
                const { questionText, options, timeLimit } = data;

                // Check for active question
                const activeQuestion = await Question.findOne({ isActive: true });
                if (activeQuestion) {
                    socket.emit('error', {
                        message: 'Please close the current question before creating a new one'
                    });
                    return;
                }

                const formattedOptions = options.map(opt => ({
                    text: typeof opt === 'string' ? opt : opt.text,
                    votes: 0,
                    percentage: 0,
                    votedBy: [],
                }));

                const activeStudents = await Student.countDocuments({
                    isActive: true,
                    isKicked: false
                });

                const question = new Question({
                    questionText,
                    options: formattedOptions,
                    timeLimit: timeLimit || 60,
                    expectedStudents: activeStudents,
                    isActive: true,
                });

                await question.save();

                // Broadcast new question to all students
                io.to('students').emit('question:new', question);

                // Send to teacher as well
                socket.emit('question:created', question);

                console.log(`New question created: ${question._id}`);
            } catch (error) {
                console.error('Error in question:create:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Student submits answer
        socket.on('answer:submit', async(data) => {
            try {
                const { questionId, optionIndex } = data;

                const question = await Question.findById(questionId);
                if (!question || !question.isActive) {
                    socket.emit('error', { message: 'Question not found or inactive' });
                    return;
                }

                // Check if already voted
                const alreadyVoted = question.options.some(opt =>
                    opt.votedBy.includes(socket.id)
                );

                if (alreadyVoted) {
                    socket.emit('error', { message: 'You have already answered' });
                    return;
                }

                // Record vote
                question.options[optionIndex].votes += 1;
                question.options[optionIndex].votedBy.push(socket.id);
                question.totalVotes += 1;
                question.calculatePercentages();

                // Check if all students answered
                if (question.totalVotes >= question.expectedStudents) {
                    question.allStudentsAnswered = true;
                }

                await question.save();

                // Update student record
                await Student.findOneAndUpdate({ socketId: socket.id }, {
                    currentAnswer: {
                        questionId: question._id,
                        optionIndex,
                        answeredAt: new Date(),
                    },
                });

                // Broadcast updated results to everyone
                io.emit('results:update', {
                    questionId: question._id,
                    options: question.options,
                    totalVotes: question.totalVotes,
                    allStudentsAnswered: question.allStudentsAnswered,
                });

                console.log(`Answer submitted by ${socket.id} for question ${questionId}`);
            } catch (error) {
                console.error('Error in answer:submit:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Question time expired
        socket.on('question:timeup', async(data) => {
            try {
                const { questionId } = data;

                const question = await Question.findByIdAndUpdate(
                    questionId, {
                        isActive: false,
                        endedAt: new Date(),
                    }, { new: true }
                );

                if (question) {
                    // Broadcast to all that time is up
                    io.emit('question:ended', {
                        questionId: question._id,
                        results: question.options,
                    });
                }
            } catch (error) {
                console.error('Error in question:timeup:', error);
            }
        });

        // Chat message
        socket.on('chat:message', async(data) => {
            try {
                const { sender, message, senderRole } = data;

                const chatMessage = new ChatMessage({
                    sender,
                    senderRole,
                    message,
                    socketId: socket.id,
                });

                await chatMessage.save();

                // Broadcast to all users
                io.emit('chat:newMessage', {
                    id: chatMessage._id,
                    sender,
                    senderRole,
                    message,
                    timestamp: chatMessage.timestamp,
                });

                console.log(`Chat message from ${sender}: ${message}`);
            } catch (error) {
                console.error('Error in chat:message:', error);
            }
        });

        // Teacher kicks student
        socket.on('student:kick', async(data) => {
            try {
                const { studentId } = data;

                await Student.findOneAndUpdate({ socketId: studentId }, {
                    isKicked: true,
                    isActive: false,
                });

                // Notify the kicked student
                io.to(studentId).emit('student:kicked');

                // Update all about student count
                const activeCount = await Student.countDocuments({
                    isActive: true,
                    isKicked: false
                });

                io.emit('students:update', { totalStudents: activeCount });

                console.log(`Student kicked: ${studentId}`);
            } catch (error) {
                console.error('Error in student:kick:', error);
            }
        });

        // Get active students
        socket.on('students:get', async() => {
            try {
                const students = await Student.find({
                    isActive: true,
                    isKicked: false
                }).select('name socketId joinedAt');

                socket.emit('students:list', students);
            } catch (error) {
                console.error('Error in students:get:', error);
            }
        });

        // Disconnect
        socket.on('disconnect', async() => {
            try {
                const user = connectedUsers.get(socket.id);

                if (user && user.role === 'student') {
                    await Student.findOneAndUpdate({ socketId: socket.id }, { isActive: false });

                    const activeCount = await Student.countDocuments({
                        isActive: true,
                        isKicked: false
                    });

                    io.emit('student:left', {
                        studentId: socket.id,
                        totalStudents: activeCount,
                    });

                    console.log(`Student disconnected: ${user.name} (${socket.id})`);
                }

                connectedUsers.delete(socket.id);
            } catch (error) {
                console.error('Error in disconnect:', error);
            }
        });
    });
};

module.exports = socketHandler;