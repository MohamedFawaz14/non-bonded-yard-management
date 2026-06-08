import axios from "axios";

const api = axios.create({
  baseURL: "https://non-bonded-yard-management.onrender.com",
  
});

export default api;
