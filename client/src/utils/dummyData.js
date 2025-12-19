export const dummyStudents = [
    { id: '1', name: 'Rahul Arora', status: 'active' },
    { id: '2', name: 'Pushpender Rautela', status: 'active' },
    { id: '3', name: 'Rijul Zalpuri', status: 'active' },
    { id: '4', name: 'Nadeem N', status: 'active' },
    { id: '5', name: 'Ashwin Sharma', status: 'active' },
];

export const dummyChatMessages = [
    { id: '1', user: 'User 1', message: 'Hey there, how can I help?', timestamp: Date.now() },
    { id: '2', user: 'User 2', message: 'Nothing bro, just chilling', timestamp: Date.now() },
    { id: '3', user: 'User 1', message: 'Cool! Let me know if you need anything', timestamp: Date.now() },
];

export const dummyPollHistory = [{
        id: 1,
        question: 'Which planet is known as the Red Planet?',
        options: [
            { id: 'a', label: 'Mars', percentage: 75, isCorrect: true },
            { id: 'b', label: 'Venus', percentage: 0, isCorrect: false },
            { id: 'c', label: 'Jupiter', percentage: 5, isCorrect: false },
            { id: 'd', label: 'Saturn', percentage: 15, isCorrect: false }
        ],
        totalResponses: 20,
        createdAt: Date.now() - 3600000
    },
    {
        id: 2,
        question: 'What is the largest ocean on Earth?',
        options: [
            { id: 'a', label: 'Pacific Ocean', percentage: 85, isCorrect: true },
            { id: 'b', label: 'Atlantic Ocean', percentage: 10, isCorrect: false },
            { id: 'c', label: 'Indian Ocean', percentage: 5, isCorrect: false }
        ],
        totalResponses: 20,
        createdAt: Date.now() - 7200000
    }
];

export const dummyCurrentQuestion = {
    id: 'q1',
    question: 'Which planet is known as the Red Planet?',
    options: [
        { id: 'mars', label: 'Mars', isCorrect: true },
        { id: 'venus', label: 'Venus', isCorrect: false },
        { id: 'jupiter', label: 'Jupiter', isCorrect: false },
        { id: 'saturn', label: 'Saturn', isCorrect: false }
    ],
    timeLimit: 60,
    createdAt: Date.now()
};

export const dummyResults = [
    { optionId: 'mars', label: 'Mars', count: 15, percentage: 75 },
    { optionId: 'venus', label: 'Venus', count: 1, percentage: 5 },
    { optionId: 'jupiter', label: 'Jupiter', count: 1, percentage: 5 },
    { optionId: 'saturn', label: 'Saturn', count: 3, percentage: 15 }
];