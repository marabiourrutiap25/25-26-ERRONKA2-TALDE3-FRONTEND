<template>
  <SidebarMenu v-model="menuAbierto" />
  <div class="container my-4">
    <ToastContainer />

    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Mugimenduak</h2>
    </div>

    <TaulaComponent
      :filas="Consumables"
      titulo="Kontsumible - Ikasle"
      etiqueta-tabla="Consumable"
      texto-btn-crear="Kontsumiblea sortu"
      :mapa-headers="{ student_name: 'IKASLEA', item_name: 'KONTSUMIBLEA' }"
      :columnas-excluidas="['id', 'student_id', 'consumable_id', 'created_at', 'updated_at', 'deleted_at']"
      @crear="abrirCrear('consumable')"
      @editar="(fila) => prepararEdicion(fila, 'consumable')"
      @borrar="(id) => borrar(id, 'consumable')"
    />

    <TaulaComponent
      :filas="Equipments"
      titulo="Ekipamentu - Ikasle"
      etiqueta-tabla="Equipment"
      texto-btn-crear="Ekipamentua sortu"
      :mapa-headers="{ student_name: 'IKASLEA', item_name: 'EKIPAMENTUA' }"
      :columnas-excluidas="['id', 'student_id', 'equipment_id', 'created_at', 'updated_at', 'deleted_at']"
      @crear="abrirCrear('equipment')"
      @editar="(fila) => prepararEdicion(fila, 'equipment')"
      @borrar="(id) => borrar(id, 'equipment')"
    />

    <dialog ref="modalRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            {{ modoEdicion ? 'Editar' : 'Crear' }} {{ tipoActual === 'consumable' ? 'Consumable' : 'Equipment' }}
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardar">

            <div class="mb-4">
              <label class="custom-label">IKASLEA</label>
              <select v-model="form.student_id" class="form-control custom-input" required>
                <option value="" disabled>Selecciona un alumno</option>
                <option v-for="a in alumnosLista" :key="a.id" :value="a.id">
                  {{ a.name }} {{ a.surnames }}
                </option>
              </select>
            </div>

            <div class="mb-4">
              <label class="custom-label">{{ tipoActual === 'consumable' ? 'KONTSUMIBLEA' : 'EKIPAMENTUA' }}</label>
              <select v-if="tipoActual === 'consumable'" v-model="form.consumable_id" class="form-control custom-input" required>
                <option value="" disabled>Selecciona un consumible</option>
                <option v-for="c in listaMaestraConsumables" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <select v-else v-model="form.equipment_id" class="form-control custom-input" required>
                <option value="" disabled>Selecciona un equipo</option>
                <option v-for="e in listaMaestraEquipments" :key="e.id" :value="e.id">
                  {{ e.name }} ({{ e.label }})
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
                  :placeholder="'Introduce ' + key"
                />
              </div>
            </div>

            <div class="d-flex justify-content-end gap-3 pt-3">
              <button type="button" class="btn btn-cancel px-4" @click="cerrarModal">Cancelar</button>
              <button type="submit" class="btn btn-save px-4">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Api from '../composables/Api.js'
import { useToast } from '../composables/UseToast.js'
import SidebarMenu from '@/components/SidebarMenu.vue'
import ToastContainer from '../components/ToastComponent.vue'
import TaulaComponent from '@/components/TaulaComponent.vue'

const { ok, err } = useToast()

const Consumables = ref([])
const Equipments = ref([])
const alumnosLista = ref([])
const listaMaestraConsumables = ref([])
const listaMaestraEquipments = ref([])

const menuAbierto = ref(false)
const modalRef = ref(null)
const modoEdicion = ref(false)
const tipoActual = ref('')
const form = reactive({})

const endpointPivotC = "student-consumables"
const endpointPivotE = "student-equipment"

const esCampoEditable = (key) => {
  const excluidos = [
    'id', 'student_id', 'consumable_id', 'equipment_id',
    'student_name', 'item_name',
    'created_at', 'updated_at', 'deleted_at'
  ]
  return !excluidos.includes(key.toLowerCase())
}

const cargarTodo = async () => {
  try {
    const [resPC, resPE, resS, resMC, resME] = await Promise.all([
      Api.cargarObjetos(endpointPivotC),
      Api.cargarObjetos(endpointPivotE),
      Api.cargarObjetos("students"),
      Api.cargarObjetos("consumables"),
      Api.cargarObjetos("equipment")
    ])

    alumnosLista.value = resS?.data || resS || []
    listaMaestraConsumables.value = resMC?.data || resMC || []
    listaMaestraEquipments.value = resME?.data || resME || []

    const mapData = (list, masterList, idKey) =>
      (list?.data || list || []).map(item => {
        const alumno = alumnosLista.value.find(a => a.id === item.student_id)
        const master = masterList.find(m => m.id === item[idKey])
        return {
          ...item,
          student_name: alumno ? `${alumno.name} ${alumno.surnames}` : `ID: ${item.student_id}`,
          item_name: master ? master.name : `ID: ${item[idKey]}`
        }
      })

    Consumables.value = mapData(resPC, listaMaestraConsumables.value, 'consumable_id')
    Equipments.value = mapData(resPE, listaMaestraEquipments.value, 'equipment_id')
  } catch (e) {
    console.error("Error cargando datos:", e)
  }
}

const abrirCrear = (tipo) => {
  tipoActual.value = tipo
  modoEdicion.value = false
  for (let k in form) delete form[k]

  form.student_id = ""
  if (tipo === 'consumable') {
    form.consumable_id = ""
    form.date = ""
    form.quantity = ""
  } else {
    form.equipment_id = ""
    form.start_datetime = ""
    form.end_datetime = ""
  }

  modalRef.value?.showModal()
}

const prepararEdicion = (fila, tipo) => {
  tipoActual.value = tipo
  modoEdicion.value = true
  for (let k in form) delete form[k]
  Object.assign(form, fila)
  modalRef.value?.showModal()
}

const cerrarModal = () => modalRef.value?.close()

const guardar = async () => {
  const label = tipoActual.value === 'consumable' ? 'Consumable' : 'Equipment'
  try {
    const endpoint = tipoActual.value === 'consumable' ? endpointPivotC : endpointPivotE
    const { id, student_name, item_name, created_at, updated_at, deleted_at, ...payload } = form

    let res
    if (modoEdicion.value) res = await Api.aldatuObjeto({ id, ...payload }, endpoint)
    else res = await Api.crearObjektua(payload, endpoint)

    if (res) {
      cerrarModal()
      await cargarTodo()
      ok(res.message || (modoEdicion.value ? `${label} actualizado correctamente` : `${label} creado correctamente`))
    }
  } catch (e) {
    err(e.message || 'Error al guardar')
  }
}

const borrar = async (id, tipo) => {
  if (!confirm('Ziur zaude ezabatu nahi duzulaz?')) return
  const endpoint = tipo === 'consumable' ? endpointPivotC : endpointPivotE
  const label = tipo === 'consumable' ? 'Consumable' : 'Equipment'
  try {
    const res = await Api.ezabatuObjektua({ id }, endpoint)
    if (res) {
      await cargarTodo()
      ok(res.message || `${label} eliminado correctamente`)
    }
  } catch (e) {
    err(e.message || 'Error al eliminar')
  }
}

onMounted(cargarTodo)
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