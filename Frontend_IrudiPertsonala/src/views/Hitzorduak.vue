<template>
  <div class="container mt-4">
    <!-- Encabezado y botón Crear -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="mb-0">Kudeaketa - Hitzorduak</h2>
      <button class="btn btn-success" @click="abrirCrear">Crear Hitzordua</button>
    </div>

    <!-- Selector de semana -->
    <div class="mb-3 row align-items-center">
      <label for="week" class="col-auto col-form-label">Aukeratu astea:</label>
      <div class="col-auto">
        <select class="form-select" v-model="selectedWeek">
          <option v-for="semana in todasLasSemanas" :key="semana.value" :value="semana.value">
            {{ semana.label }}
          </option>
        </select>
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
    <SortuHitzordua
      ref="sortuHitzorduaRef"
      :headers="headers"
      :clients="clients"
      :students="students"
      title="Crear / Editar Hitzordua"
      @submit="guardarHitzordua"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { startOfWeek, addDays, format, getWeek } from 'date-fns'
import HitzorduakComponent from '../components/HitzorduakComponent.vue'
import SortuHitzordua from '../components/sortuHitzordua.vue'
import Api from '../composables/Api.js'

const tableName = 'appointments'
const selectedWeek = ref(getCurrentWeek())
const Egutegia = ref([])
const clients = ref([])
const students = ref([])

// Referencia al modal
const sortuHitzorduaRef = ref(null)

// Headers (solo keys)
const headers = ['seat', 'date', 'start_time', 'end_time','comments']

// ---------- FUNCIONES DE SEMANA ----------
function getCurrentWeek() {
  const now = new Date()
  const weekNumber = getWeek(now, { weekStartsOn: 1 })
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2,'0')}`
}

// Genera todas las semanas del año actual
const todasLasSemanas = computed(() => {
  const semanas = []
  const now = new Date()
  const year = now.getFullYear()
  const firstDay = startOfWeek(new Date(year, 0, 1), { weekStartsOn: 1 })
  for (let i = 0; i < 52; i++) {
    const start = addDays(firstDay, i * 7)
    const weekNum = getWeek(start, { weekStartsOn: 1 })
    const value = `${year}-W${String(weekNum).padStart(2,'0')}`
    const label = `Astea ${weekNum} (${format(start,'dd/MM')})`
    semanas.push({ value, label })
  }
  return semanas
})

// ---------- FILTRADO DE CITAS ----------
const egutegiaFiltrada = computed(() => {
  if (!Egutegia.value?.length || !selectedWeek.value) return []

  const [year, week] = selectedWeek.value.split('-W').map(Number)
  const firstDay = startOfWeek(new Date(year,0,1 + (week-1)*7), {weekStartsOn:1})
  const lastDay = new Date(firstDay)
  lastDay.setDate(firstDay.getDate()+6)

  return Egutegia.value.filter(item => {
    if (!item.date) return false
    const fecha = new Date(item.date)
    return fecha >= firstDay && fecha <= lastDay
  })
})

// ---------- CARGA DE DATOS ----------
const cargarDatos = async () => {
  try { 
    Egutegia.value = await Api.cargarObjetos(tableName) 
  } catch (e) { 
    console.error(e); 
    Egutegia.value = [] 
  }

  try {
    clients.value = await Api.cargarObjetos('clients')
  } catch (e) {
    console.error(e)
    clients.value = []
  }

  try {
    students.value = await Api.cargarObjetos('students')
  } catch (e) {
    console.error(e)
    students.value = []
  }
}

// ---------- MODALES ----------
const abrirCrear = () => {
  sortuHitzorduaRef.value?.setFormData({})
  sortuHitzorduaRef.value?.open()
}

const editarHitzordua = (data) => {
  sortuHitzorduaRef.value?.setFormData(data)
  sortuHitzorduaRef.value?.open()
}

// ---------- GUARDAR CITAS ----------
const guardarHitzordua = async (data) => {
  try {
    console.log("Payload que llega a Api.js:", data) // 🔹 Aquí vemos lo que se envía

    const payload = JSON.parse(JSON.stringify(data))
    if (data.id) {
      await Api.aldatuObjeto(payload, tableName)
    } else {
      await Api.crearObjektua(payload, tableName)
    }
    await cargarDatos()
  } catch(e) {
    console.error('Error guardando Hitzordua:', e)
  }
}


// ---------- BORRAR CITAS ----------
const borrarHitzordua = async (id) => {
  try { 
    await Api.ezabatuObjektua({id}, tableName)
    await cargarDatos() 
  } catch(e){
    console.error(e)
  }
}

onMounted(cargarDatos)
</script>
