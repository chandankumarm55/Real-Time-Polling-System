import React from 'react';

const Header = () => {
    return (
        <div className="flex justify-start mb-4 px-6 pt-12">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
                <span className="text-sm">✦</span>
                Intervue Poll
            </div>
        </div>
    );
};

export default Header;