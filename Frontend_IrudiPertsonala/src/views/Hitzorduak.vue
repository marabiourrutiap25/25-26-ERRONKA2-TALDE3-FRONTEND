<template>
  <div class="container mt-4">
    <!-- Encabezado y botón Crear -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="mb-0">Gestión de Hitzorduak</h2>
      <button class="btn btn-success" @click="abrirCrear">Crear Hitzordua</button>
    </div>

    <!-- Selector de semana -->
    <div class="mb-3 row align-items-center">
      <label for="week" class="col-auto col-form-label">Aukeratu astea:</label>
      <div class="col-auto">
        <input type="week" class="form-control" :value="selectedWeek" @change="onWeekChange" id="week"/>
      </div>
    </div>

    <!-- Calendario -->
    <HitzorduakComponent
      :week="selectedWeek"
      :datos="egutegiaFiltrada"
      @editar="editarHitzordua"
      @borrar="borrarHitzordua"
    />

    <!-- Modal Crear / Editar Hitzordua -->
    <Sortu
      ref="crearDialogRef"
      :headers="headers"
      title="Crear / Editar Hitzordua"
      @submit="guardarHitzordua"
    />

    <!-- Modal Editar -->
    <Editatu
      ref="editatuDialogRef"
      :headers="headers"
      title="Editar Hitzordua"
      @submit="guardarHitzordua"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { startOfWeek } from 'date-fns'
import HitzorduakComponent from '../components/HitzorduakComponent.vue'
import Sortu from '../components/sortu.vue'
import Editatu from '../components/editatu.vue'
import Api from '../composables/Api.js'

const tableName = 'appointments'
const selectedWeek = ref(getCurrentWeek())
const Egutegia = ref([])

// Referencias a los modales
const crearDialogRef = ref(null)
const editatuDialogRef = ref(null)

// Headers (solo keys)
const headers = ['seat', 'date', 'start_time', 'end_time']

function getCurrentWeek() {
  const now = new Date()
  const weekNumber = getWeekNumber(now)
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2,'0')}`
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1))
  return Math.ceil((((d - yearStart)/86400000)+1)/7)
}

function onWeekChange(e) {
  selectedWeek.value = e.target.value
}

const egutegiaFiltrada = computed(() => {
  if (!Egutegia.value?.length || !selectedWeek.value) return []

  const parts = selectedWeek.value.split('-W')
  if (parts.length !== 2) return []

  const year = Number(parts[0])
  const week = Number(parts[1])

  const firstDay = startOfWeek(new Date(year,0,1 + (week-1)*7), {weekStartsOn:1})
  const lastDay = new Date(firstDay)
  lastDay.setDate(firstDay.getDate()+6)

  return Egutegia.value.filter(item => {
    if (!item.date) return false
    const fecha = new Date(item.date)
    return fecha >= firstDay && fecha <= lastDay
  })
})

// Cargar citas
const cargarDatos = async () => {
  try { Egutegia.value = await Api.cargarObjetos(tableName) } 
  catch (e) { console.error(e); Egutegia.value = [] }
}

// Abrir modal Crear
const abrirCrear = () => {
  crearDialogRef.value?.setFormData({})
  crearDialogRef.value?.open()
}

// Abrir modal Editar (desde HitzorduakComponent)
const editarHitzordua = (data) => {
  editatuDialogRef.value?.setFormData(data)
  editatuDialogRef.value?.open()
}

// Guardar cita (crear o editar)
const guardarHitzordua = async (data) => {
  try {
    // Convertir a JSON y pasar string con nombre de tabla
    const endpoint = 'appointments' // siempre string
    const payload = JSON.parse(JSON.stringify(data)) // asegura que sea objeto plano
    if (data.id) {
      await Api.aldatuObjeto(payload, endpoint)
    } else {
      await Api.crearObjektua(endpoint, payload)
    }
    await cargarDatos()
  } catch(e) {
    console.error('Error guardando cita:', e)
  }
}

// Borrar cita
const borrarHitzordua = async (id) => {
  try { await Api.ezabatuObjektua({id}, tableName); await cargarDatos() }
  catch(e){console.error(e)}
}

onMounted(cargarDatos)
</script>
