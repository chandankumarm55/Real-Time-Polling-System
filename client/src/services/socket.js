// client/src/services/socket.js
import io from 'socket.io-client';

// Fix for process.env not being defined
const SOCKET_URL = (typeof process !== 'undefined' && process.env.REACT_APP_SOCKET_URL) ?
    process.env.REACT_APP_SOCKET_URL :
    'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        // FIX: Check if socket exists AND is connected
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

        this.socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
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
        this.socket.emit('student:join', { name });
    }

    // Teacher Events
    teacherJoin() {
        this.socket.emit('teacher:join');
    }

    createQuestion(questionData) {
        this.socket.emit('question:create', questionData);
    }

    // Answer Events
    submitAnswer(questionId, optionIndex) {
        this.socket.emit('answer:submit', { questionId, optionIndex });
    }

    // Question Events
    questionTimeUp(questionId) {
        this.socket.emit('question:timeup', { questionId });
    }

    // Chat Events
    sendChatMessage(sender, message, senderRole) {
        this.socket.emit('chat:message', { sender, message, senderRole });
    }

    // Student Management
    kickStudent(studentId) {
        this.socket.emit('student:kick', { studentId });
    }

    getActiveStudents() {
        this.socket.emit('students:get');
    }

    // Event Listeners
    onStudentJoined(callback) {
        this.socket.on('student:joined', callback);
    }

    onStudentLeft(callback) {
        this.socket.on('student:left', callback);
    }

    onStudentKicked(callback) {
        this.socket.on('student:kicked', callback);
    }

    onQuestionNew(callback) {
        this.socket.on('question:new', callback);
    }

    onQuestionCreated(callback) {
        this.socket.on('question:created', callback);
    }

    onQuestionEnded(callback) {
        this.socket.on('question:ended', callback);
    }

    onResultsUpdate(callback) {
        this.socket.on('results:update', callback);
    }

    onChatNewMessage(callback) {
        this.socket.on('chat:newMessage', callback);
    }

    onStudentsList(callback) {
        this.socket.on('students:list', callback);
    }

    onStudentsUpdate(callback) {
        this.socket.on('students:update', callback);
    }

    onError(callback) {
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