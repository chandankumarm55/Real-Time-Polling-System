import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { questionAPI } from '../../services/api';

const colors = {
    primary: '#7765DA',
    darkGray: '#373737',
    mediumGray: '#6E6E6E',
};

const PollHistoryPage = ({ onBack }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await questionAPI.getHistory();
            console.log('Poll history:', response.data);
            setHistory(response.data.data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <div className="min-h-screen bg-white p-8 pt-24">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={ onBack }
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft size={ 24 } style={ { color: colors.primary } } />
                    </button>
                    <h1 className="text-3xl font-bold" style={ { color: colors.darkGray } }>
                        View Poll History
                    </h1>
                </div>

                { loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Loading history...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No poll history available</p>
                        <p className="text-gray-500 mt-2">Create your first poll to see it here</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        { history.map((poll, pollIndex) => (
                            <div key={ poll._id } className="border-b border-gray-200 pb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="font-semibold text-lg" style={ { color: colors.darkGray } }>
                                        Question { pollIndex + 1 }
                                    </h2>
                                    <div className="text-sm text-gray-500">
                                        { formatDate(poll.createdAt) }
                                    </div>
                                </div>

                                <div
                                    className="text-white p-6 rounded-t-2xl"
                                    style={ { backgroundColor: colors.darkGray } }
                                >
                                    <p className="text-lg">{ poll.questionText }</p>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-b-2xl space-y-3">
                                    { poll.options.map((option, index) => (
                                        <div key={ index } className="relative">
                                            <div
                                                className="h-14 rounded-xl flex items-center justify-between px-4"
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

                                <div className="mt-4 text-sm text-gray-600">
                                    Total Votes: { poll.totalVotes } | Time Limit: { poll.timeLimit }s
                                </div>
                            </div>
                        )) }
                    </div>
                ) }
            </div>
        </div>
    );
};

export default PollHistoryPage;