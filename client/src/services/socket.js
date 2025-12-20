import io from 'socket.io-client';

// Fix for process.env not being defined
const SOCKET_URL = (typeof process !== 'undefined' && process.env.VITE_SOCKET_URL) ?
    process.env.VITE_SOCKET_URL :
    'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        // Avoid creating multiple connections
        if (this.socket && this.socket.connected) {
            console.log('✅ Socket already connected:', this.socket.id);
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return this.socket;
    }

    getSocket() {
        if (!this.socket) {
            return this.connect();
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Student Events
    studentJoin(name) {
        if (!this.socket) this.connect();
        this.socket.emit('student:join', { name });
    }

    // Teacher Events
    teacherJoin() {
        if (!this.socket) this.connect();
        this.socket.emit('teacher:join');
    }

    createQuestion(questionData) {
        if (!this.socket) this.connect();
        this.socket.emit('question:create', questionData);
    }

    // Answer Events
    submitAnswer(questionId, optionIndex) {
        if (!this.socket) this.connect();
        this.socket.emit('answer:submit', { questionId, optionIndex });
    }

    // Chat Events
    sendChatMessage(sender, message, senderRole) {
        if (!this.socket) this.connect();
        this.socket.emit('chat:message', { sender, message, senderRole });
    }

    // Student Management (teacher)
    kickStudent(studentId) {
        if (!this.socket) this.connect();
        this.socket.emit('student:kick', { studentId });
    }

    getActiveStudents() {
        if (!this.socket) this.connect();
        this.socket.emit('students:get');
    }

    // Event Listeners
    onStudentJoined(callback) {
        if (!this.socket) this.connect();
        this.socket.on('student:joined', callback);
    }

    onStudentLeft(callback) {
        if (!this.socket) this.connect();
        this.socket.on('student:left', callback);
    }

    onStudentKicked(callback) {
        if (!this.socket) this.connect();
        this.socket.on('student:kicked', callback);
    }

    onQuestionNew(callback) {
        if (!this.socket) this.connect();
        this.socket.on('question:new', callback);
    }

    onQuestionCreated(callback) {
        if (!this.socket) this.connect();
        this.socket.on('question:created', callback);
    }

    onQuestionEnded(callback) {
        if (!this.socket) this.connect();
        this.socket.on('question:ended', callback);
    }

    onResultsUpdate(callback) {
        if (!this.socket) this.connect();
        this.socket.on('results:update', callback);
    }

    onChatNewMessage(callback) {
        if (!this.socket) this.connect();
        this.socket.on('chat:newMessage', callback);
    }

    onStudentsList(callback) {
        if (!this.socket) this.connect();
        this.socket.on('students:list', callback);
    }

    onStudentsUpdate(callback) {
        if (!this.socket) this.connect();
        this.socket.on('students:update', callback);
    }

    onError(callback) {
        if (!this.socket) this.connect();
        this.socket.on('error', callback);
    }

    // Remove Listeners
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }
}

export default new SocketService();