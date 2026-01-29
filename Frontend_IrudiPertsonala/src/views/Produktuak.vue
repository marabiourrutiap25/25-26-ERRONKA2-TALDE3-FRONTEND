<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Gestión de produktuak</h2>
    </div>

    <Tabla
      Titulo="Listado de servicios"
      :filas="produktuak"
      @editar-servicio="editar"
      @borrar-servicio="borrar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Tabla from '../components/tabla.vue'
import Api from '../composables/Api.js'

const produktuak = ref([])

onMounted(async () => {
  produktuak.value = await Api.cargarObjetos("consumables")
  console.log("Servicios cargados:", produktuak.value) // <--- para debug
})


const editar = (id) => {
  console.log("Editar", id)
}

const borrar = (id) => {
  console.log("Borrar", id)
}
</script>
