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

            <!-- ID (readonly) -->
            <input v-if="header.key === 'id'" :id="header.key" v-model="form[header.key]" type="text"
              class="form-control custom-input" readonly />

            <!-- Seat: number -->
            <input v-else-if="header.key === 'seat'" :id="header.key" v-model.number="form[header.key]" type="number"
              min="1" class="form-control custom-input" :placeholder="header.label" />

            <!-- Date: date picker -->
            <input v-else-if="header.key === 'date'" :id="header.key" v-model="form[header.key]" type="date"
              class="form-control custom-input" :placeholder="header.label" />

            <!-- Start/End time: time picker (HH:MM) -->
            <input v-else-if="header.key === 'start_time' || header.key === 'end_time'" :id="header.key"
              v-model="form[header.key]" type="time" class="form-control custom-input" :placeholder="header.label" />

            <!-- Comments: textarea -->
            <textarea v-else-if="header.key === 'comments'" :id="header.key" v-model="form[header.key]"
              class="form-control custom-input" rows="3" :placeholder="header.label"></textarea>

            <!-- Fallback text input -->
            <input v-else :id="header.key" v-model="form[header.key]" type="text" class="form-control custom-input"
              :placeholder="header.label" />
          </div>

          <!-- Select Cliente -->
          <div class="mb-4">
            <label for="client_id" class="custom-label">Bezeroa</label>
            <select id="client_id" v-model.number="form.client_id" class="form-select custom-input">
              <option value="" disabled>Bezeroa aukeratu</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }} {{ c.surnames ?? '' }}</option>
            </select>
          </div>

          <!-- Select Alumno -->
          <div class="mb-4">
            <label for="student_id" class="custom-label">Ikaslea</label>
            <select id="student_id" v-model.number="form.student_id" class="form-select custom-input">
              <option value="" disabled>Ikaslea aukeratu</option>
              <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }} {{ s.surnames ?? '' }}</option>
            </select>
          </div>

          <div class="d-flex justify-content-end gap-3 pt-3">
            <!-- Botón borrar -->
            <!-- Botón de borrar -->
            <button v-if="form.id" type="button" class="btn btn-danger" @click="borrarHitzordua">
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

const emit = defineEmits(['submit', 'cancel', 'deleted', 'recargar'])
const dialogRef = ref(null)
const form = reactive({})

// Headerrak normalizatu eta etiketak mapeatu euskaraz
const labelMap = {
  seat: 'Eserlekua',
  date: 'Data',
  start_time: 'Hasierako ordua',
  end_time: 'Amaierako ordua',
  comments: 'Komentarioak',
  id: 'ID'
}

const normalizedHeaders = computed(() => {
  return props.headers.map(h => {
    const key = typeof h === 'string' ? h : (h.key ?? String(h))
    const label = (typeof h === 'object' && h.label) ? h.label : (labelMap[key] ?? capitalize(key))
    return { key, label }
  })
})

// Inicializatu form
watch(normalizedHeaders, (newHeaders) => {
  newHeaders.forEach(h => { if (form[h.key] === undefined) form[h.key] = '' })
}, { immediate: true })

// Datuak osatu
const setFormData = (data) => {
  Object.keys(form).forEach(key => {
    if (key === 'client_id') form[key] = data.client_id ?? null
    else if (key === 'student_id') form[key] = data.student_id ?? null
    else if (key === 'start_time' && data.start_time) {
      // HH:MM:SS formatua HH:MM formatuan bihurtu orduaren baliogilea
      form[key] = data.start_time.length === 8 ? data.start_time.slice(0, 5) : (data.start_time ?? '')
    }
    else if (key === 'end_time' && data.end_time) {
      // HH:MM:SS formatua HH:MM formatuan bihurtu orduaren baliogilea
      form[key] = data.end_time.length === 8 ? data.end_time.slice(0, 5) : (data.end_time ?? '')
    }
    else form[key] = data[key] ?? ''
  })
  // Ziurtatu IDa
  form.id = data.id ?? null
}


// Ireki / itxi modal
const open = () => dialogRef.value?.showModal()
const close = () => {
  dialogRef.value?.close()
  Object.keys(form).forEach(key => form[key] = '')
}

// Bidali datuak gurasoari
const handleSubmit = () => {
  // HH:MM:SS formatua zihestatu
  if (form.start_time && form.start_time.length === 5) form.start_time += ':00'
  if (form.end_time && form.end_time.length === 5) form.end_time += ':00'

  console.log('APIra bidaltzen den kargua:', JSON.parse(JSON.stringify(form)))

  emit('submit', { ...form })
  close()
}

const borrarHitzordua = async () => {
  if (!form.id) return;
  if (!confirm("¿Seguro que quieres borrar esta cita?")) return;

  try {
    await Api.ezabatuObjektua({ id: form.id }, "appointments");
    close();                // Modala itxi
    emit('recargar');       // Gurasoa bergarritzeko abisatu
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
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

// Metodoak esposatu
defineExpose({ open, close, setFormData })
</script>
