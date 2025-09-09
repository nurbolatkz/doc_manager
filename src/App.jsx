import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState({ mode: 'light' });

  // Load auth state and theme on startup
  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme({ mode: savedTheme });
    }
    
    // Check for existing auth token
    const authToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (authToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Ensure user has all required fields for Dashboard
        const completeUser = {
          id: userData.id || 'user_' + Date.now(),
          username: userData.username || 'user',
          name: userData.name || userData.username || 'Пользователь',
          email: userData.email || userData.username + '@company.kz',
          canApprove: true,
          canReject: true,
          canEdit: true,
          avatar: 'https://via.placeholder.com/40'
        };
        
        setUser(completeUser);
        setIsAuthenticated(true);
      } catch (e) {
        // console.error('Error parsing saved user:', e);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLogin = (username, password, token = 'sample-token') => {
    // console.log('Login successful:', { username });
    
    const userObj = {
      id: 'user_' + Date.now(),
      username: username,
      name: username,
      email: username + '@company.kz',
      canApprove: true,
      canReject: true,
      canEdit: true,
      avatar: 'https://via.placeholder.com/40'
    };
    
    setUser(userObj);
    setIsAuthenticated(true);
    
    // Save user data with actual token
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  };

  const toggleTheme = () => {
    const newTheme = { mode: theme.mode === 'light' ? 'dark' : 'light' };
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme.mode);
  };

  return (
    <div className="App">
      {isAuthenticated && user ? (
        <Dashboard 
          currentUser={user} 
          onLogout={handleLogout}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;