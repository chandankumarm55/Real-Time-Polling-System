export const COLORS = {
    primary: '#7765DA',
    secondary: '#5767D0',
    darkPurple: '#4F0DCE',
    lightGray: '#F2F2F2',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

export const ROUTES = {
    WELCOME: 'welcome',
    STUDENT_NAME: 'student-name',
    STUDENT_WAITING: 'student-waiting',
    STUDENT_QUESTION: 'student-question',
    STUDENT_RESULTS: 'student-results',
    TEACHER_CREATE: 'teacher-create',
    TEACHER_RESULTS: 'teacher-results',
    TEACHER_HISTORY: 'teacher-history',
    KICKED_OUT: 'kicked-out',
};

export const DEFAULT_TIME_LIMIT = 60;

export const SOCKET_EVENTS = {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    NEW_QUESTION: 'new_question',
    SUBMIT_ANSWER: 'submit_answer',
    RESULTS_UPDATE: 'results_update',
    NEW_MESSAGE: 'new_message',
    SEND_MESSAGE: 'send_message',
    STUDENT_JOINED: 'student_joined',
    STUDENT_LEFT: 'student_left',
    STUDENT_KICKED: 'student_kicked',
    KICK_STUDENT: 'kick_student',
    JOIN_ROOM: 'join_room',
    CREATE_QUESTION: 'create_question',
};