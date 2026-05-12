import axios from "axios";

/**
 * Unauthenticated axios instance used exclusively for public-facing API calls.
 * No session cookies are sent, so Django always treats these requests as
 * anonymous — filter_by_visibility shows only "Public" content.
 */
const publicApi = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: false,
});

export default publicApi;
