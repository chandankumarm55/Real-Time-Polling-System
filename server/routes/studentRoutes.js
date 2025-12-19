const express = require('express');
const router = express.Router();
const {
    registerStudent,
    getActiveStudents,
    kickStudent,
    disconnectStudent,
} = require('../controllers/studentController');

// @route   POST /api/students/register
// @desc    Register a new student
router.post('/register', registerStudent);

// @route   GET /api/students
// @desc    Get all active students
router.get('/', getActiveStudents);

// @route   PUT /api/students/:studentId/kick
// @desc    Kick a student
router.put('/:studentId/kick', kickStudent);

// @route   PUT /api/students/:socketId/disconnect
// @desc    Disconnect a student
router.put('/:socketId/disconnect', disconnectStudent);

module.exports = router;