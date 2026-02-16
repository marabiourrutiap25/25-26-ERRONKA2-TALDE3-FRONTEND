<template>
  <dialog ref="dialogRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
    <div class="modal-content border-0">
      <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
        <h4 class="modal-title fw-bold text-dark d-flex align-items-center">
          {{ title }}
        </h4>
        <button type="button" class="btn-close-custom" @click="onCancel">✕</button>
      </div>

      <div class="modal-body px-4 pb-4">
        <form @submit.prevent="handleSubmit">
          <div v-for="header in normalizedHeaders" :key="header.key" class="mb-4">
            <div v-if="header.key !== 'id' && !header.key.endsWith('_at')">
              <label :for="header.key" class="custom-label">{{ header.label.toUpperCase() }}</label>
              <input :id="header.key" v-model="form[header.key]" type="text" class="form-control custom-input"
                :placeholder="'Introduce ' + header.label" />
            </div>
          </div>

          <div class="d-flex justify-content-end gap-3 pt-3">
            <button type="button" class="btn btn-cancel px-4" @click="onCancel">
              Cancelar
            </button>
            <button type="submit" class="btn btn-save px-4">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, defineExpose } from "vue"

const props = defineProps({
  title: { type: String, default: "Sortu" },
  headers: { type: Array, required: true }
})

const emit = defineEmits(["submit", "cancel"])
const dialogRef = ref(null)
const form = reactive({})

const normalizedHeaders = computed(() => {
  return props.headers.map(h => {
    if (typeof h === "string") return { key: h, label: h }
    return { key: h.key, label: h.label ?? h.key }
  })
})

watch(
  normalizedHeaders,
  (newHeaders) => {
    newHeaders.forEach(h => {
      if (form[h.key] === undefined) form[h.key] = ""
    })
  },
  { immediate: true }
)

const setFormData = (data) => {
  Object.keys(form).forEach(key => {
    form[key] = data[key] ?? ""
  })
}

const open = () => dialogRef.value?.showModal()
const close = () => {
  dialogRef.value?.close()
  Object.keys(form).forEach(key => form[key] = "")
}

const handleSubmit = () => { emit("submit", { ...form }); close() }
const onCancel = () => { emit("cancel"); close() }

defineExpose({ open, close, setFormData })
</script>

<style scoped>
/* Reutilizamos exactamente el mismo estilo para consistencia */
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
  color: #333;
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