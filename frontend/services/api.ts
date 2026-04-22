import axios from "axios";

// ✅ Helper to get CSRF cookie
function getCSRFToken() {
  const name = "csrftoken=";
  const decoded = decodeURIComponent(document.cookie);
  const cookies = decoded.split(";");

  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith(name)) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// ✅ Automatically attach CSRF token to every request
api.interceptors.request.use((config) => {
  const csrfToken = getCSRFToken();

  if (csrfToken) {
    config.headers["X-CSRFToken"] = csrfToken;
  }

  return config;
});

export default api;