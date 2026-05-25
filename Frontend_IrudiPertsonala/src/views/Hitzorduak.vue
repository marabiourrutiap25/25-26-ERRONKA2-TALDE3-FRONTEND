<template>
  <SidebarMenu titulo="Hitzorduak" v-model="menuAbierto" />
  <div class="container mt-5">
    <ToastComponent />

    <!-- Botón confirmar -->
    <div class="d-flex justify-content-end">
      <button class="btn btn-success text-white mt-4 mb-2 fw-bold" @click="abrirConfirmar">
        Hitzorduak konfirmatu
      </button>
    </div>

    <!-- Encabezado y botón Crear -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center">
        <label for="date-picker" class="me-2 text-nowrap fw-bold">Aukeratu eguna:</label>
        <input 
          id="date-picker" 
          type="date" 
          class="form-select" 
          v-model="selectedDate" 
        />
      </div>
      <button class="btn btn-primary text-white fw-bold" @click="abrirCrear">+ Hitzordua Sortu</button>
    </div>

    <!-- Calendario/Asientos -->
    <HitzorduakComponent 
      :selectedDate="selectedDate" 
      :datos="egutegiaFiltrada" 
      :clients="clients"
      :students="students"
      @editar="editarHitzordua"
      @borrar="borrarHitzordua" 
    />

    <!-- Modal Crear / Editar Hitzordua -->
    <SortuHitzordua ref="sortuHitzorduaRef" :headers="headers" :clients="clients" :students="students"
      title="Hitzordua sortu / editatu" @submit="guardarHitzordua" />

    <!-- Modal Confirmar Hitzordua -->
    <dialog ref="modalConfirmarRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">Hitzordua Konfirmatu</h4>
          <button type="button" class="btn-close-custom" @click="cerrarModalConfirmar">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardarConfirmacion">

            <!-- APPOINTMENT -->
            <div class="mb-4">
              <label class="custom-label">HITZORDUA</label>
              <select v-model="formConfirmar.appointment_id" class="form-control custom-input" required>
                <option value="" disabled>Hitzordu bat hautatu</option>
                <option v-for="a in Egutegia" :key="a.id" :value="a.id">
                  {{ getClientName(a.client_id) }} - {{ a.date }}
                </option>
              </select>
            </div>

            <!-- SERVICE -->
            <div class="mb-4">
              <label class="custom-label">ZERBITZUA</label>
              <select v-model="formConfirmar.service_id" class="form-control custom-input" required>
                <option value="" disabled>Zerbitzu bat hautatu</option>
                <option v-for="s in services" :key="s.id" :value="s.id">
                  {{ s.name }}
                </option>
              </select>
            </div>

            <!-- COMMENTS -->
            <div class="mb-4">
              <label class="custom-label">IRUZKINAK</label>
              <textarea v-model="formConfirmar.comments" class="form-control custom-input"
                placeholder="Idatzi iruzkin bat..."></textarea>
            </div>

            <div class="d-flex justify-content-end gap-3 pt-3">
              <button type="button" class="btn btn-cancel px-4" @click="cerrarModalConfirmar">Kantzelatu</button>
              <button type="submit" class="btn btn-save px-4">Konfirmatu</button>
            </div>

          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import HitzorduakComponent from '../components/HitzorduakComponent.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import SortuHitzordua from '../components/sortuHitzordua.vue'
import Api from '../composables/Api.js'
import { useToast } from '../composables/UseToast.js'
import ToastComponent from '../components/ToastComponent.vue'

const menuAbierto = ref(false)
const tableName = 'appointments'

const selectedDate = ref('2026-05-25') 
const Egutegia = ref([])
const clients = ref([])
const students = ref([])
const services = ref([])

const { ok, err } = useToast()

const sortuHitzorduaRef = ref(null)
const headers = ['seat', 'date', 'start_time', 'end_time', 'comments']

const modalConfirmarRef = ref(null)
const formConfirmar = reactive({
  appointment_id: '',
  service_id: '',
  comments: ''
})

const egutegiaFiltrada = computed(() => {
  if (!Egutegia.value?.length || !selectedDate.value) return []
  return Egutegia.value.filter(item => item.date === selectedDate.value)
})

const cargarDatos = async () => {
  clients.value = [
    { id: 10, name: 'Mikel', surnames: 'Agirre Bilbao' },
    { id: 11, name: 'Ane', surnames: 'Gomez Urkijo' }
  ]

  students.value = [
    { id: 5, name: 'Jon', surnames: 'Lertxundi' },
    { id: 6, name: 'Elene', surnames: 'Zubiri' }
  ]

  Egutegia.value = [
    {
      id: 999,
      seat: 2, 
      date: '2026-05-25',
      start_time: '09:00:00',
      end_time: '11:00:00',
      client_id: 10,
      student_id: 5,
      comments: 'Corte de pelo moderno y degradado suave, barba también.'
    },
    {
      id: 998,
      seat: 5, 
      date: '2026-05-25',
      start_time: '12:00:00',
      end_time: '13:30:00',
      client_id: 11,
      student_id: 6,
      comments: 'Tinte completo y lavado.'
    }
  ]

  try {
    services.value = await Api.cargarObjetos('services')
  } catch (e) {
    console.error(e)
    services.value = []
  }
}

const abrirCrear = () => {
  sortuHitzorduaRef.value?.setFormData({})
  sortuHitzorduaRef.value?.open()
}

const editarHitzordua = (data) => {
  sortuHitzorduaRef.value?.setFormData(data)
  sortuHitzorduaRef.value?.open()
}

const getClientName = (client_id) => {
  const client = clients.value.find(c => c.id === client_id)
  return client ? `${client.name} ${client.surnames}` : `ID: ${client_id}`
}

const guardarHitzordua = async (data) => {
  try {
    const payload = JSON.parse(JSON.stringify(data))
    let result
    if (data.id) {
      result = await Api.aldatuObjeto(payload, tableName)
    } else {
      result = await Api.crearObjektua(payload, tableName)
    }
    await cargarDatos()
    ok(result?.message || (data.id ? 'Hitzordua eguneratu egin da' : 'Hitzordua sortu egin da'))
  } catch (e) {
    console.error('Error guardando Hitzordua:', e)
    err(e.message || 'Errore bat gertatu da hitzordua gordetzean')
  }
}

const borrarHitzordua = async (id) => {
  if (!confirm('Ziur zaude ezabatu nahi duzulaz?')) return
  try {
    const result = await Api.ezabatuObjektua({ id }, tableName)
    await cargarDatos()
    ok(result?.message || 'Hitzordua ezabatu egin da')
  } catch (e) {
    console.error(e)
    err(e.message || 'Errore bat gertatu da hitzordua ezabatzean')
  }
}

const abrirConfirmar = () => {
  formConfirmar.appointment_id = ''
  formConfirmar.service_id = ''
  formConfirmar.comments = ''
  modalConfirmarRef.value?.showModal()
}

const cerrarModalConfirmar = () => {
  modalConfirmarRef.value?.close()
}

const guardarConfirmacion = async () => {
  try {
    const payload = {
      appointment_id: formConfirmar.appointment_id,
      service_id: formConfirmar.service_id,
      comments: formConfirmar.comments
    }
    const res = await Api.crearObjektua(payload, 'appointment-services')
    if (res) {
      cerrarModalConfirmar()
      ok(res.message || 'Hitzordua konfirmatu da')
    }
  } catch (e) {
    console.error(e)
    err(e.message || 'Errorea hitzordua konfirmatzean')
  }
}

onMounted(cargarDatos)
</script>