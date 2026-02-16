<template>
  <div>
    <!-- Header/Navbar -->
    <div 
      v-if="mostrarHeader" 
      class="p-2 d-flex justify-content-between align-items-center bg-primary"
    >
      <div class="d-flex align-items-center gap-2">
        
        <button 
          v-if="!mostrarNav" 
          class="btn btn-outline-light btn-sm"
          @click="mostrarNav = true"
        >
          ☰
        </button>

        <button 
          v-if="mostrarNav" 
          class="btn btn-outline-light btn-sm"
          @click="mostrarNav = false"
        >
          ✕
        </button>

        <span class="text-white fw-semibold small">APP</span>
      </div>

      <button class="btn btn-light btn-sm" @click="cerrarSesion">
        Saioa itsi
      </button>
    </div>

    <!-- Main content -->
    <div class="container-fluid">
      <div class="row">

        <!-- Sidebar -->
        <nav 
          v-if="mostrarNav && mostrarHeader && !enLogin"
          class="col-12 col-md-2 col-lg-1 bg-light border-end p-2"
        >
          <div class="nav nav-pills flex-column small">
            <RouterLink to="/egutegiak" class="nav-link py-1">Egutegia</RouterLink>
            <RouterLink to="/Ikasleak" class="nav-link py-1">Ikasleak</RouterLink>
            <RouterLink to="/Materialak" class="nav-link py-1">Materialak</RouterLink>
            <RouterLink to="/Produktuak" class="nav-link py-1">Produktuak</RouterLink>
            <RouterLink to="/Zerbitzuak" class="nav-link py-1">Zerbitzuak</RouterLink>
            <RouterLink to="/menu" class="nav-link py-1">Menu</RouterLink>
          </div>
        </nav>

        <!-- Content -->
        <main 
          :class="mostrarNav && mostrarHeader && !enLogin 
            ? 'col-md-10 col-lg-11 p-3' 
            : 'col-12 p-3'"
        >
          <RouterView />
        </main>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useMainStore } from '@/stores/UserStore.js'

const mostrarNav = ref(false)
const route = useRoute()
const router = useRouter()
const store = useMainStore()

// Detectar si estamos en login (/)
const enLogin = computed(() => route.path === '/')

// Mostrar header solo si no estamos en login
const mostrarHeader = computed(() => !enLogin.value)

/*
  🔐 SISTEMA DE PROTECCIÓN DE RUTAS

  - Si no estamos en "/" (login)
  - Y no existe store.usuario (no hay sesión)
  - Entonces redirigimos automáticamente a "/"
*/
//const comprobarSesion = () => {
  //if (!enLogin.value && !store.usuario) {
   // router.replace('/')
  //}
//}

// Se ejecuta al cargar la app
onMounted(() => {
 // comprobarSesion()
})

// Se ejecuta cada vez que cambia la ruta
watch(() => route.path, () => {
 // comprobarSesion()
})

// Cerrar sesión
const cerrarSesion = () => {
  store.limpiar()
  router.replace('/')
}
</script>
