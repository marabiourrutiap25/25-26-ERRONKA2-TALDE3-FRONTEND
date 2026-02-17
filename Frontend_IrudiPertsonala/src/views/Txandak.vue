<template>
  <SidebarMenu :titulo="'Txandak'" v-model="menuAbierto" />

  <!-- Tabla con acciones crear, editar y borrar -->
  <Taula :filas="Txandak" :titulo="'Txanda'" :labels="{
    type: 'MOTA',
    last_name: 'ABIZENA',
    student_name: 'IKASLE IZENA',
    birth_date: 'JAIOTZE DATA'
  }" @crear="abrirCrear" @editar="prepararEdicion" @borrar="borrar" />
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import Api from '../composables/Api.js'
import Taula from '@/components/Taula.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'

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