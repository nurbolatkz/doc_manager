const API_BASE = process.env.NODE_ENV === 'production' 
    ? '/api/'
    : 'http://localhost:8000/api/';

const config = {
  // Use proxy for development, direct URL for production
backend_1c_url: API_BASE,

//  backend_1c_url: "https://1c-dev.kazuni.kz/Ag_Tech_Web/hs/MobileExchange/redirection",
  loginURL: "login",
  username_admin: "Администратор",
  username_admin_password: "ckfdbyf",
  localhost_url: "http://localhost/Ag_Tech_Mobile/hs/MobileExchange/"
};

export default config;