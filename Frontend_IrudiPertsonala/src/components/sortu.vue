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
            <div v-for="header in normalizedHeaders" :key="header.key" class="mb-3">
              <label :for="header.key" class="form-label">{{ header.label }}</label>
              <input
                :id="header.key"
                v-model="form[header.key]"
                type="text"
                class="form-control"
                :readonly="header.key === 'id' || header.key.endsWith('_at')"
              />
            </div>

            <div class="modal-footer px-0 pt-3">
              <button type="button" class="btn btn-secondary" @click="onCancel">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, defineExpose } from "vue"

const props = defineProps({
  title: { type: String, default: "Editar registro" },
  headers: { type: Array, required: true }
})

const emit = defineEmits(["submit", "cancel"])

const dialogRef = ref(null)
const form = reactive({})

const normalizedHeaders = computed(() => {
  return props.headers.map(h => {
    if (typeof h === "string") return { key: h, label: capitalize(h) }
    if (h.key) return { key: h.key, label: h.label ?? capitalize(h.key) }
    return { key: String(h), label: String(h) }
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

const handleSubmit = () => {
  emit("submit", { ...form })
  close()
}

const onCancel = () => {
  emit("cancel")
  close()
}

function capitalize(str) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

defineExpose({ open, close, setFormData })
</script>
