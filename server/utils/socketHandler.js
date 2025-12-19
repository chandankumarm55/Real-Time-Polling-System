// utils/socketHandler.js
const Question = require('../models/Question');
const Student = require('../models/Student');
const Chat = require('../models/Chat');

module.exports = (io) => {
    // Store connected clients
    const connectedClients = {
        teachers: new Set(),
        students: new Map(), // socketId -> student info
    };

    io.on('connection', (socket) => {
        console.log(`✅ New connection: ${socket.id}`);

        // TEACHER EVENTS
        socket.on('teacher:join', async() => {
            connectedClients.teachers.add(socket.id);
            socket.join('teachers');
            console.log(`👨‍🏫 Teacher joined: ${socket.id}`);

            // Send current active students to teacher
            const students = await Student.find({ isActive: true, isKicked: false });
            socket.emit('students:list', students);
        });

        // STUDENT EVENTS
        socket.on('student:join', async({ name }) => {
            try {
                // Register or update student
                let student = await Student.findOne({ socketId: socket.id });

                if (student) {
                    student.name = name;
                    student.isActive = true;
                    student.isKicked = false;
                } else {
                    student = new Student({
                        name,
                        socketId: socket.id,
                        isActive: true,
                    });
                }

                await student.save();

                connectedClients.students.set(socket.id, { name, id: student._id });
                socket.join('students');

                console.log(`👨‍🎓 Student joined: ${name} (${socket.id})`);

                // Notify all teachers
                io.to('teachers').emit('student:joined', {
                    socketId: socket.id,
                    name,
                    id: student._id,
                });

                // Send updated student list to all teachers
                const allStudents = await Student.find({ isActive: true, isKicked: false });
                io.to('teachers').emit('students:list', allStudents);

            } catch (error) {
                console.error('Error in student:join:', error);
                socket.emit('error', { message: 'Failed to join' });
            }
        });

        // QUESTION EVENTS
        socket.on('question:create', async(data) => {
            try {
                const { questionText, options, timeLimit } = data;

                // Auto-close any active questions
                await Question.updateMany({ isActive: true }, { isActive: false, endedAt: new Date() });

                // Format options
                const formattedOptions = options.map(opt => ({
                    text: typeof opt === 'string' ? opt : opt.text,
                    isCorrect: opt.isCorrect || false,
                    votes: 0,
                    percentage: 0,
                    votedBy: [],
                }));

                // Get active students count
                const activeStudents = await Student.countDocuments({
                    isActive: true,
                    isKicked: false
                });

                // Create question
                const question = new Question({
                    questionText,
                    options: formattedOptions,
                    timeLimit: timeLimit || 60,
                    expectedStudents: activeStudents,
                    isActive: true,
                });

                await question.save();

                console.log(`📝 Question created: ${question._id}`);

                // Notify teacher
                io.to('teachers').emit('question:created', question);

                // Notify all students
                io.to('students').emit('question:new', question);

            } catch (error) {
                console.error('Error creating question:', error);
                socket.emit('error', { message: 'Failed to create question' });
            }
        });

        // ANSWER SUBMISSION
        socket.on('answer:submit', async({ questionId, optionIndex }) => {
            try {
                const question = await Question.findById(questionId);

                if (!question || !question.isActive) {
                    socket.emit('error', { message: 'Question not active' });
                    return;
                }

                // Check if already voted
                const alreadyVoted = question.options.some(opt =>
                    opt.votedBy.includes(socket.id)
                );

                if (alreadyVoted) {
                    socket.emit('error', { message: 'Already voted' });
                    return;
                }

                // Record vote
                question.options[optionIndex].votes += 1;
                question.options[optionIndex].votedBy.push(socket.id);
                question.totalVotes += 1;

                // Calculate percentages
                question.calculatePercentages();

                // Check if all students answered
                if (question.totalVotes >= question.expectedStudents) {
                    question.allStudentsAnswered = true;
                }

                await question.save();

                console.log(`✅ Answer submitted by ${socket.id} for question ${questionId}`);

                // Broadcast updated results to everyone
                io.emit('results:update', {
                    questionId: question._id,
                    options: question.options.map(opt => ({
                        text: opt.text,
                        votes: opt.votes,
                        percentage: opt.percentage,
                        isCorrect: opt.isCorrect,
                    })),
                    totalVotes: question.totalVotes,
                });

            } catch (error) {
                console.error('Error submitting answer:', error);
                socket.emit('error', { message: 'Failed to submit answer' });
            }
        });

        // QUESTION TIME UP
        socket.on('question:timeup', async({ questionId }) => {
            try {
                const question = await Question.findByIdAndUpdate(
                    questionId, { isActive: false, endedAt: new Date() }, { new: true }
                );

                if (question) {
                    io.emit('question:ended', {
                        questionId: question._id,
                        results: question.options,
                    });
                }
            } catch (error) {
                console.error('Error ending question:', error);
            }
        });

        // STUDENT MANAGEMENT
        socket.on('student:kick', async({ studentId }) => {
            try {
                await Student.findOneAndUpdate({ socketId: studentId }, { isKicked: true, isActive: false });

                // Notify the kicked student
                io.to(studentId).emit('student:kicked');

                // Update teachers
                const students = await Student.find({ isActive: true, isKicked: false });
                io.to('teachers').emit('students:list', students);

                console.log(`👢 Student kicked: ${studentId}`);
            } catch (error) {
                console.error('Error kicking student:', error);
            }
        });

        socket.on('students:get', async() => {
            try {
                const students = await Student.find({ isActive: true, isKicked: false });
                socket.emit('students:list', students);
            } catch (error) {
                console.error('Error getting students:', error);
            }
        });

        // CHAT EVENTS
        socket.on('chat:message', async({ sender, message, senderRole }) => {
            try {
                const chat = new Chat({
                    sender,
                    message,
                    senderRole,
                });
                await chat.save();

                // Broadcast to everyone
                io.emit('chat:newMessage', chat);
                console.log(`💬 Chat: ${sender} (${senderRole}): ${message}`);
            } catch (error) {
                console.error('Error saving chat:', error);
            }
        });

        // DISCONNECT
        socket.on('disconnect', async() => {
            console.log(`❌ Disconnected: ${socket.id}`);

            // Handle teacher disconnect
            if (connectedClients.teachers.has(socket.id)) {
                connectedClients.teachers.delete(socket.id);
            }

            // Handle student disconnect
            if (connectedClients.students.has(socket.id)) {
                const studentInfo = connectedClients.students.get(socket.id);
                connectedClients.students.delete(socket.id);

                // Mark student as inactive
                await Student.findOneAndUpdate({ socketId: socket.id }, { isActive: false });

                // Notify teachers
                io.to('teachers').emit('student:left', {
                    socketId: socket.id,
                    name: studentInfo.name,
                });

                // Send updated student list
                const students = await Student.find({ isActive: true, isKicked: false });
                io.to('teachers').emit('students:list', students);
            }
        });
    });

    console.log('🔌 Socket.io handler initialized');
};