<template>
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Mugimenduak</h2>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-5 mb-3">
      <h3 class="mb-0">Kontsumible - Ikasle</h3>
      <button class="btn btn-success" @click="abrirCrear('consumable')">Crear Consumable</button>
    </div>
    <div v-if="Consumables.length" class="table-responsive mb-5">
      <table class="table table-hover border rounded mb-0">
        <tbody class="bg-light">
          <tr><td colspan="100%"><span class="fw-bold">Consumable</span></td></tr>
        </tbody>
        <thead class="table-light">
          <tr>
            <th v-for="header in getHeadersVisibles(Consumables)" :key="header">
              {{ formatHeader(header) }}
            </th>
            <th class="text-end">Akzioak</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="(fila, index) in Consumables" :key="index">
            <td v-for="header in getHeadersVisibles(Consumables)" :key="header" class="align-middle">
              {{ truncar(fila[header]) }}
            </td>
            <td class="text-end">
              <button class="btn p-0 me-2" @click="prepararEdicion(fila, 'consumable')">
                <img src="@/assets/editatu.png" alt="Editar" style="max-width: 24px;" />
              </button>
              <button class="btn p-0 me-2" @click="borrar(fila.id, 'consumable')">
                <img src="@/assets/ezabatu.png" alt="Borrar" style="max-width: 24px;" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-5 mb-3">
      <h3 class="mb-0">Ekipamentu - Ikasle</h3>
      <button class="btn btn-success" @click="abrirCrear('equipment')">Crear Equipment</button>
    </div>
    <div v-if="Equipments.length" class="table-responsive">
      <table class="table table-hover border rounded mb-0">
        <tbody class="bg-light">
          <tr><td colspan="100%"><span class="fw-bold">Equipment</span></td></tr>
        </tbody>
        <thead class="table-light">
          <tr>
            <th v-for="header in getHeadersVisibles(Equipments)" :key="header">
              {{ formatHeader(header) }}
            </th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="(fila, index) in Equipments" :key="index">
            <td v-for="header in getHeadersVisibles(Equipments)" :key="header" class="align-middle">
              {{ truncar(fila[header]) }}
            </td>
            <td class="text-end">
              <button class="btn p-0 me-2" @click="prepararEdicion(fila, 'equipment')">
                <img src="@/assets/editatu.png" alt="Editar" style="max-width: 24px;" />
              </button>
              <button class="btn p-0 me-2" @click="borrar(fila.id, 'equipment')">
                <img src="@/assets/ezabatu.png" alt="Borrar" style="max-width: 24px;" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
              <select v-if="tipoActual === 'consumable'" v-model="form.consumable_id" class="form-control custom-input" required>
                <option value="" disabled>Selecciona un consumible</option>
                <option v-for="c in listaMaestraConsumables" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <select v-else v-model="form.equipment_id" class="form-control custom-input" required>
                <option value="" disabled>Selecciona un equipo</option>
                <option v-for="e in listaMaestraEquipments" :key="e.id" :value="e.id">{{ e.name }} ({{ e.label }})</option>
              </select>
            </div>

            <div v-for="key in Object.keys(form)" :key="key">
              <div v-if="esCampoEditable(key)" class="mb-4">
                <label :for="key" class="custom-label">{{ key.toUpperCase().replace('_', ' ') }}</label>
                <input :id="key" v-model="form[key]" type="text" class="form-control custom-input" :placeholder="'Introduce ' + key" />
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

const getHeadersVisibles = (lista) => {
  if (!lista.length) return []
  const excluidos = ['id', 'student_id', 'consumable_id', 'equipment_id', 'created_at', 'updated_at', 'deleted_at']
  return Object.keys(lista[0]).filter(h => !excluidos.includes(h.toLowerCase()))
}

const formatHeader = (h) => {
  if (h === 'student_name') return 'IKASLEA'
  if (h === 'item_name') return 'PRODUKTUA'
  return h.toUpperCase().replace('_', ' ')
}

const truncar = (t, l = 20) => t ? (t.toString().length > l ? t.toString().slice(0, l) + '…' : t) : ''

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
      return { ...item, student_name: a ? `${a.name} ${a.surnames}` : `ID: ${item.student_id}`, item_name: m ? m.name : `ID: ${item[idKey]}` }
    })
    Consumables.value = mapData(resPC, listaMaestraConsumables.value, 'consumable_id')
    Equipments.value = mapData(resPE, listaMaestraEquipments.value, 'equipment_id')
  } catch (e) { console.error(e) }
}

const abrirCrear = (tipo) => {
  tipoActual.value = tipo
  modoEdicion.value = false
  
  // 1. Limpiar el formulario
  for (let k in form) delete form[k]
  
  // 2. Inicializar IDs vacíos
  form.student_id = ""
  if (tipo === 'consumable') form.consumable_id = ""
  else form.equipment_id = ""

  // 3. RECUPERAR CAMPOS DINÁMICOS: Buscamos un ejemplo en la lista de datos actual
  const listaReferencia = tipo === 'consumable' ? Consumables.value : Equipments.value
  if (listaReferencia.length > 0) {
    const ejemplo = listaReferencia[0]
    Object.keys(ejemplo).forEach(key => {
      if (esCampoEditable(key)) {
        form[key] = "" // Preparamos el campo para que el v-for lo detecte
      }
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
  try {
    const endpoint = tipoActual.value === 'consumable' ? endpointPivotC : endpointPivotE
    const { student_name, item_name, created_at, updated_at, deleted_at, id, ...payload } = form
    
    let res
    if (modoEdicion.value) res = await Api.aldatuObjeto({ id, ...payload }, endpoint)
    else res = await Api.crearObjektua(payload, endpoint)

    if (res) {
      cerrarModal()
      await cargarTodo()
    }
  } catch (e) { alert("Error: " + e.message) }
}

const borrar = async (id, tipo) => {
  if (!confirm('Ziur zaude ezabatu nahi duzulaz?')) return
  const endpoint = tipo === 'consumable' ? endpointPivotC : endpointPivotE
  if (await Api.ezabatuObjektua({ id }, endpoint)) await cargarTodo()
}

onMounted(cargarTodo)
</script>

<style scoped>
.custom-dialog { width: 100%; max-width: 450px; background: white; }
.custom-dialog::backdrop { background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px); }
.custom-label { display: block; font-weight: 600; font-size: 0.85rem; color: #333; margin-bottom: 8px; }
.custom-input { background-color: #f0f0f0; border: none; border-radius: 50px; padding: 12px 20px; font-size: 0.95rem; }
.custom-input:focus { background-color: #f0f0f0; box-shadow: 0 0 0 2px #3b82f6; outline: none; }
.btn-close-custom { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.btn-cancel { background-color: #e9ecef; border-radius: 50px; color: #333; font-weight: 600; border: none; }
.btn-save { background-color: #1d7eda; border-radius: 50px; color: white; font-weight: 500; border: none; }
</style>