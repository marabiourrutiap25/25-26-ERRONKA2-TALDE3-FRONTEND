<template>
  <div>
    <!-- Header/Navbar -->
    <div v-if="mostrarHeader" class="p-3 d-flex justify-content-between align-items-center" style="background-color: #005EAA;">
      <div class="d-flex align-items-center gap-3">
        <button v-if="!mostrarNav" class="btn btn-outline-light" style="width: 44px; height: 44px; padding: 0;" @click="mostrarNav = true">
          <img src="@/assets/editatu.png" alt="Menú" class="img-fluid" style="max-width: 24px;" />
        </button>
        <button v-if="mostrarNav" class="btn btn-outline-light" style="width: 44px; height: 44px; padding: 0;" @click="mostrarNav = false">
          <img src="@/assets/ezabatu.png" alt="Cerrar" class="img-fluid" style="max-width: 24px;" />
        </button>
        <img src="@/assets/ezabatu.png" alt="Logo" class="img-fluid" style="max-width: 32px;" />
      </div>
      <button class="btn btn-light">Saioa itsi</button>
    </div>

    <!-- Main content -->
    <div class="d-flex">
      <nav v-if="mostrarNav && mostrarHeader" class="bg-light border-end p-3" style="width: 200px; min-height: calc(100vh - 60px);">
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
  import { ref, computed } from 'vue'
  import { RouterLink, RouterView, useRoute } from 'vue-router'

  const mostrarNav = ref(false)
  const route = useRoute()
  
  const mostrarHeader = computed(() => {
    return route.path !== '/saioa-hasi'
  })
</script>