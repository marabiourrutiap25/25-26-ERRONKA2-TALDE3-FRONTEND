<template>
  <SidebarMenu :titulo="'Mugimenduak'" v-model="menuAbierto" />
  <div class="d-flex justify-content-center mb-4 my-5">
    <div class="btn-group" role="group">
      <button type="button" class="btn" :class="tablaActiva === 'consumables' ? 'btn-primary' : 'btn-outline-primary'"
        @click="tablaActiva = 'consumables'">
        Produktuak
      </button>

      <button type="button" class="btn" :class="tablaActiva === 'equipments' ? 'btn-primary' : 'btn-outline-primary'"
        @click="tablaActiva = 'equipments'">
        Materialak
      </button>
    </div>
  </div>


  <Taula v-if="tablaActiva === 'consumables'" :filas="Consumables" :titulo="'Produktua'" @crear="abrirCrear"
    @editar="prepararEdicion" @borrar="borrar" />

  <Taula v-if="tablaActiva === 'equipments'" :filas="Equipments" :titulo="'Materiala'" @crear="abrirCrear"
    @editar="prepararEdicion" @borrar="borrar" />

</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Api from '../composables/Api.js'
import SidebarMenu from '@/components/SidebarMenu.vue'
import Taula from '@/components/Taula.vue'

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

const tablaActiva = ref('consumables')

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

const menuAbierto = ref(false)
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