<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Gestión de materialak</h2>
    </div>

    <Tabla
      Titulo="Listado de servicios"
      :filas="materialak"
      @editar-servicio="editar"
      @borrar-servicio="borrar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Tabla from '../components/tabla.vue'
import Api from '../composables/Api.js'

const materialak = ref([])

onMounted(async () => {
  materialak.value = await Api.cargarObjetos("equipment")
  const tabla = document.querySelector('#miTabla tbody')

  const tr = document.createElement('tr')

  Object.keys(materialak.value[0]).forEach(key => {
    const td = document.createElement('td')
    td.textContent = key   // ← label
    tr.appendChild(td)
  })
tabla.appendChild(tr)
  console.log("Servicios cargados:", materialak.value) // <--- para debug
})


const editar = (id) => {
  console.log("Editar", id)
}

const borrar = (id) => {
  console.log("Borrar", id)
}
</script>
