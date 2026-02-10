<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Gestión de Egutegiak</h2>
    </div>

    <Tabla
      :filas="Egutegia"
      @editar="editar"
      @borrar="borrar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Tabla from '../components/tabla.vue'
import Api from '../composables/Api.js'

const Egutegia = ref([])
const tableName = "schedules" // Nombre de la tabla en la API

// Cargar datos iniciales
const cargarDatos = async () => {
  Egutegia.value = await Api.cargarObjetos(tableName)
  console.log("Datos cargados:", Egutegia.value)
}

onMounted(() => {
  cargarDatos()
})

// Editar un registro
const editar = async ({ id, ...data }) => {
  console.log("ID:", id)
  console.log("Datos:", data)
  
  try {
    const datosParaAPI = {
      id,
      ...data
    }
    
    const resultado = await Api.aldatuObjeto(datosParaAPI, tableName)
    
    if (resultado) {
      alert("Registro actualizado correctamente")
      await cargarDatos()
    } else {
      alert("Error al actualizar el registro")
    }
  } catch (error) {
    console.error("Error en editar:", error)
    alert("Error al actualizar: " + error.message)
  }
}

// Borrar un registro
const borrar = async (id) => {
  try {
    const resultado = await Api.ezabatuObjektua({ id: id }, tableName)
    
    if (resultado) {
      alert("Registro eliminado correctamente")
    } else {
      alert("Error al eliminar el registro")
    }
  } catch (error) {
    console.error("Error en borrar:", error)
    alert("Error al eliminar: " + error.message)
  }
}
</script>