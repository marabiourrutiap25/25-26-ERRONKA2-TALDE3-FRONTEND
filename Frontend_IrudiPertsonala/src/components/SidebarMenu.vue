<template>
  <!-- Navbar -->
  <nav class="navbar">
    <div class="container-fluid">
      <button class="btn-menu" @click="toggleMenu">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </button>
      <button 
        class="btn btn-light btn-sm" 
        @click="cerrarSesion"
      >
        Saioa Itxi
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-left: 4px;">
          <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
          <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
        </svg>
      </button>
    </div>
  </nav>

  <!-- Overlay para cerrar el menú -->
  <div class="sidebar-overlay" :class="{ active: modelValue }" @click="$emit('update:modelValue', false)"></div>
  
  <!-- Sidebar Menu -->
  <aside class="sidebar" :class="{ active: modelValue }">
    <div class="sidebar-header">
      <button class="btn-menu-sidebar" @click="$emit('update:modelValue', false)">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="white" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <!-- Sección Biltegia -->
      <div class="sidebar-section">
        <div class="sidebar-section-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
            <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3zm3 0h-2v3h2v-3z"/>
          </svg>
          <span>Biltegia</span>
        </div>
        <ul class="sidebar-menu">
          <li><a @click="router.push('/hitzorduak')">Hitzorduak</a></li>
          <li><a @click="router.push('/txandak')">Txandak</a></li>
          <li><a @click="router.push('/hitzorduak')">Inbentarioa</a></li>
          <li><a @click="router.push('/hitzorduak')">Gelak</a></li>
        </ul>
      </div>

      <!-- Sección Parametrizazioa -->
      <div class="sidebar-section">
        <div class="sidebar-section-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
          </svg>
          <span>Parametrizazioa</span>
        </div>
        <ul class="sidebar-menu">
          <li><a href="#">Profila</a></li>
          <li><a href="#">Erabiltzaileak</a></li>
        </ul>
      </div>
    </nav>

    <!-- Logo en la parte inferior -->
    <div class="sidebar-footer">
      <img src="@/assets/IMP_Logotipoa.png" alt="Logo" class="sidebar-logo" />
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { logout as apiLogout } from '@/composables/Api.js'

const router = useRouter()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const toggleMenu = () => {
  emit('update:modelValue', !props.modelValue)
}

const cerrarSesion = async () => {
  try {
    await apiLogout()
  } catch (err) {
    console.error('Error al cerrar sesión:', err)
  } finally {
    router.push({ name: 'login' })
  }
}
</script>

<style scoped>
.navbar {
  background-color: #2c4666;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-menu {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.btn-light {
  background-color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 998;
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}

.sidebar {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100vh;
  background-color: #1a1a2e;
  display: flex;
  flex-direction: column;
  transition: left 0.3s ease;
  z-index: 999;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.3);
}

.sidebar.active {
  left: 0;
}

.sidebar-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  color: #3b82f6;
  font-size: 0.9rem;
  font-weight: 500;
  display: block;
  margin-bottom: 0.75rem;
}

.btn-menu-sidebar {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.sidebar-section-header span {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: 2rem;
}

.sidebar-menu li {
  margin-bottom: 0.75rem;
}

.sidebar-menu a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.sidebar-menu a:hover {
  color: white;
}

.sidebar-footer {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  width: 120px;
  height: auto;
  filter: brightness(0) invert(1);
}
</style>
