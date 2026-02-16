<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Mugimenduak</h2>
    </div>

    <!-- 🔹 Tabla StudentConsumable -->
    <h3 class="mt-4">Kontsumible - Ikasle</h3>
    <Tabla
      :filas="Consumables"
      Titulo="Consumable"
      @crear="crearConsumable"
      @editar="editarConsumable"
      @borrar="borrarConsumable"
    />

    <!-- 🔹 Tabla StudentEquipment -->
    <h3 class="mt-5">Ekipamentu - Ikasle</h3>
    <Tabla
      :filas="Equipments"
      Titulo="Equipment"
      @crear="crearEquipment"
      @editar="editarEquipment"
      @borrar="borrarEquipment"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Tabla from '../components/tabla.vue'
import Api from '../composables/Api.js'

// 🔹 Datos para las tablas
const Consumables = ref([])
const Equipments = ref([])

const tableConsumable = "student-consumables" // endpoint API
const tableEquipment = "student-equipment"   // endpoint API

// =======================
// 🔹 CARGAR DATOS
// =======================
const cargarDatosConsumables = async () => {
  try {
    Consumables.value = await Api.cargarObjetos(tableConsumable)
    console.log("Consumables cargados:", Consumables.value)
  } catch (error) {
    console.error("Error cargando consumables:", error)
    Consumables.value = []
  }
}

const cargarDatosEquipments = async () => {
  try {
    Equipments.value = await Api.cargarObjetos(tableEquipment)
    console.log("Equipments cargados:", Equipments.value)
  } catch (error) {
    console.error("Error cargando equipments:", error)
    Equipments.value = []
  }
}

onMounted(() => {
  cargarDatosConsumables()
  cargarDatosEquipments()
})

// =======================
// 🔹 CRUD StudentConsumable
// =======================
const crearConsumable = async (data) => {
  try {
    console.log("Crear Consumable:", data)
    const resultado = await Api.crearObjektua(data, tableConsumable)
    if (resultado) {
      alert("Consumable creado correctamente")
      await cargarDatosConsumables()
    } else alert("Error al crear consumable")
  } catch (error) {
    console.error(error)
    alert("Error al crear consumable: " + error.message)
  }
}

const editarConsumable = async ({ id, ...data }) => {
  try {
    console.log("Editar Consumable ID:", id, data)
    const resultado = await Api.aldatuObjeto({ id, ...data }, tableConsumable)
    if (resultado) {
      alert("Consumable actualizado correctamente")
      await cargarDatosConsumables()
    } else alert("Error al actualizar consumable")
  } catch (error) {
    console.error(error)
    alert("Error al actualizar consumable: " + error.message)
  }
}

const borrarConsumable = async (id) => {
  try {
    const resultado = await Api.ezabatuObjektua({ id }, tableConsumable)
    if (resultado) {
      alert("Consumable eliminado correctamente")
      await cargarDatosConsumables()
    } else alert("Error al eliminar consumable")
  } catch (error) {
    console.error(error)
    alert("Error al eliminar consumable: " + error.message)
  }
}

// =======================
// 🔹 CRUD StudentEquipment
// =======================
const crearEquipment = async (data) => {
  try {
    console.log("Crear Equipment:", data)
    const resultado = await Api.crearObjektua(data, tableEquipment)
    if (resultado) {
      alert("Equipment creado correctamente")
      await cargarDatosEquipments()
    } else alert("Error al crear equipment")
  } catch (error) {
    console.error(error)
    alert("Error al crear equipment: " + error.message)
  }
}

const editarEquipment = async ({ id, ...data }) => {
  try {
    console.log("Editar Equipment ID:", id, data)
    const resultado = await Api.aldatuObjeto({ id, ...data }, tableEquipment)
    if (resultado) {
      alert("Equipment actualizado correctamente")
      await cargarDatosEquipments()
    } else alert("Error al actualizar equipment")
  } catch (error) {
    console.error(error)
    alert("Error al actualizar equipment: " + error.message)
  }
}

const borrarEquipment = async (id) => {
  try {
    const resultado = await Api.ezabatuObjektua({ id }, tableEquipment)
    if (resultado) {
      alert("Equipment eliminado correctamente")
      await cargarDatosEquipments()
    } else alert("Error al eliminar equipment")
  } catch (error) {
    console.error(error)
    alert("Error al eliminar equipment: " + error.message)
  }
}
</script>
