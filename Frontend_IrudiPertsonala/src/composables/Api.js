const API_URL = 'http://localhost:8000/api'

// LOGIN
export async function login(email, password, recordar = false) {
  const response = await fetch(API_URL + '/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })

  const data = await response.json()

  console.log('Respuesta del servidor:', data)

  if (response.ok) {
    // Si el usuario marca "Recordarme", usar localStorage (persistente)
    // Si no, usar sessionStorage (se borra al cerrar la ventana)
    const storage = recordar ? localStorage : sessionStorage
    storage.setItem('token', data.token)
    storage.setItem('usuario', JSON.stringify(data.user))
    return data
  } else {
    throw { status: response.status, data: data }
  }
}

// LOGOUT
export async function logout() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  await fetch(API_URL + '/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })

  // Limpiar ambos storages
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('usuario')
}

// COMPROBAR SI ESTÁ LOGUEADO
export function isAuthenticated() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return !!token
}

export const getCurrentUser = () => {
  const usuario = localStorage.getItem('usuario') || sessionStorage.getItem('usuario')
  return usuario ? JSON.parse(usuario) : null
}

// OBTENER TOKEN
export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}
