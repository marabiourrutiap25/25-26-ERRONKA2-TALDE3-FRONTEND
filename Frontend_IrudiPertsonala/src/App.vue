<!-- CÓDIGO ANTERIOR COMENTADO -->
<!-- <template>
  <Zerbitzuak />
</template>

<script setup>
import Zerbitzuak from '@/views/Zerbitzuak.vue'
</script> -->

<!-- CÓDIGO NUEVO -->
<template>
  <Login v-if="!autenticado" @login-exitoso="onLoginExitoso" />
  <Dashboard v-else @cerrar-sesion="cerrarSesion" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import { isAuthenticated, logout as apiLogout } from '@/composables/Api.js'

const autenticado = ref(false)

// Comprobar si hay sesión guardada
onMounted(() => {
  autenticado.value = isAuthenticated()
})

const onLoginExitoso = (usuario) => {
  autenticado.value = true
}

const cerrarSesion = async () => {
  try {
    await apiLogout()
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
  } finally {
    autenticado.value = false
  }
}
</script>