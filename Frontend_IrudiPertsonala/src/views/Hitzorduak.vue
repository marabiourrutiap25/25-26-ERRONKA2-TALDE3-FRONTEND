<template>
  <SidebarMenu titulo="Hitzorduak" v-model="menuAbierto" />
  <div class="container mt-5">
    <!-- Encabezado y botón Crear -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center">
        <label for="week" class="me-2 text-nowrap fw-bold">Aukeratu astea:</label>
        <select class="form-select" v-model="selectedWeek">
          <option v-for="semana in todasLasSemanas" :key="semana.value" :value="semana.value">
            {{ semana.label }}
          </option>
        </select>
      </div>
      <button class="btn btn-primary text-white fw-bold" @click="abrirCrear">+ Hitzordua Sortu</button>
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
      title="Hitzordua sortu / editatu"
      @submit="guardarHitzordua"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { startOfWeek, addDays, format, getWeek } from 'date-fns'
import HitzorduakComponent from '../components/HitzorduakComponent.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import SortuHitzordua from '../components/sortuHitzordua.vue'
import Api from '../composables/Api.js'
import { useToast } from '../composables/UseToast.js'

const menuAbierto = ref(false)
const tableName = 'appointments'
const selectedWeek = ref(getCurrentWeek())
const Egutegia = ref([])
const clients = ref([])
const students = ref([])

// Modalaren erreferentzia
const sortuHitzorduaRef = ref(null)
const { ok, err } = useToast()

// Goiburuak (gakoak soilik)
const headers = ['seat', 'date', 'start_time', 'end_time','comments']

// ---------- ASTERA FUNTZIOAK ----------
function getCurrentWeek() {
  const now = new Date()
  const weekNumber = getWeek(now, { weekStartsOn: 1 })
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2,'0')}`
}

// Unean dauden urteko asteak guztiak sortzen ditu
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

// ---------- HITZORDUEN FILTRATZEA ----------
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

// ---------- DATUEN KARGA ----------
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

// ---------- MODALAK ----------
const abrirCrear = () => {
  sortuHitzorduaRef.value?.setFormData({})
  sortuHitzorduaRef.value?.open()
}

const editarHitzordua = (data) => {
  sortuHitzorduaRef.value?.setFormData(data)
  sortuHitzorduaRef.value?.open()
}

// ---------- HITZORDUAK GORDE ----------
const guardarHitzordua = async (data) => {
  try {
    console.log("Api.js-era heltzen den kargua:", data) // Hemen bidaltzen denaren frogak ikusi ditzakegu

    const payload = JSON.parse(JSON.stringify(data))
    let result
    if (data.id) {
      result = await Api.aldatuObjeto(payload, tableName)
    } else {
      result = await Api.crearObjektua(payload, tableName)
    }
    await cargarDatos()
    const mensaje = result?.message || (data.id ? 'Hitzordua eguneratu egin da' : 'Hitzordua sortu egin da')
    ok(mensaje)
  } catch(e) {
    console.error('Error guardando Hitzordua:', e)
    err(e.message || 'Errore bat gertatu da hitzordua gordetzean')
  }
}


// ---------- HITZORDUAK EZABATU ----------
const borrarHitzordua = async (id) => {
  try { 
    const result = await Api.ezabatuObjektua({id}, tableName)
    await cargarDatos()
    const mensaje = result?.message || 'Hitzordua ezabatu egin da'
    ok(mensaje)
  } catch(e){
    console.error(e)
    err(e.message || 'Errore bat gertatu da hitzordua ezabatzean')
  }
}

onMounted(cargarDatos)
</script>
