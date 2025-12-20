import React from 'react';
import { Eye, AlertCircle, CheckCircle } from 'lucide-react';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const LiveQuestionPage = ({ questionData, onNewQuestion, onViewHistory, students, onKickStudent, canCreateNew }) => {
    const answeredCount = questionData.totalVotes || 0;
    const expectedCount = questionData.expectedStudents || students.length;
    const remainingCount = expectedCount - answeredCount;
    const allAnswered = answeredCount >= expectedCount;

    return (
        <div className="min-h-screen bg-white p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-2" style={ { color: colors.darkGray } }>
                            Live Question
                        </h1>
                        {/* Progress Indicator */ }
                        <div className="flex items-center gap-2">
                            { allAnswered ? (
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle size={ 18 } />
                                    <span className="text-sm font-medium">
                                        All students answered ({ answeredCount }/{ expectedCount })
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-orange-600">
                                    <AlertCircle size={ 18 } />
                                    <span className="text-sm font-medium">
                                        Waiting for { remainingCount } student{ remainingCount !== 1 ? 's' : '' } ({ answeredCount }/{ expectedCount })
                                    </span>
                                </div>
                            ) }
                        </div>
                    </div>
                    <button
                        onClick={ onViewHistory }
                        style={ { backgroundColor: colors.primary } }
                        className="px-6 py-2 rounded-full text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <Eye size={ 18 } />
                        View Poll history
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Question and Results */ }
                    <div className="lg:col-span-2">
                        <div
                            className="text-white p-6 rounded-t-2xl"
                            style={ { backgroundColor: colors.darkGray } }
                        >
                            <p className="text-lg font-medium">{ questionData.question }</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-b-2xl space-y-3">
                            { questionData.options.map((option, index) => (
                                <div key={ index } className="relative">
                                    <div
                                        className="h-14 rounded-xl flex items-center justify-between px-4 overflow-hidden transition-all duration-300"
                                        style={ {
                                            background: `linear-gradient(to right, ${colors.primary} ${option.percentage}%, #f3f4f6 ${option.percentage}%)`,
                                        } }
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                                style={ { backgroundColor: colors.primary } }
                                            >
                                                { index + 1 }
                                            </div>
                                            <span className="font-medium">{ option.text }</span>
                                        </div>
                                        <div className="flex items-center gap-3 relative z-10">
                                            <span className="text-sm text-gray-600">
                                                { option.votes } votes
                                            </span>
                                            <span className="font-bold">{ option.percentage }%</span>
                                        </div>
                                    </div>
                                </div>
                            )) }
                        </div>

                        <div className="flex justify-center mt-8">
                            <button
                                onClick={ onNewQuestion }
                                disabled={ !canCreateNew && !allAnswered }
                                style={ { backgroundColor: colors.primary } }
                                className="px-10 py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                title={ !canCreateNew && !allAnswered ? `Wait for ${remainingCount} more student(s) to answer` : '' }
                            >
                                + Ask a new question
                            </button>
                        </div>

                        { !canCreateNew && !allAnswered && (
                            <p className="text-center text-sm text-orange-600 mt-3">
                                Wait for all students to answer before creating a new question
                            </p>
                        ) }
                    </div>

                    {/* Participants Panel */ }
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="border-b border-gray-200">
                            <div className="py-3 px-4 font-semibold text-center" style={ { color: colors.primary } }>
                                Participants ({ students.length })
                            </div>
                        </div>

                        <div className="p-4 h-96 overflow-y-auto">
                            { students.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    No students joined yet
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4 pb-2 border-b">
                                        <span>Name</span>
                                        <span>Action</span>
                                    </div>
                                    { students.map((student) => (
                                        <div
                                            key={ student.socketId || student._id }
                                            className="flex justify-between items-center py-2 hover:bg-gray-50 rounded px-2"
                                        >
                                            <span className="font-medium">{ student.name }</span>
                                            <button
                                                onClick={ () => onKickStudent(student.socketId) }
                                                className="text-red-500 text-sm hover:underline"
                                            >
                                                Kick out
                                            </button>
                                        </div>
                                    )) }
                                </div>
                            ) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveQuestionPage;