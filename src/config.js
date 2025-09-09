const API_BASE = process.env.NODE_ENV === 'production' 
    ? '/api/'
    : 'http://localhost:8000/api/';

console.log("REACT_APP_ADMIN_USERNAME:", process.env.REACT_APP_ADMIN_USERNAME);
console.log("REACT_APP_ADMIN_PASSWORD:", process.env.REACT_APP_ADMIN_PASSWORD);
const config = {
  // Use proxy for development, direct URL for production
backend_1c_url: API_BASE,

//  backend_1c_url: "https://1c-dev.kazuni.kz/Ag_Tech_Web/hs/MobileExchange/redirection",
  loginURL: "login",
  username_admin: process.env.REACT_APP_ADMIN_USERNAME || "Администратор",
  username_admin_password: process.env.REACT_APP_ADMIN_PASSWORD || "ckfdbyf",
  localhost_url: "http://localhost/Ag_Tech_Mobile/hs/MobileExchange/"
};

export default config;