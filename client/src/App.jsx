// src/App.jsx
import React, { useState } from 'react';
import WelcomePage from './pages/WelcomePage.jsx';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { SocketProvider } from './context/SocketContext';

export default function App() {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
  };

  return (
    <SocketProvider>
      <>
        { !selectedRole && <WelcomePage onSelectRole={ handleSelectRole } /> }
        { selectedRole === 'teacher' && <TeacherDashboard /> }
        { selectedRole === 'student' && <StudentDashboard /> }
      </>
    </SocketProvider>
  );
}