<template>
  <div class="container my-5" style="max-width: 480px" v-if="!logeado">
    <h2 class="mb-4 text-center">Iniciar sesión</h2>

    <form @submit.prevent="iniciarSesion">
      <div class="mb-3">
        <label for="email" class="form-label">Correo electrónico</label>
        <input
          id="email"
          type="email"
          class="form-control"
          v-model="email"
          required
          placeholder="tucorreo@ejemplo.com"
        />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Contraseña</label>
        <input
          id="password"
          type="password"
          class="form-control"
          v-model="password"
          required
          minlength="4"
          placeholder="••••"
        />
      </div>

      <p v-if="error" class="text-danger small mb-3">
        {{ error }}
      </p>

      <button type="submit" class="btn btn-primary w-100">
        Entrar
      </button>
    </form>
  </div>

  <div class="container" v-else>
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Gestión de Personas</h2>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="cerrarSesion">
          Cerrar sesión
        </button>
        <button class="btn btn-success" @click="crearPersona">
          ➕ Nueva persona
        </button>
      </div>
    </div>

    <Tabla
      Titulo="Listado de personas"
      :filas="personas"
      @editar-servicio="editarPersona"
      @borrar-servicio="borrarPersona"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import Tabla from '../components/tabla.vue'

// Estado del login
const email = ref('')
const password = ref('')
const error = ref('')
const logeado = ref(false)

const iniciarSesion = () => {
  error.value = ''

  // Login muy simple de ejemplo
  if (email.value === 'admin@test.com' && password.value === '1234') {
    logeado.value = true
  } else {
    error.value = 'Credenciales incorrectas. Usa admin@test.com / 1234'
  }
}

const cerrarSesion = () => {
  logeado.value = false
  email.value = ''
  password.value = ''
  error.value = ''
}

// Datos de ejemplo de personas
const personas = ref([])

const cargarPersonas = async () => {
  personas.value = [
    { id: 1, nombre: 'Juan', email: 'juan@test.com', edad: 30 },
    { id: 2, nombre: 'Ana', email: 'ana@test.com', edad: 25 },
    { id: 3, nombre: 'Luis', email: 'luis@test.com', edad: 40 }
  ]
}
onMounted(cargarPersonas)

const editarPersona = (id) => {
  console.log('Editar', id)
}

const borrarPersona = async (id) => {
  const confirmar = confirm('¿Seguro que quieres borrar esta persona?')

  if (!confirmar) return

  personas.value = personas.value.filter(p => p.id !== id)
}

const crearPersona = () => {
  // Aquí podrías abrir un modal o formulario para añadir una nueva persona
  alert('Aquí iría el formulario para crear una nueva persona.')
}
</script>