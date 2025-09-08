import React, { useState, useEffect } from 'react';
import config from '../config';
import { apiRequest } from '../services/fetchManager';
import './Login.css';

// Helper function to properly encode UTF-8 strings for Basic Auth
function utf8ToBase64(str) {
  const encodedStr = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });
  return btoa(encodedStr);
}

// Helper function to get a cookie value by name
function getCookie(name) {
  const cookieValue = document.cookie.split(';').find(cookie => cookie.trim().startsWith(name + '='));
  if (cookieValue) {
    return decodeURIComponent(cookieValue.split('=')[1]);
  }
  return null;
}

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [error, setError] = useState('');
  const [csrfToken, setCsrfToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        // We make a GET request to the Django proxy to get the CSRF cookie.
        // Django's middleware will automatically set it.
        await fetch(config.backend_1c_url, {
          method: 'GET',
          // Crucial for sending and receiving cookies
          credentials: 'include', 
        });

        // After the request, the browser's cookie jar should have the token.
        // We read it from the document's cookies.
        const token = getCookie('csrftoken');
        if (token) {
          setCsrfToken(token);
          // console.log("CSRF token fetched successfully.");
        } else {
          // console.error("CSRF token not found in cookies.");
        }
      } catch (err) {
        // console.error("Failed to fetch CSRF token:", err);
      }
    };
    fetchCsrfToken();
  }, []); // Empty dependency array means this runs only once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Create the Basic Auth header with UTF-8 safe encoding
      const userpass = `${config.username_admin}:${config.username_admin_password}`;
      const basicAuth = utf8ToBase64(userpass);

      // Create request body for login
      const requestBody = {
        "Метод": "POST",
        "Адрес": `${config.localhost_url}login`,
        "ТелоЗапроса": {
          username: username,
          password: password
        }
      };

      // Configure fetch with proper headers
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
          // Include the CSRF token in the headers if available
          ...(csrfToken && { 'X-CSRFToken': csrfToken }),
        },
        body: JSON.stringify(requestBody),
        // Crucial for sending and receiving cookies
        credentials: 'include',
      };

      // console.log("Sending login request to backend with request body:", requestBody);
      // console.log("Backend URL:", config.backend_1c_url);

      // Make the API call to authenticate user
      const response = await fetch(config.backend_1c_url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("Login response from backend:", data);

      // Check if login was successful
      if (data.hasOwnProperty('success') && data.success === 1) {
        // Extract token from response if available
        const token = data.token || 'default_token';
        // Call the onLogin function with username, password, and token
        onLogin(username, password, token);
      } else {
        // Handle login failure
        const errorMessage = data.message || 'Неверное имя пользователя или пароль';
        setError(errorMessage);
      }
    } catch (err) {
      // console.error("Login error:", err);
      setError('Ошибка при попытке входа. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    if (newTheme) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalOpen = () => {
    setShowModal(true);
  };

  return (
    <div className={`login-container ${darkMode ? 'dark' : ''}`}>
      <div className={`login-card ${darkMode ? 'dark' : ''}`}>
        <div className="login-header">
          <h1 className="login-title">
            <i className="fas fa-file-contract mr-2"></i> ДокМенеджер
          </h1>
          <p className={`login-subtitle ${darkMode ? 'dark' : ''}`}>Пожалуйста, войдите в свой аккаунт</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className={`form-label ${darkMode ? 'dark' : ''}`}>
              <i className="fas fa-user mr-2"></i> Имя пользователя
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleInputChange(setUsername)}
              placeholder="Ваше имя пользователя"
              className={`form-input ${darkMode ? 'dark' : ''}`}
              required
              disabled={isLoading}
            />
          </div>

          <div className="password-group">
            <label htmlFor="password" className={`form-label ${darkMode ? 'dark' : ''}`}>
              <i className="fas fa-lock mr-2"></i> Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handleInputChange(setPassword)}
              placeholder="Ваш пароль"
              className={`form-input ${darkMode ? 'dark' : ''}`}
              required
              disabled={isLoading}
            />
            <a href="#" className="forgot-password-link">
              Забыли пароль?
            </a>
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              <div className="submit-button-content">
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner spinner"></i> Вход...
                  </>
                ) : (
                  'Войти'
                )}
              </div>
            </button>
          </div>
        </form>

        <div className={`register-section ${darkMode ? 'dark' : ''}`}>
          <p>
            Нет аккаунта?{' '}
            <button
              onClick={handleModalOpen}
              className="register-link"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className={`modal-content ${darkMode ? 'dark' : ''}`}>
            <div className="modal-header">
              <p className={`modal-title ${darkMode ? 'dark' : ''}`}>Регистрация</p>
              <button
                onClick={handleModalClose}
                className={`modal-close-button ${darkMode ? 'dark' : ''}`}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <p className={`modal-body ${darkMode ? 'dark' : ''}`}>
              Для регистрации, пожалуйста, обратитесь к администратору.
            </p>
            <div className="modal-footer">
              <button
                onClick={handleModalClose}
                className="modal-button"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Toggle */}
      <div className="theme-toggle">
        <button
          onClick={toggleTheme}
          className="theme-toggle-button"
          disabled={isLoading}
        >
          <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>
      </div>

      <footer className={`footer ${darkMode ? 'dark' : ''}`}>
        <p>Этот веб-сайт был создан компанией "KazUni", 2025</p>
      </footer>

      {/* Font Awesome CDN */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </div>
  );
};

export default Login;