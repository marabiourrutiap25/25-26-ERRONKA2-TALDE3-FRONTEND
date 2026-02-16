<template>
  <div class="container-fluid vh-100 bg-primary d-flex justify-content-center align-items-center">
    <div class="card shadow-lg p-4 rounded-4 w-100" style="max-width: 420px;">
      
      <!-- Logo -->
      <div class="text-center mb-4">
        <img 
          src="@/assets/editatu.png" 
          alt="Irudi Pertsonala Logo" 
          class="img-fluid mb-3" 
          style="max-width: 120px;"
        />
        <h1 class="h4 fw-bold mb-0">Irudi Pertsonala</h1>
        <p class="text-muted mb-0">Peluquería & Estética</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="iniciarSesion">
        
        <!-- Email -->
        <div class="mb-3">
          <label for="email" class="form-label fw-medium">Correo electrónico</label>
          <div class="input-group">
            <span class="input-group-text">📧</span>
            <input
              id="email"
              type="email"
              class="form-control"
              v-model="email"
              required
              placeholder="tucorreo@ejemplo.com"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="mb-3">
          <label for="password" class="form-label fw-medium">Contraseña</label>
          <div class="input-group">
            <span class="input-group-text">🔒</span>
            <input
              id="password"
              :type="mostrarPassword ? 'text' : 'password'"
              class="form-control"
              v-model="password"
              required
              minlength="4"
              placeholder="••••••••"
            />
            <button 
              type="button" 
              class="btn btn-outline-secondary"
              @click="mostrarPassword = !mostrarPassword"
            >
              {{ mostrarPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <!-- Recordar -->
        <div class="mb-3 form-check">
          <input 
            type="checkbox" 
            class="form-check-input" 
            id="recordar" 
            v-model="recordar"
          >
          <label class="form-check-label" for="recordar">
            Recordarme
          </label>
        </div>

        <!-- Error -->
        <div v-if="error" class="alert alert-danger py-2" role="alert">
          {{ error }}
        </div>

        <!-- Botón -->
        <button 
          type="submit" 
          class="btn btn-primary w-100 py-2 fw-semibold"
          :disabled="cargando"
        >
          <span 
            v-if="cargando" 
            class="spinner-border spinner-border-sm me-2"
          ></span>
          {{ cargando ? 'Entrando...' : 'Iniciar Sesión' }}
        </button>

      </form>

      <!-- Olvidaste contraseña -->
      <div class="text-center mt-4">
        <a href="#" class="text-decoration-none text-muted small">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/composables/Api.js'
import { useMainStore } from '@/stores/UserStore.js'

const router = useRouter()
const store = useMainStore()

// Variables del formulario
const email = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)
const mostrarPassword = ref(false)
const recordar = ref(false)

// Método de login
const iniciarSesion = async () => {
  error.value = ''
  cargando.value = true

  try {
    // Llamada a tu API de login
    const data = await login(email.value, password.value, recordar.value)

    // Guardar usuario y token en el store
    store.setUsuario(data.user, data.token)

    // Redirige a la página principal después del login
    router.push('/egutegiak') 
  } catch (err) {
    if (err.status === 422) {
      error.value = 'Credenciales incorrectas.'
    } else if (err.status === 401) {
      error.value = 'No autorizado.'
    } else {
      error.value = 'Error de conexión. Intenta de nuevo más tarde.'
    }
    console.error('Error login:', err)
  } finally {
    cargando.value = false
  }
}
</script>
