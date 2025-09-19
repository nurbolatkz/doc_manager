const API_BASE = process.env.NODE_ENV === 'production' 
    ? '/api/'
    : 'http://localhost:8000/api/';

// Credential logging removed for security
const config = {
  // Use proxy for development, direct URL for production
backend_1c_url: API_BASE,

//  backend_1c_url: "https://1c-dev.kazuni.kz/Ag_Tech_Web/hs/MobileExchange/redirection",
  loginURL: "login",
  username_admin: process.env.REACT_APP_ADMIN_USERNAME || "Администратор",
  username_admin_password: process.env.REACT_APP_ADMIN_PASSWORD || "ckfdbyf",
  localhost_url: "http://localhost/AG_Tech_unikaz_prod/hs/MobileExchange/"
};

export default config;