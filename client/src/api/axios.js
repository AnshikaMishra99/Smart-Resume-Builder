import axios from "axios";

/**
 * Central Axios instance. All API calls from React components
 * go through this — pointing to our Express backend on port 5000.
 *
 * If deploying, change baseURL via an environment variable
 * (e.g. import.meta.env.VITE_API_URL).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
