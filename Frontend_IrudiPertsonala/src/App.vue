<template>
  <div>
    <!-- Header/Navbar -->
    <div class="p-3 d-flex justify-content-between align-items-center" style="background-color: #005EAA;">
      <div class="d-flex align-items-center gap-3">
        <button v-if="!mostrarNav" class="btn btn-outline-light" style="width: 44px; height: 44px; padding: 0;" @click="mostrarNav = true">
          <img src="@/assets/editatu.png" alt="Menú" width="24" height="24" />
        </button>
        <button v-if="mostrarNav" class="btn btn-outline-light" style="width: 44px; height: 44px; padding: 0;" @click="mostrarNav = false">
          <img src="@/assets/ezabatu.png" alt="Cerrar" width="24" height="24" />
        </button>
        <img src="@/assets/ezabatu.png" alt="Logo" width="32" height="32" />
      </div>
      <button class="btn btn-light">Saioa itsi</button>
    </div>

    <!-- Main content -->
    <div class="d-flex">
      <nav v-if="mostrarNav" class="bg-light border-end p-3" style="width: 200px; min-height: calc(100vh - 60px);">
        <div class="nav flex-column">
          <RouterLink to="/egutegiak" class="nav-link">Egutegia</RouterLink>
          <RouterLink to="/Ikasleak" class="nav-link">Ikasleak</RouterLink>
          <RouterLink to="/Materialak" class="nav-link">Materialak</RouterLink>
          <RouterLink to="/Produktuak" class="nav-link">Produktuak</RouterLink>
          <RouterLink to="/Zerbitzuak" class="nav-link">Zerbitzuak</RouterLink>
          <RouterLink to="/menu" class="nav-link">Menu</RouterLink>
        </div>
      </nav>

      <div class="flex-grow-1">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { RouterLink, RouterView } from 'vue-router'

  const mostrarNav = ref(false)
</script>