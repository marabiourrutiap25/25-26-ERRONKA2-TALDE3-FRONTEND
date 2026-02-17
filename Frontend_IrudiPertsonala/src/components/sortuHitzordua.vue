<template>
  <dialog ref="dialogRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
    <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">{{ title }}</h4>
          <button type="button" class="btn-close-custom" @click="onCancel">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="handleSubmit">
            <!-- Campos normales -->
            <div v-for="header in normalizedHeaders" :key="header.key" class="mb-4">
              <label :for="header.key" class="custom-label">{{ header.label }}</label>
              <input
                v-if="header.key !== 'comments'"
                :id="header.key"
                v-model="form[header.key]"
                type="text"
                class="form-control custom-input"
                :readonly="header.key === 'id'"
                :placeholder="'Introduce ' + header.key"
              />
              <textarea
                v-else
                :id="header.key"
                v-model="form[header.key]"
                class="form-control custom-input"
                rows="3"
                :placeholder="'Introduce ' + header.key"
              ></textarea>
            </div>

            <!-- Select Cliente -->
            <div class="mb-4">
              <label for="client_id" class="custom-label">Bezeroa</label>
              <select id="client_id" v-model.number="form.client_id" class="form-select custom-input">
                <option value="" disabled>Bezeroa aukeratu</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <!-- Select Alumno -->
            <div class="mb-4">
              <label for="student_id" class="custom-label">Ikaslea</label>
              <select id="student_id" v-model.number="form.student_id" class="form-select custom-input">
                <option value="" disabled>Ikaslea aukeratu</option>
                <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div class="d-flex justify-content-end gap-3 pt-3">
              <!-- Botón borrar -->
              <!-- Botón de borrar -->
              <button
                v-if="form.id"
                type="button"
                class="btn btn-danger"
                @click="borrarHitzordua"
                >
                Ezabatu
              </button>


              <div class="ms-auto">
                <button type="button" class="btn btn-cancel px-4" @click="onCancel">Cancelar</button>
                <button type="submit" class="btn btn-save px-4">Guardar</button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </dialog>
</template>

<script setup>
import { ref, reactive, computed, defineExpose, watch } from 'vue'
import Api from '../composables/Api.js'

const props = defineProps({
  title: { type: String, default: "Hitzordua sortu/editatu" },
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