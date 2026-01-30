<template>
  <div class="login-container">
    <!-- Div con imagen -->
    <div class="imagen-section">
      <img src="@/assets/editatu.png" alt="Login" class="login-image" />
    </div>

    <!-- Div con formulario -->
    <div class="form-section">
      <form @submit.prevent="handleLogin" class="login-form">
        <h2 class="mb-4 text-center">Saioa Hasi</h2>
        
        <div class="mb-3">
          <label for="usuario" class="form-label">Erabiltzailea</label>
          <input
            type="text"
            class="form-control"
            id="usuario"
            v-model="usuario"
            placeholder="Sartu erabiltzailea"
            required
          />
        </div>

        <div class="mb-3">
          <label for="pasahitza" class="form-label">Pasahitza</label>
          <input
            type="password"
            class="form-control"
            id="pasahitza"
            v-model="pasahitza"
            placeholder="Sartu pasahitza"
            required
          />
        </div>

        <button type="submit" class="btn btn-light w-100">Sartu</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const usuario = ref('')
const pasahitza = ref('')

function handleLogin() {
  console.log('Login con:', { usuario: usuario.value, pasahitza: pasahitza.value })
  // Aquí va la lógica de autenticación
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
  padding: 20px;
  gap: 30px;
}

.imagen-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.form-section {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  color: #0066cc;
  font-weight: bold;
}

.form-control {
  border: 2px solid #0066cc;
  border-radius: 5px;
  padding: 10px;
}

.form-control:focus {
  border-color: #0052a3;
  box-shadow: 0 0 0 0.2rem rgba(0, 102, 204, 0.25);
}

.btn-light {
  background-color: #0066cc;
  color: white;
  border: none;
  font-weight: bold;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-light:hover {
  background-color: #0052a3;
}
</style>