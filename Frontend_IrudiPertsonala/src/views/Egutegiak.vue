<template>
  <SidebarMenu titulo="Egutegiak" v-model="menuAbierto" />

  <div class="container">
    <ToastComponent />
    
    <TaulaComponent
      titulo="Egutegiak"
      :filas="Egutegia"
      :mapa-headers="{ day: 'EGUNA', start_date: 'HASIERA DATA', end_date: 'AMAIERA DATA', start_time: 'HASIERA ORDUA', end_time: 'AMAIERA ORDUA', group_name: 'TALDEA' }"
      :columnas-excluidas="['id', 'group_id', 'created_at', 'updated_at', 'deleted_at']"
      texto-btn-crear="Egutegia Sortu"
      @crear="abrirCrear"
      @editar="prepararEdicion"
      @borrar="borrar"
    />
    
    <dialog ref="modalRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            Egutegia {{ modoEdicion ? 'editatu' : 'sortu' }}
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModal">✕</button>
        </div>
        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardar">
            <div class="mb-4">
              <label class="custom-label">TALDEA</label>
              <select v-model="form.group_id" class="form-control custom-input" required>
                <option value="" disabled>Talde bat hautatu</option>
                <option v-for="g in listaGrupos" :key="g.id" :value="g.id">
                  {{ g.name }}
                </option>
              </select>
            </div>
            
            <div class="mb-4">
              <label class="custom-label">EGUNA</label>
              <select v-model="form.day" class="form-control custom-input" required>
                <option value="" disabled>Eguna hautatu</option>
                <option v-for="(name, idx) in diasEuskera" :key="idx" :value="idx + 1">
                  {{ name }}
                </option>
              </select>
            </div>
            
            <div v-for="key in Object.keys(form)" :key="key">
              <div v-if="esCampoEditable(key)" class="mb-4">
                <label :for="key" class="custom-label">{{ key.toUpperCase().replace(/_/g, ' ') }}</label>
                <input
                  :id="key"
                  v-model="form[key]"
                  type="text"
                  class="form-control custom-input"
                  :placeholder="'Sartu ' + key"
                />
              </div>
            </div>
            
            <div class="d-flex justify-content-end gap-3 pt-3">
              <button type="button" class="btn btn-cancel px-4" @click="cerrarModal">Kantzelatu</button>
              <button type="submit" class="btn btn-save px-4">Aldaketak Gorde</button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import Api from '../composables/Api.js'
import TaulaComponent from '@/components/TaulaComponent.vue'
import ToastComponent from '../components/ToastComponent.vue'
import { useToast } from '../composables/UseToast.js'

const { ok, err } = useToast()

const menuAbierto = ref(false)
const Egutegia = ref([])
const listaGrupos = ref([])
const tableName = "schedules"
const diasEuskera = ['Astelehena', 'Asteazkena', 'Osteguna', 'Ostirala', 'Larunbata', 'Igandea', 'Igandea (repeat)']

const modalRef = ref(null)
const modoEdicion = ref(false)
const form = reactive({})

const esCampoEditable = (key) => {
  const excluidos = ['id', 'group_id', 'group_name', 'day', 'created_at', 'updated_at', 'deleted_at']
  return !excluidos.includes(key.toLowerCase())
}

const cargarDatos = async () => {
  try {
    const [resSchedules, resGroups] = await Promise.all([
      Api.cargarObjetos(tableName),
      Api.cargarObjetos("groups")
    ])
    listaGrupos.value = resGroups?.data || resGroups || []
    const schedulesRaw = resSchedules?.data || resSchedules || []
    Egutegia.value = schedulesRaw.map(item => {
      const g = listaGrupos.value.find(gr => gr.id === item.group_id)
      const dayName = diasEuskera[item.day - 1] || `Eguna ${item.day}`
      return {
        ...item,
        group_name: g ? g.name : `ID: ${item.group_id}`,
        day: dayName
      }
    })
  } catch (e) {
    console.error("Error cargando datos:", e)
    Egutegia.value = []
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  for (let k in form) delete form[k]
  form.group_id = ""
  form.day = ""
  form.start_date = ""
  form.end_date = ""
  form.start_time = ""
  form.end_time = ""
  modalRef.value?.showModal()
}

const prepararEdicion = (fila) => {
  modoEdicion.value = true
  for (let k in form) delete form[k]
  Object.assign(form, fila)
  // Convertir el nombre del día de vuelta a número
  const dayIndex = diasEuskera.indexOf(fila.day)
  form.day = dayIndex >= 0 ? dayIndex + 1 : fila.day
  modalRef.value?.showModal()
}

const cerrarModal = () => modalRef.value?.close()

const guardar = async () => {
  try {
    const { id, group_name, created_at, updated_at, deleted_at, ...payload } = form
    let res
    if (modoEdicion.value) res = await Api.aldatuObjeto({ id, ...payload }, tableName)
    else res = await Api.crearObjektua(payload, tableName)
    if (res) {
      cerrarModal()
      await cargarDatos()
      ok(res.message || (modoEdicion.value ? 'Egutegia actualizado correctamente' : 'Egutegia creado correctamente'))
    }
  } catch (e) {
    err(e.message || 'Error al guardar')
  }
}

const borrar = async (id) => {
  if (!confirm('Ziur zaude ezabatu nahi duzulaz?')) return
  try {
    const res = await Api.ezabatuObjektua({ id }, tableName)
    if (res) {
      await cargarDatos()
      ok(res.message || 'Egutegia eliminado correctamente')
    }
  } catch (e) {
    err(e.message || 'Error al eliminar')
  }
}

onMounted(cargarDatos)
</script>
<style scoped>
.custom-dialog {
  width: 100%;
  max-width: 450px;
  background: white;
}

.custom-dialog::backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.custom-label {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  color: #333;
  margin-bottom: 8px;
}

.custom-input {
  background-color: #f0f0f0;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-size: 0.95rem;
}

.custom-input:focus {
  background-color: #f0f0f0;
  box-shadow: 0 0 0 2px #3b82f6;
  outline: none;
}

.btn-close-custom {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.btn-cancel {
  background-color: #e9ecef;
  border-radius: 50px;
  color: #333;
  font-weight: 600;
  border: none;
}

.btn-save {
  background-color: #1d7eda;
  border-radius: 50px;
  color: white;
  font-weight: 500;
  border: none;
}
</style>