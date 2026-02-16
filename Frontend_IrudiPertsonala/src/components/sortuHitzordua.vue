<template>
  <dialog ref="dialogRef" class="p-0 border-0">
    <div class="modal-dialog modal-dialog-centered m-0">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="onCancel"></button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- Campos normales -->
            <div v-for="header in normalizedHeaders" :key="header.key" class="mb-3">
              <label :for="header.key" class="form-label">{{ header.label }}</label>
              <input
                v-if="header.key !== 'comments'"
                :id="header.key"
                v-model="form[header.key]"
                type="text"
                class="form-control"
                :readonly="header.key === 'id'"
              />
              <textarea
                v-else
                :id="header.key"
                v-model="form[header.key]"
                class="form-control"
                rows="3"
              ></textarea>
            </div>

            <!-- Select Cliente -->
            <div class="mb-3">
              <label for="client_id" class="form-label">Cliente</label>
              <select id="client_id" v-model.number="form.client_id" class="form-select">
                <option value="" disabled>Seleccione Cliente</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <!-- Select Alumno -->
            <div class="mb-3">
              <label for="student_id" class="form-label">Alumno</label>
              <select id="student_id" v-model.number="form.student_id" class="form-select">
                <option value="" disabled>Seleccione Alumno</option>
                <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div class="modal-footer px-0 pt-3 d-flex justify-content-between">
              <!-- Botón borrar -->
              <!-- Botón de borrar -->
              <button
                v-if="form.id"
                type="button"
                class="btn btn-danger"
                @click="borrarHitzordua"
                >
                Borrar
              </button>


              <div class="ms-auto">
                <button type="button" class="btn btn-secondary" @click="onCancel">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                  Guardar
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref, reactive, computed, defineExpose, watch } from 'vue'
import Api from '../composables/Api.js'

const props = defineProps({
  title: { type: String, default: "Crear / Editar Hitzordua" },
  headers: { type: Array, required: true },
  clients: { type: Array, default: () => [] },
  students: { type: Array, default: () => [] }
})

const emit = defineEmits(['submit', 'cancel', 'deleted'])
const dialogRef = ref(null)
const form = reactive({})

// Normalizar headers
const normalizedHeaders = computed(() => {
  return props.headers.map(h => {
    if (typeof h === 'string') return { key: h, label: capitalize(h) }
    if (h.key) return { key: h.key, label: h.label ?? capitalize(h.key) }
    return { key: String(h), label: String(h) }
  })
})

// Inicializar form
watch(normalizedHeaders, (newHeaders) => {
  newHeaders.forEach(h => { if (form[h.key] === undefined) form[h.key] = '' })
}, { immediate: true })

// Configurar datos
const setFormData = (data) => {
  Object.keys(form).forEach(key => {
    if (key === 'client_id') form[key] = data.client_id ?? null
    else if (key === 'student_id') form[key] = data.student_id ?? null
    else form[key] = data[key] ?? ''
  })
  // Asegurarse de tener el id
  form.id = data.id ?? null
}


// Abrir / cerrar modal
const open = () => dialogRef.value?.showModal()
const close = () => {
  dialogRef.value?.close()
  Object.keys(form).forEach(key => form[key] = '')
}

// Enviar datos
const handleSubmit = () => {
  // Asegurarse de formato HH:MM:SS
  if (form.start_time && form.start_time.length === 5) form.start_time += ':00'
  if (form.end_time && form.end_time.length === 5) form.end_time += ':00'

  console.log('Payload que se enviará a API:', JSON.parse(JSON.stringify(form)))

  emit('submit', { ...form })
  close()
}

const borrarHitzordua = async () => {
  if (!form.id) return;
  if (!confirm("¿Seguro que quieres borrar esta cita?")) return;

  try {
    await Api.ezabatuObjektua({ id: form.id }, "appointments");
    close();                // cierra el modal
    emit('recargar');       // avisa al padre para recargar
  } catch (err) {
    console.error(err);
  }
}


const onCancel = () => {
  emit('cancel')
  close()
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g,' ')
}

// Exponer métodos
defineExpose({ open, close, setFormData })
</script>
