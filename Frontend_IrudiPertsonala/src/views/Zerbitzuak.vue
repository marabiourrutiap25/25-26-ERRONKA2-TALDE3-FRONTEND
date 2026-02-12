<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Gestión de Zerbitzuak</h2>
    </div>

    <!-- Tabla con acciones crear, editar y borrar -->
    <Tabla
      :filas="Zerbitzua"
      @crear="crear"
      @editar="editar"
      @borrar="borrar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Tabla from '../components/tabla.vue'
import Api from '../composables/Api.js'

const Zerbitzua = ref([])
const tableName = "services" // Nombre de la tabla en la API

// 🔹 Cargar datos iniciales
const cargarDatos = async () => {
  try {
    Zerbitzua.value = await Api.cargarObjetos(tableName)
    console.log("Datos cargados:", Zerbitzua.value)
  } catch (error) {
    console.error("Error cargando datos:", error)
    Zerbitzua.value = []
  }
}

// Cargar datos cuando se ejecute el componente
onMounted(() => {
  cargarDatos()
})

// 🔹 Crear un registro
const crear = async (data) => {
  try {
    console.log("Datos a crear:", data)

    const resultado = await Api.crearObjektua(data,tableName)

    if (resultado) {
      alert("Registro creado correctamente")
      await cargarDatos() // refresca la tabla
    } else {
      alert("Error al crear el registro")
    }
  } catch (error) {
    console.error("Error en crear:", error)
    alert("Error al crear: " + error.message)
  }
}

// 🔹 Editar un registro
const editar = async ({ id, ...data }) => {
  console.log("ID:", id)
  console.log("Datos:", data)
  
  try {
    const datosParaAPI = { id, ...data }
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

// 🔹 Borrar un registro
const borrar = async (id) => {
  try {
    const resultado = await Api.ezabatuObjektua({ id }, tableName)
    
    if (resultado) {
      alert("Registro eliminado correctamente")
      await cargarDatos()
    } else {
      alert("Error al eliminar el registro")
    }
  } catch (error) {
    console.error("Error en borrar:", error)
    alert("Error al eliminar: " + error.message)
  }
}
</script>
