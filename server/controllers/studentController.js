const Student = require('../models/Student');

// Register a new student
exports.registerStudent = async(req, res) => {
    try {
        const { name, socketId } = req.body;

        if (!name || !socketId) {
            return res.status(400).json({
                success: false,
                message: 'Name and socket ID are required',
            });
        }

        // Check if student with this socket ID already exists
        let student = await Student.findOne({ socketId });

        if (student) {
            // Update existing student
            student.name = name;
            student.isActive = true;
            student.isKicked = false;
            await student.save();
        } else {
            // Create new student
            student = new Student({
                name,
                socketId,
                isActive: true,
            });
            await student.save();
        }

        res.status(201).json({
            success: true,
            data: student,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all active students
exports.getActiveStudents = async(req, res) => {
    try {
        const students = await Student.find({ isActive: true, isKicked: false })
            .select('name socketId joinedAt')
            .sort({ joinedAt: -1 });

        res.status(200).json({
            success: true,
            count: students.length,
            data: students,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Kick a student
exports.kickStudent = async(req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findOneAndUpdate({ socketId: studentId }, {
            isKicked: true,
            isActive: false,
        }, { new: true });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student kicked successfully',
            data: student,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Disconnect student
exports.disconnectStudent = async(req, res) => {
    try {
        const { socketId } = req.params;

        const student = await Student.findOneAndUpdate({ socketId }, { isActive: false }, { new: true });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student disconnected',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};