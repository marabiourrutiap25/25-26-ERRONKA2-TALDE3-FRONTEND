<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo de la peluquería -->
      <div class="text-center mb-4">
        <img src="@/assets/IMP_Logotipoa.png" alt="Irudi Pertsonala Logo" class="logo-image mb-3" />
        <h1 class="brand-name">Irudi Pertsonala</h1>
        <p class="brand-subtitle">Ile-apainketa & Estetika</p>
      </div>

      <!-- Formulario de login -->
      <form @submit.prevent="iniciarSesion">
        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <div class="input-group">
            <input id="email" type="email" class="form-control" v-model="email" required
              placeholder="niremail@adibide.com" />
          </div>
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Pasahitza</label>
          <div class="input-group">
            <input id="password" :type="mostrarPassword ? 'text' : 'password'" class="form-control" v-model="password"
              required minlength="1" placeholder="••••••••" />
            <button type="button" class="btn btn-outline-secondary btn-eye" @click="mostrarPassword = !mostrarPassword"
              :aria-label="mostrarPassword ? 'Ez ikusi' : 'Ikusi'">
              <img :src="mostrarPassword ? ezIkusi : ikusi" :alt="mostrarPassword ? 'Ez ikusi' : 'Ikusi'"
                class="eye-icon" />
            </button>
          </div>
        </div>

        <div v-if="error" class="alert alert-danger py-2" role="alert">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary w-100 py-2" :disabled="cargando">
          <span v-if="cargando" class="spinner-border spinner-border-sm me-2"></span>
          {{ cargando ? 'Sartzen...' : 'Saioa hasi' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/composables/Api.js'
import ikusi from '@/assets/ikusi.png'
import ezIkusi from '@/assets/ez_ikusi.png'

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
      error.value = 'Kredentzial okerrak. Egiaztatu zure emaila eta pasahitza.'
    } else if (err.status === 401) {
      error.value = 'Baimenik gabe. Egiaztatu zure kredentzialak.'
    } else {
      error.value = 'Konexio-errorea. Saiatu berriz.'
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

.btn-eye {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
}

.eye-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

a {
  color: #555;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
