<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Gestión de ikasleak</h2>
    </div>

    <Tabla
      :filas="ikasleak"
      @editar-servicio="editar"
      @borrar-servicio="borrar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Tabla from '../components/tabla.vue'
import Api from '../composables/Api.js'

const ikasleak = ref([])

onMounted(async () => {
  ikasleak.value = await Api.cargarObjetos("students")
  console.log("Servicios cargados:", ikasleak.value) // <--- para debug
})


const editar = (id, ) => {
  console.log("Editar", id)
}

const borrar = (id) => {
  console.log("Borrar", id)
}
</script>
