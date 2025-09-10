import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

// Robust storage helper that falls back to in-memory storage
const storage = {
  setItem: (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      // Fallback to in-memory storage for Safari private mode
      storage.memory[key] = value;
    }
  },
  getItem: (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      // Fallback to in-memory storage
      return storage.memory[key] || null;
    }
  },
  removeItem: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      // Fallback to in-memory storage
      delete storage.memory[key];
    }
  },
  memory: {}
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState({ mode: 'light' });

  // Load auth state and theme on startup
  useEffect(() => {
    // Load theme
    const savedTheme = storage.getItem('theme');
    if (savedTheme) {
      setTheme({ mode: savedTheme });
    }
    
    // Check for existing auth token
    const authToken = storage.getItem('authToken');
    const savedUser = storage.getItem('currentUser');
    
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
        storage.removeItem('authToken');
        storage.removeItem('currentUser');
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
    
    // Save user data with actual token using robust storage
    storage.setItem('authToken', token);
    storage.setItem('currentUser', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    storage.removeItem('authToken');
    storage.removeItem('currentUser');
  };

  const toggleTheme = () => {
    const newTheme = { mode: theme.mode === 'light' ? 'dark' : 'light' };
    setTheme(newTheme);
    storage.setItem('theme', newTheme.mode);
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