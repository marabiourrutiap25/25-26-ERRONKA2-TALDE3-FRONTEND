<template>
  <div class="container my-4">
    <ToastContainer />

    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Mugimenduak</h2>
    </div>

    <DataTable :filas="Consumables" titulo="Kontsumible - Ikasle" etiqueta-tabla="Consumable"
      texto-btn-crear="Crear Consumable" @crear="abrirCrear('consumable')"
      @editar="(fila) => prepararEdicion(fila, 'consumable')" @borrar="(id) => borrar(id, 'consumable')" />

    <DataTable :filas="Equipments" titulo="Ekipamentu - Ikasle" etiqueta-tabla="Equipment"
      texto-btn-crear="Crear Equipment" @crear="abrirCrear('equipment')"
      @editar="(fila) => prepararEdicion(fila, 'equipment')" @borrar="(id) => borrar(id, 'equipment')" />

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
              <label class="custom-label">ALUMNO</label>
              <select v-model="form.student_id" class="form-control custom-input" required>
                <option value="" disabled>Selecciona un alumno</option>
                <option v-for="a in alumnosLista" :key="a.id" :value="a.id">{{ a.name }} {{ a.surnames }}</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="custom-label">{{ tipoActual === 'consumable' ? 'CONSUMIBLE' : 'EQUIPMENT' }}</label>
              <select v-if="tipoActual === 'consumable'" v-model="form.consumable_id" class="form-control custom-input"
                required>
                <option value="" disabled>Selecciona un consumible</option>
                <option v-for="c in listaMaestraConsumables" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <select v-else v-model="form.equipment_id" class="form-control custom-input" required>
                <option value="" disabled>Selecciona un equipo</option>
                <option v-for="e in listaMaestraEquipments" :key="e.id" :value="e.id">{{ e.name }} ({{ e.label }})
                </option>
              </select>
            </div>

            <div v-for="key in Object.keys(form)" :key="key">
              <div v-if="esCampoEditable(key)" class="mb-4">
                <label :for="key" class="custom-label">{{ key.toUpperCase().replace('_', ' ') }}</label>
                <input :id="key" v-model="form[key]" type="text" class="form-control custom-input"
                  :placeholder="'Introduce ' + key" />
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
import { useToast } from '../composables/Movida_Necesarria_Use_Toast.js'
import DataTable from '../components/Huevada_De_Tabla.vue'
import ToastContainer from '../components/Container_De_Mierda_Toast.vue'

const { ok, err } = useToast()

const Consumables = ref([])
const Equipments = ref([])
const alumnosLista = ref([])
const listaMaestraConsumables = ref([])
const listaMaestraEquipments = ref([])

const modalRef = ref(null)
const modoEdicion = ref(false)
const tipoActual = ref('')
const form = reactive({})

const endpointPivotC = "student-consumables"
const endpointPivotE = "student-equipment"

// --- HELPERS ---
const esCampoEditable = (key) => {
  const excluidos = ['id', 'student_id', 'consumable_id', 'equipment_id', 'student_name', 'item_name', 'created_at', 'updated_at', 'deleted_at']
  return !excluidos.includes(key.toLowerCase())
}

// --- CARGA ---
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

    const mapData = (list, masterList, idKey) => (list?.data || list || []).map(item => {
      const a = alumnosLista.value.find(al => al.id === item.student_id)
      const m = masterList.find(ml => ml.id === item[idKey])
      return {
        ...item,
        student_name: a ? `${a.name} ${a.surnames}` : `ID: ${item.student_id}`,
        item_name: m ? m.name : `ID: ${item[idKey]}`
      }
    })
    Consumables.value = mapData(resPC, listaMaestraConsumables.value, 'consumable_id')
    Equipments.value = mapData(resPE, listaMaestraEquipments.value, 'equipment_id')
  } catch (e) { console.error(e) }
}

const abrirCrear = (tipo) => {
  tipoActual.value = tipo
  modoEdicion.value = false
  for (let k in form) delete form[k]
  form.student_id = ""
  if (tipo === 'consumable') form.consumable_id = ""
  else form.equipment_id = ""
  const listaReferencia = tipo === 'consumable' ? Consumables.value : Equipments.value
  if (listaReferencia.length > 0) {
    Object.keys(listaReferencia[0]).forEach(key => {
      if (esCampoEditable(key)) form[key] = ""
    })
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
    const { student_name, item_name, created_at, updated_at, deleted_at, id, ...payload } = form

    let res
    if (modoEdicion.value) res = await Api.aldatuObjeto({ id, ...payload }, endpoint)
    else res = await Api.crearObjektua(payload, endpoint)

    if (res) {
      cerrarModal()
      await cargarTodo()
      ok(modoEdicion.value ? `${label} actualizado correctamente` : `${label} creado correctamente`)
    }
  } catch (e) {
    err(`Error al guardar: ${e.message}`)
  }
}

const borrar = async (id, tipo) => {
  if (!confirm('Ziur zaude ezabatu nahi duzulaz?')) return
  const endpoint = tipo === 'consumable' ? endpointPivotC : endpointPivotE
  const label = tipo === 'consumable' ? 'Consumable' : 'Equipment'
  try {
    if (await Api.ezabatuObjektua({ id }, endpoint)) {
      await cargarTodo()
      ok(`${label} eliminado correctamente`)
    }
  } catch (e) {
    err(`Error al eliminar: ${e.message}`)
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