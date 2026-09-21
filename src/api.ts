const API_URL =
    (import.meta as any).env?.VITE_API_URL ||
    'https://miraaya-backend.onrender.com/api';

export { API_URL };