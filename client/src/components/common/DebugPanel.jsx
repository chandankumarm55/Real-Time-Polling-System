// FILE 5: frontend/src/components/common/DebugPanel.jsx
// THIS IS A NEW FILE - CREATE IT
// Optional but highly recommended for debugging

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';

const DebugPanel = () => {
    const { socket, isConnected } = useSocket();
    const [events, setEvents] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!socket) return;

        // Monitor all socket events
        const eventTypes = [
            'connect',
            'disconnect',
            'question:new',
            'question:created',
            'question:ended',
            'results:update',
            'student:joined',
            'student:left',
            'student:kicked',
            'students:list',
            'chat:newMessage',
            'error',
        ];

        const handlers = {};

        eventTypes.forEach(eventType => {
            const handler = (data) => {
                const timestamp = new Date().toLocaleTimeString();
                setEvents(prev => [
                    {
                        time: timestamp,
                        type: eventType,
                        data: JSON.stringify(data, null, 2),
                    },
                    ...prev.slice(0, 19) // Keep last 20 events
                ]);
            };
            socket.on(eventType, handler);
            handlers[eventType] = handler;
        });

        return () => {
            eventTypes.forEach(eventType => {
                socket.off(eventType, handlers[eventType]);
            });
        };
    }, [socket]);

    if (!isVisible) {
        return (
            <button
                onClick={ () => setIsVisible(true) }
                className="fixed bottom-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs z-50 hover:bg-blue-700"
            >
                Show Debug
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 w-96 max-h-96 bg-white border-2 border-blue-600 rounded-lg shadow-2xl overflow-hidden z-50">
            {/* Header */ }
            <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className={ `w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}` }></div>
                    <span className="font-semibold text-sm">
                        Socket Debug { isConnected ? '(Connected)' : '(Disconnected)' }
                    </span>
                </div>
                <button
                    onClick={ () => setIsVisible(false) }
                    className="text-white hover:text-gray-200"
                >
                    ✕
                </button>
            </div>

            {/* Info */ }
            <div className="px-4 py-2 bg-gray-50 border-b text-xs">
                <div>Socket ID: <span className="font-mono font-bold">{ socket?.id || 'N/A' }</span></div>
                <div>Events: <span className="font-bold">{ events.length }</span></div>
            </div>

            {/* Events List */ }
            <div className="overflow-y-auto max-h-64 p-2">
                { events.length === 0 ? (
                    <div className="text-center text-gray-500 text-xs py-4">
                        No events yet...
                    </div>
                ) : (
                    <div className="space-y-2">
                        { events.map((event, idx) => (
                            <div
                                key={ idx }
                                className="bg-gray-100 rounded p-2 text-xs border border-gray-200"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-blue-600">{ event.type }</span>
                                    <span className="text-gray-500 text-[10px]">{ event.time }</span>
                                </div>
                                <pre className="text-[10px] text-gray-700 overflow-x-auto whitespace-pre-wrap break-words max-h-20 overflow-y-auto">
                                    { event.data }
                                </pre>
                            </div>
                        )) }
                    </div>
                ) }
            </div>

            {/* Actions */ }
            <div className="px-4 py-2 bg-gray-50 border-t flex gap-2">
                <button
                    onClick={ () => setEvents([]) }
                    className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                >
                    Clear
                </button>
                <button
                    onClick={ () => console.log('Socket Events:', events) }
                    className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                >
                    Log to Console
                </button>
            </div>
        </div>
    );
};

export default DebugPanel;