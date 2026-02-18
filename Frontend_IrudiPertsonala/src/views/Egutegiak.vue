<template>
  <SidebarMenu titulo="Egutegiak" v-model="menuAbierto" />

  <div class="container">
    <!-- Tabla con acciones crear, editar y borrar -->
    <TaulaComponent
      titulo="Egutegiak"
      :filas="Egutegia"
      texto-btn-crear="Egutegia Sortu"
      @crear="crear"
      @editar="editar"
      @borrar="borrar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import Api from '../composables/Api.js'
import TaulaComponent from '@/components/TaulaComponent.vue'
const menuAbierto = ref(false)
const Egutegia = ref([])
const tableName = "schedules" // APIan taularen izena

// Hasierako datuak kargatu
const cargarDatos = async () => {
  try {
    Egutegia.value = await Api.cargarObjetos(tableName)
    console.log("Datos cargados:", Egutegia.value)
  } catch (error) {
    console.error("Error cargando datos:", error)
    Egutegia.value = []
  }
}

// Datuak kargatu komponente biltzen denean
onMounted(() => {
  cargarDatos()
})

// Erregistro bat sortu
const crear = async (data) => {
  try {
    console.log("Datos a crear:", data)

    const resultado = await Api.crearObjektua(data,tableName)

    if (resultado) {
      alert("Registro creado correctamente")
      await cargarDatos() // Taula berritu
    } else {
      alert("Error al crear el registro")
    }
  } catch (error) {
    console.error("Error en crear:", error)
    alert("Error al crear: " + error.message)
  }
}

// Erregistro bat editatu
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

// Erregistro bat ezabatu
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
