<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo de la peluquería -->
      <div class="text-center mb-4">
        <img src="@/assets/IMP_Logotipoa.png" alt="Irudi Pertsonala Logo" class="logo-image mb-3" />
        <h1 class="brand-name">Irudi Pertsonala</h1>
        <p class="brand-subtitle">Peluquería & Estética</p>
      </div>

      <!-- Formulario de login -->
      <form @submit.prevent="iniciarSesion">
        <div class="mb-3">
          <label for="email" class="form-label">Correo electrónico</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-envelope"></i>📧
            </span>
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

        <div class="mb-3">
          <label for="password" class="form-label">Contraseña</label>
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

        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" id="recordar" v-model="recordar">
          <label class="form-check-label" for="recordar">Recordarme</label>
        </div>

        <div v-if="error" class="alert alert-danger py-2" role="alert">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-100 py-2"
          :disabled="cargando"
        >
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'Entrando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div class="text-center mt-4">
        <a href="#" class="text-muted small">¿Olvidaste tu contraseña?</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/composables/Api.js'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)
const mostrarPassword = ref(false)
const recordar = ref(false)

const iniciarSesion = async () => {
  error.value = ''
  cargando.value = true

  try {
    await login(email.value, password.value, recordar.value)
    
    router.push({ name: 'dashboard' })
  } catch (err) {
    if (err.status === 422) {
      error.value = 'Credenciales incorrectas. Verifica tu email y contraseña.'
    } else if (err.status === 401) {
      error.value = 'No autorizado. Verifica tus credenciales.'
    } else {
      error.value = 'Error de conexión. Intenta de nuevo más tarde.'
    }
    console.error('Error login:', err)
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2c4666;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.logo-icon {
  font-size: 3.5rem;
  margin-bottom: 10px;
}

.brand-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0;
}

.logo-image {
  width: 120px;
  height: auto;
  object-fit: contain;
}

.brand-subtitle {
  color: #666;
  font-size: 1rem;
  margin-top: 5px;
}

.form-label {
  font-weight: 500;
  color: #555;
}

.form-control:focus {
  border-color: #2c4666;
  box-shadow: 0 0 0 0.2rem rgba(44, 70, 102, 0.25);
}

.btn-primary {
  background: #2c4666;
  border: none;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.btn-primary:hover {
  background: #3d5a7f;
}

.btn-primary:disabled {
  background: #2c4666;
  opacity: 0.7;
}

.input-group-text {
  background-color: #f8f9fa;
}

a {
  color: #555;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
