const Question = require('../models/Question');
const Student = require('../models/Student');
const Chat = require('../models/Chat');

module.exports = (io) => {
    // Store connected clients
    const connectedClients = {
        teachers: new Set(),
        students: new Map(),
    };

    io.on('connection', (socket) => {
        console.log(`✅ New connection: ${socket.id}`);

        // TEACHER EVENTS
        socket.on('teacher:join', async() => {
            connectedClients.teachers.add(socket.id);
            socket.join('teachers');
            console.log(`👨‍🏫 Teacher joined: ${socket.id}`);

            const students = await Student.find({ isActive: true, isKicked: false });
            socket.emit('students:list', students);
        });

        // STUDENT EVENTS
        socket.on('student:join', async({ name }) => {
            try {
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
                console.log(`📊 Students in 'students' room: ${io.sockets.adapter.rooms.get('students')?.size || 0}`);
                console.log(`📊 Total connected students: ${connectedClients.students.size}`);

                // Notify teachers
                io.to('teachers').emit('student:joined', {
                    socketId: socket.id,
                    name,
                    id: student._id,
                });

                const allStudents = await Student.find({ isActive: true, isKicked: false });
                io.to('teachers').emit('students:list', allStudents);

                // Check for active question
                const activeQuestion = await Question.findOne({ isActive: true });
                if (activeQuestion) {
                    console.log(`📤 Sending active question to ${name}`);
                    socket.emit('question:new', activeQuestion);
                }

            } catch (error) {
                console.error('❌ Error in student:join:', error);
                socket.emit('error', { message: 'Failed to join' });
            }
        });

        // QUESTION EVENTS
        socket.on('question:create', async(data) => {
            try {
                const { questionText, options, timeLimit } = data;

                console.log('📝 Creating question:', questionText);

                await Question.updateMany({ isActive: true }, { isActive: false, endedAt: new Date() });

                const formattedOptions = options.map(opt => ({
                    text: typeof opt === 'string' ? opt : opt.text,
                    isCorrect: opt.isCorrect || false,
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

                console.log(`✅ Question created: ${question._id}`);

                // Notify teachers
                io.to('teachers').emit('question:created', question);

                // Get students room size
                const studentsRoom = io.sockets.adapter.rooms.get('students');
                const roomSize = studentsRoom ? studentsRoom.size : 0;
                console.log(`📊 Broadcasting to ${roomSize} students in room`);

                // Broadcast to ALL students
                io.to('students').emit('question:new', question);
                console.log(`✅ Question broadcasted to students room`);

            } catch (error) {
                console.error('❌ Error creating question:', error);
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

                const alreadyVoted = question.options.some(opt =>
                    opt.votedBy.includes(socket.id)
                );

                if (alreadyVoted) {
                    socket.emit('error', { message: 'Already voted' });
                    return;
                }

                question.options[optionIndex].votes += 1;
                question.options[optionIndex].votedBy.push(socket.id);
                question.totalVotes += 1;

                question.calculatePercentages();

                if (question.totalVotes >= question.expectedStudents) {
                    question.allStudentsAnswered = true;
                }

                await question.save();

                console.log(`✅ Answer recorded. Total: ${question.totalVotes}/${question.expectedStudents}`);

                const resultsData = {
                    questionId: question._id,
                    options: question.options.map(opt => ({
                        text: opt.text,
                        votes: opt.votes,
                        percentage: opt.percentage,
                        isCorrect: opt.isCorrect,
                    })),
                    totalVotes: question.totalVotes,
                };

                io.emit('results:update', resultsData);

            } catch (error) {
                console.error('❌ Error submitting answer:', error);
                socket.emit('error', { message: 'Failed to submit answer' });
            }
        });

        // Other socket handlers remain the same...
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

        socket.on('student:kick', async({ studentId }) => {
            try {
                await Student.findOneAndUpdate({ socketId: studentId }, { isKicked: true, isActive: false });
                io.to(studentId).emit('student:kicked');
                const students = await Student.find({ isActive: true, isKicked: false });
                io.to('teachers').emit('students:list', students);
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

        socket.on('chat:message', async({ sender, message, senderRole }) => {
            try {
                const chat = new Chat({ sender, message, senderRole });
                await chat.save();
                io.emit('chat:newMessage', chat);
            } catch (error) {
                console.error('Error saving chat:', error);
            }
        });

        socket.on('disconnect', async() => {
            console.log(`❌ Disconnected: ${socket.id}`);

            if (connectedClients.teachers.has(socket.id)) {
                connectedClients.teachers.delete(socket.id);
            }

            if (connectedClients.students.has(socket.id)) {
                const studentInfo = connectedClients.students.get(socket.id);
                connectedClients.students.delete(socket.id);

                await Student.findOneAndUpdate({ socketId: socket.id }, { isActive: false });

                io.to('teachers').emit('student:left', {
                    socketId: socket.id,
                    name: studentInfo.name,
                });

                const students = await Student.find({ isActive: true, isKicked: false });
                io.to('teachers').emit('students:list', students);
            }
        });
    });

    console.log('🔌 Socket.io handler initialized');
};