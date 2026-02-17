<template>
  <div class="container">
    <ToastComponent />

    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Kudeaketa - Txandak</h2>
    </div>

    <TaulaComponent :filas="Txandak" titulo="Txandak" etiqueta-tabla="Txandak"
      texto-btn-crear="Txanda sortu" :mapa-headers="{ student_name: 'IKASLEA' }"
      :columnas-excluidas="['id', 'student_id', 'created_at', 'updated_at', 'deleted_at']"
      @crear="abrirCrear" @editar="prepararEdicion" @borrar="borrar" />

    <dialog ref="modalRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            {{ modoEdicion ? 'Editar' : 'Crear' }} Txanda
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardar">

            <div class="mb-4">
              <label class="custom-label">IKASLEA</label>
              <select v-model="form.student_id" class="form-control custom-input" required>
                <option value="" disabled>Selecciona un alumno</option>
                <option v-for="alumno in alumnosLista" :key="alumno.id" :value="alumno.id">
                  {{ alumno.name }} {{ alumno.surnames }}
                </option>
              </select>
            </div>

            <div v-for="key in Object.keys(form)" :key="key">
              <div v-if="esCampoEditable(key)" class="mb-4">
                <label :for="key" class="custom-label">{{ key.toUpperCase().replace(/_/g, ' ') }}</label>
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
import { useToast } from '../composables/UseToast.js'
import ToastComponent from '../components/ToastComponent.vue'
import TaulaComponent from '@/components/TaulaComponent.vue'

const { ok, err } = useToast()

const Txandak = ref([])
const alumnosLista = ref([])
const tableName = "shifts"

const modalRef = ref(null)
const modoEdicion = ref(false)
const form = reactive({})

const esCampoEditable = (key) => {
  const excluidos = ['id', 'student_id', 'student_name', 'created_at', 'updated_at', 'deleted_at']
  return !excluidos.includes(key.toLowerCase())
}

const cargarDatos = async () => {
  try {
    const [resShifts, resStudents] = await Promise.all([
      Api.cargarObjetos(tableName),
      Api.cargarObjetos("students")
    ])
    alumnosLista.value = resStudents?.data || resStudents || []
    const listaRaw = resShifts?.data || resShifts || []
    Txandak.value = listaRaw.map(turno => {
      const alumno = alumnosLista.value.find(a => a.id === turno.student_id)
      return { ...turno, student_name: alumno ? `${alumno.name} ${alumno.surnames}` : `ID: ${turno.student_id}` }
    })
  } catch (e) {
    console.error("Error cargando datos:", e)
    Txandak.value = []
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  for (let k in form) delete form[k]
  if (Txandak.value.length > 0) {
    Object.keys(Txandak.value[0]).forEach(key => { if (esCampoEditable(key)) form[key] = "" })
  }
  form.student_id = ""
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
    const { id, student_name, created_at, updated_at, deleted_at, ...payload } = form
    let res
    if (modoEdicion.value) res = await Api.aldatuObjeto({ id, ...payload }, tableName)
    else res = await Api.crearObjektua(payload, tableName)
    if (res) {
      cerrarModal()
      await cargarDatos()
      ok(res.message || (modoEdicion.value ? 'Txanda actualizada correctamente' : 'Txanda creada correctamente'))
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
      ok(res.message || 'Txanda eliminada correctamente')
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