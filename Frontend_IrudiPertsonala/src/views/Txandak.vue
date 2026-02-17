<template>
  <SidebarMenu v-model="menuAbierto" />
  <div class="container my-4">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Kudeaketa - Txandak</h2>
      <button class="btn btn-success" @click="abrirCrear">
        Crear Txanda
      </button>
    </div>

    <div v-if="Txandak.length" class="table-responsive">
      <table class="table table-hover border rounded mb-0">
        <tbody class="bg-light">
          <tr>
            <td colspan="100%">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">Txanda</span>
              </div>
            </td>
          </tr>
        </tbody>
        <thead class="table-light">
          <tr>
            <th v-for="header in headersVisibles" :key="header">
              {{ header === 'student_name' ? 'IKASLEA' : header.toUpperCase() }}
            </th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="(fila, index) in Txandak" :key="index">
            <td v-for="header in headersVisibles" :key="header"
              style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
              :title="fila[header]">
              {{ truncar(fila[header]) }}
            </td>
            <td>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn p-0 me-2" @click="prepararEdicion(fila)">
                  <img src="@/assets/editatu.png" alt="Editar" style="max-width: 24px;" />
                </button>
                <button type="button" class="btn p-0 me-2" @click="borrar(fila.id)">
                  <img src="@/assets/ezabatu.png" alt="Borrar" style="max-width: 24px;" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <dialog ref="modalRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            {{ modoEdicion ? 'Editar Txanda' : 'Crear Txanda' }}
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardar">
            <div class="mb-4">
              <label class="custom-label">ALUMNO</label>
              <select v-model="form.student_id" class="form-control custom-input" required>
                <option value="" disabled>Selecciona un alumno</option>
                <option v-for="alumno in alumnosLista" :key="alumno.id" :value="alumno.id">
                  {{ alumno.name }} {{ alumno.surnames }}
                </option>
              </select>
            </div>

            <div v-for="header in headersOriginales" :key="header" class="mb-4">
              <div
                v-if="!['id', 'student_id', 'student_name', 'created_at', 'updated_at', 'deleted_at'].includes(header.toLowerCase())">
                <label :for="header" class="custom-label">{{ header.toUpperCase() }}</label>
                <input :id="header" v-model="form[header]" type="text" class="form-control custom-input"
                  :placeholder="'Introduce ' + header" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import Api from '../composables/Api.js'
import SidebarMenu from '@/components/SidebarMenu.vue'

const menuAbierto = ref(false)

const Txandak = ref([])
const alumnosLista = ref([])
const tableName = "shifts"
const modalRef = ref(null)
const modoEdicion = ref(false)
const currentId = ref(null)
const form = reactive({})

const headersOriginales = computed(() => {
  if (!Txandak.value.length) return []
  return Object.keys(Txandak.value[0])
})

// Filtrado de columnas para la tabla
const headersVisibles = computed(() => {
  const excluidos = ['id', 'student_id', 'created_at', 'updated_at', 'deleted_at']
  return headersOriginales.value.filter(h => !excluidos.includes(h.toLowerCase()))
})

const truncar = (texto, limite = 20) => {
  if (!texto) return ''
  let t = texto.toString()
  return t.length > limite ? t.slice(0, limite) + '…' : t
}

const cargarDatos = async () => {
  try {
    const [resShifts, resStudents] = await Promise.all([
      Api.cargarObjetos(tableName),
      Api.cargarObjetos("students")
    ])
    alumnosLista.value = resStudents?.data || resStudents || []
    const listaRaw = resShifts?.data || resShifts || []

    if (Array.isArray(listaRaw)) {
      Txandak.value = listaRaw.map(turno => {
        const alumno = alumnosLista.value.find(a => a.id === turno.student_id)
        return {
          ...turno,
          student_name: alumno ? `${alumno.name} ${alumno.surnames}` : `ID: ${turno.student_id}`
        }
      })
    }
  } catch (e) { console.error(e) }
}

const abrirCrear = () => {
  modoEdicion.value = false
  currentId.value = null
  Object.keys(form).forEach(k => form[k] = "")
  form.student_id = ""
  modalRef.value?.showModal()
}

const prepararEdicion = (fila) => {
  modoEdicion.value = true
  currentId.value = fila.id
  headersOriginales.value.forEach(h => { form[h] = fila[h] || "" })
  modalRef.value?.showModal()
}

const cerrarModal = () => modalRef.value?.close()

const guardar = async () => {
  try {
    // Extraemos solo lo necesario para el payload, evitando campos de solo lectura
    const { student_name, id, created_at, updated_at, deleted_at, ...payload } = form
    let res
    if (modoEdicion.value) {
      res = await Api.aldatuObjeto({ id: currentId.value, ...payload }, tableName)
    } else {
      res = await Api.crearObjektua(payload, tableName)
    }
    if (res) { cerrarModal(); await cargarDatos() }
  } catch (e) { alert(e.message) }
}

const borrar = async (id) => {
  if (confirm('¿Borrar registro?')) {
    const res = await Api.ezabatuObjektua({ id }, tableName)
    if (res) await cargarDatos()
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