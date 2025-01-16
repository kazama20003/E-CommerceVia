import axios from "axios";
import Cookies from "js-cookie";

// Crear la instancia de Axios
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://161.132.49.93/api", // URL base de la http://161.132.49.93/api
  timeout: 10000, // Tiempo de espera en milisegundos
  headers: {
    "Content-Type": "application/json", // Tipo de contenido predeterminado
  },
});
//Agrega un interceptor para incluir el token en las solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = Cookies.get("token"); // Replace "token" with your cookie key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
