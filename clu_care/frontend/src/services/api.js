import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // ⚠ Make sure this is correct
//   timeout: 5000
});

export default api;
