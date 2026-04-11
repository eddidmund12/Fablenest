const isDev = window.location.hostname === "127.0.0.1" || 
              window.location.hostname === "localhost";

export const API_BASE = isDev 
  ? "http://127.0.0.1:5000"        // dev
  : "https://your-api.onrender.com"; // production