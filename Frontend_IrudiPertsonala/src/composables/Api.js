const API_URL = 'http://localhost:8000/api'

// LOGIN
export async function login(email, password) {
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
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.user))
    return data
  } else {
    throw { status: response.status, data: data }
  }
}

// LOGOUT
export async function logout() {
  const token = localStorage.getItem('token')

  await fetch(API_URL + '/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })

  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

// COMPROBAR SI ESTÁ LOGUEADO
export function isAuthenticated() {
  const token = localStorage.getItem('token')
  if (token) {
    return true
  } else {
    return false
  }
}

export const getCurrentUser = () => {
  const usuario = localStorage.getItem('usuario')
  return usuario ? JSON.parse(usuario) : null
}
