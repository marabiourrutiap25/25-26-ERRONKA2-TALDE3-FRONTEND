// src/composables/Api.js

const API_URL = 'http://127.0.0.1:8000/api';
const tokenFijo = "tPtNggGY0QmiL7a7FE9YFxcG2dAzLHvOsVTQd7zb99d535d8";

// =======================
// FUNCION GENÉRICA PARA LLAMAR API
// =======================
async function llamarAPI(metodo, endpoint, datos = {}) {
  let url = `${API_URL}/${endpoint}`;  
  const headers = { 
    'Content-Type': 'application/json', 
    'Authorization': `Bearer ${tokenFijo}` 
  };
  const options = { method: metodo, headers };

  let bodyDatos = { ...datos };
  if (datos.id) {
    url += `/${datos.id}`;
    delete bodyDatos.id;
  }

  if (metodo !== "GET" && metodo !== "HEAD") {
    options.body = JSON.stringify(bodyDatos);
  } else if (Object.keys(bodyDatos).length > 0) {
    const query = new URLSearchParams(bodyDatos).toString();
    url += `?${query}`;
  }

  const response = await fetch(url, options);
  const text = await response.text();
  let resultado = null;

  try {
    resultado = text ? JSON.parse(text) : null;
  } catch (err) {
    console.error('Respuesta no es JSON:', { status: response.status, text });
    throw new Error(`API devolvió no JSON. Estado: ${response.status}`);
  }

  if (!response.ok) {
    const mensaje = resultado?.error || `HTTP error ${response.status}`;
    throw new Error(mensaje);
  }

  return resultado;
}

// =======================
// FUNCIONES CRUD
// =======================
export async function cargarObjetos(endpoint) {
  try {
    const resultado = await llamarAPI('GET', endpoint);
    if (Array.isArray(resultado)) return resultado;
    if (resultado && typeof resultado === 'object') {
      return resultado.data || resultado.results || resultado.items || resultado;
    }
    return [];
  } catch (err) {
    console.error('Error al cargar datos:', err);
    return [];
  }
}

export async function cargarObjeto(filtros, endpoint) {
  try {
    return await llamarAPI('GET', endpoint, filtros);
  } catch (err) {
    console.error('Error al cargar objeto:', err);
    return null;
  }
}

export async function aldatuObjeto(datos, endpoint) {
  try {
    return await llamarAPI('PUT', endpoint, datos);
  } catch (err) {
    console.error('Error al actualizar objeto:', err);
    return null;
  }
}

export async function ezabatuObjektua(datos, endpoint) {
  try {
    return await llamarAPI('DELETE', endpoint, datos);
  } catch (err) {
    console.error('Error al eliminar objeto:', err);
    alert('Error al eliminar: ' + err.message);
    return null;
  }
}

export async function crearObjektua(datos, endpoint) {
  try {
    return await llamarAPI('POST', endpoint, datos);
  } catch (err) {
    console.error('Error al crear objeto:', err);
    return null;
  }
}

export function revisarSesion(endpoint){
  return `${API_URL}/${endpoint}`;
}

// =======================
// LOGIN / LOGOUT
// =======================
export async function login(email, password, recordar = false) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  console.log('Respuesta del servidor:', data);

  if (response.ok) {
    const storage = recordar ? localStorage : sessionStorage;
    storage.setItem('token', data.token);
    storage.setItem('usuario', JSON.stringify(data.user));
    return data;
  } else {
    throw { status: response.status, data };
  }
}

export async function logout() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'Authorization': `Bearer ${token}` 
    }
  });

  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');
}

export function isAuthenticated() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return !!token;
}

export const getCurrentUser = () => {
  const usuario = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
}

export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// =======================
// EXPORT DEFAULT
// =======================
export default {
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  getToken,
  cargarObjetos,
  cargarObjeto,
  aldatuObjeto,
  ezabatuObjektua,
  crearObjektua,
  revisarSesion
}
