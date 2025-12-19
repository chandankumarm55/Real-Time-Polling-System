import React from 'react';

const Header = () => {
    return (
        <div className="flex justify-start mb-8 px-8 pt-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="text-lg">✦</span>
                Intervue Poll
            </div>
        </div>
    );
};

export default Header;