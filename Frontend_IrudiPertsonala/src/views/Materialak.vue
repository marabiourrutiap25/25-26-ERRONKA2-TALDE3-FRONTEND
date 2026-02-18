<template>
  <SidebarMenu titulo="Materialak" v-model="menuAbierto" />

  <div class="container">
    <ToastComponent />


    <div class="d-flex justify-content-between justify-content-md-end mt-5 mb-4">
      <div>
        <button class="btn btn-success text-white fw-bold" @click="abrirSacar">Materiala atera</button>
      </div>
    </div>

    <TaulaComponent :filas="Materiala" titulo="Materialak" etiqueta-tabla="Equipment"
      texto-btn-crear="Materiala Sortu" :mapa-headers="{ category_name: 'KATEGORIA' }"
      :columnas-excluidas="['id', 'equipment_category_id', 'created_at', 'updated_at', 'deleted_at']"
      @crear="abrirCrear" @editar="prepararEdicion" @borrar="borrar" />

    <dialog ref="modalSacarRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">Materiala Atera</h4>
          <button type="button" class="btn-close-custom" @click="cerrarModalSacar">✕</button>
        </div>
        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardarSacar">
            <div class="mb-4">
              <label class="custom-label">IKASLEA</label>
              <select v-model="formSacar.student_id" class="form-control custom-input" required>
                <option value="" disabled>Ikasle bat hautatu</option>
                <option v-for="a in listaAlumnos" :key="a.id" :value="a.id">
                  {{ a.name }} {{ a.surnames }}
                </option>
              </select>
            </div>
            <div class="mb-4">
              <label class="custom-label">MATERIALA</label>
              <select v-model="formSacar.equipment_id" class="form-control custom-input" required>
                <option value="" disabled>Materiala hautatu</option>
                <option v-for="e in listaEquipmentsDisponibles" :key="e.id" :value="e.id">
                  {{ e.name }}
                </option>
              </select>
            </div>
            <div class="d-flex justify-content-end gap-3 pt-3">
              <button type="button" class="btn btn-cancel px-4" @click="cerrarModalSacar">Kantzelatu</button>
              <button type="submit" class="btn btn-save px-4">Atera</button>
            </div>
          </form>
        </div>
      </div>
    </dialog>

    <dialog ref="modalRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            Materiala {{ modoEdicion ? 'editatu' : 'sortu' }}
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardar">

            <div class="mb-4">
              <label class="custom-label">KATEGORIA</label>
              <select v-model="form.equipment_category_id" class="form-control custom-input" required>
                <option value="" disabled>Kategoria hautatu</option>
                <option v-for="cat in listaCategorias" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div v-for="key in Object.keys(form)" :key="key">
              <div v-if="esCampoEditable(key)" class="mb-4">
                <label :for="key" class="custom-label">{{ key.toUpperCase().replace(/_/g, ' ') }}</label>
                <input :id="key" v-model="form[key]" type="text" class="form-control custom-input"
                  :placeholder="'Sartu ' + key" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import Api from '../composables/Api.js'
import { useToast } from '../composables/UseToast.js'
import ToastComponent from '../components/ToastComponent.vue'
import TaulaComponent from '@/components/TaulaComponent.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'

const { ok, err } = useToast()

const menuAbierto = ref(false)

const Materiala = ref([])
const listaCategorias = ref([])
const tableName = "equipment"
const listaAlumnos = ref([])
const listaEquipments = ref([])
const modalSacarRef = ref(null)
const formSacar = reactive({ student_id: '', equipment_id: '' })

const modalRef = ref(null)
const modoEdicion = ref(false)
const form = reactive({})

const esCampoEditable = (key) => {
  const excluidos = ['id', 'equipment_category_id', 'category_name', 'created_at', 'updated_at', 'deleted_at']
  return !excluidos.includes(key.toLowerCase())
}

const cargarDatos = async () => {
  try {
    const [resEquipment, resCat, resAlumnos, resEquipmentsList] = await Promise.all([
      Api.cargarObjetos(tableName),
      Api.cargarObjetos("equipment-categories"),
      Api.cargarObjetos("students"),
      Api.cargarObjetos("equipment")
    ])
    listaCategorias.value = resCat?.data || resCat || []
    const equipmentRaw = resEquipment?.data || resEquipment || []
    Materiala.value = equipmentRaw.map(item => {
      const cat = listaCategorias.value.find(c => c.id === item.equipment_category_id)
      return { ...item, category_name: cat ? cat.name : `ID: ${item.equipment_category_id}` }
    })
    listaAlumnos.value = resAlumnos?.data || resAlumnos || []
    listaEquipments.value = resEquipmentsList?.data || resEquipmentsList || []
  } catch (e) {
    console.error("Error cargando datos:", e)
    Materiala.value = []
    listaAlumnos.value = []
    listaEquipments.value = []
  }
}
// Solo materiales que no están actualmente sacados (no hay movimiento abierto)
const listaEquipmentsDisponibles = computed(() => {
  // Aquí deberías consultar los movimientos abiertos para filtrar los que no están disponibles
  // Por simplicidad, se asume que todos están disponibles
  // Si tienes una lista de movimientos, deberías filtrar aquí
  return listaEquipments.value
})

const abrirSacar = () => {
  formSacar.student_id = ''
  formSacar.equipment_id = ''
  modalSacarRef.value?.showModal()
}

const cerrarModalSacar = () => modalSacarRef.value?.close()

const guardarSacar = async () => {
  try {
    // Validar campos
    const student_id = Number(formSacar.student_id)
    const equipment_id = Number(formSacar.equipment_id)
    if (!student_id || !equipment_id) {
      err('Debes seleccionar alumno y material')
      return
    }
    // start_datetime automático (YYYY-MM-DD HH:mm:ss)
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const hh = String(now.getHours()).padStart(2, '0')
    const min = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    const start_datetime = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`
    const payload = {
      student_id,
      equipment_id,
      start_datetime
    }
    // endpoint para movimientos
    const res = await Api.crearObjektua(payload, 'student-equipment')
    if (res) {
      cerrarModalSacar()
      await cargarDatos()
      ok(res.message || 'Materiala aterata')
    }
  } catch (e) {
    err(e.message || 'Errorea materiala ateratzerakoan')
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  for (let k in form) delete form[k]
  if (Materiala.value.length > 0) {
    Object.keys(Materiala.value[0]).forEach(key => { if (esCampoEditable(key)) form[key] = "" })
  }
  form.equipment_category_id = ""
  modalRef.value?.showModal()
}

const prepararEdicion = (fila) => {
  modoEdicion.value = true
  for (let k in form) delete form[k]
  Object.assign(form, fila)
  modalRef.value?.showModal()
}

const cerrarModal = () => modalRef.value?.close()

const guardar = async () => {
  try {
    const { id, category_name, created_at, updated_at, deleted_at, ...payload } = form
    let res
    if (modoEdicion.value) res = await Api.aldatuObjeto({ id, ...payload }, tableName)
    else res = await Api.crearObjektua(payload, tableName)
    if (res) {
      cerrarModal()
      await cargarDatos()
      ok(res.message || (modoEdicion.value ? 'Equipment actualizado correctamente' : 'Equipment creado correctamente'))
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
      ok(res.message || 'Equipment eliminado correctamente')
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