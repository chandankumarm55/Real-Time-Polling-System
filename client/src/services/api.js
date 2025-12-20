// client/src/services/api.js
import axios from 'axios';

// Fix for process.env not being defined
const API_URL = (typeof process !== 'undefined' && process.env.VITE_API_URL) ?
    process.env.VITE_API_URL :
    'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Question APIs
export const questionAPI = {
    create: (data) => api.post('/questions', data),
    getActive: () => api.get('/questions/active'),
    submitAnswer: (data) => api.post('/questions/answer', data),
    getResults: (questionId) => api.get(`/questions/${questionId}/results`),
    getHistory: () => api.get('/questions/history'),
    close: (questionId) => api.put(`/questions/${questionId}/close`),
};

// Student APIs
export const studentAPI = {
    register: (data) => api.post('/students/register', data),
    getActive: () => api.get('/students'),
    kick: (studentId) => api.put(`/students/${studentId}/kick`),
    disconnect: (socketId) => api.put(`/students/${socketId}/disconnect`),
};

// Chat APIs
export const chatAPI = {
    send: (data) => api.post('/chat/send', data),
    getHistory: (limit = 50) => api.get(`/chat/history?limit=${limit}`),
    clear: () => api.delete('/chat/clear'),
};

export default api;