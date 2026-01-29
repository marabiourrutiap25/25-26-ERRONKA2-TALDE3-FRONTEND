<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Gestión de Egutegiak</h2>
    </div>

    <Tabla
      Titulo="Listado de servicios"
      :filas="Egutegia"
      @editar-servicio="editar"
      @borrar-servicio="borrar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Tabla from '../components/tabla.vue'
import Api from '../composables/Api.js'

const Egutegia = ref([])

onMounted(async () => {
  Egutegia.value = await Api.cargarObjetos("schedules")
  console.log("Servicios cargados:", Egutegia.value) // <--- para debug
})


const editar = (id) => {
  console.log("Editar", id)
}

const borrar = (id) => {
  console.log("Borrar", id)
}
</script>
