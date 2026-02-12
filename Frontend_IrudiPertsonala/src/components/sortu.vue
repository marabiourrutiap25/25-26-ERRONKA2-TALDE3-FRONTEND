<template>
  <dialog ref="dialogRef" class="p-0 border-0">
    <div class="modal-dialog modal-dialog-centered m-0">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="onCancel"
          ></button>
        </div>
        
        <div class="modal-body">
          <!-- 🔹 Prevent default evita enviar SubmitEvent -->
          <form @submit.prevent="handleSubmit">
            <div v-for="header in headers" :key="header" class="mb-3">
              <label :for="header" class="form-label">{{ header }}</label>
              <input
                :id="header"
                v-model="form[header]"
                type="text"
                class="form-control"
                :readonly="header === 'id'"  <!-- opcional: id no editable -->
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
import { ref, reactive, watch, defineExpose } from "vue"

const props = defineProps({
  title: { type: String, default: "Editar registro" },
  headers: { type: Array, required: true }
})

const emit = defineEmits(["submit", "cancel"])

const dialogRef = ref(null)
const form = reactive({})

// Inicializar formulario con campos vacíos
watch(
  () => props.headers,
  (newHeaders) => {
    if (newHeaders && Array.isArray(newHeaders)) {
      newHeaders.forEach(h => {
        if (form[h] === undefined) {
          form[h] = ""
        }
      })
    }
  },
  { immediate: true }
)

// Configurar datos de la fila a editar
const setFormData = (data) => {
  Object.keys(form).forEach(key => {
    form[key] = data[key] ?? ""
  })
}

// Abrir / cerrar diálogo
const open = () => dialogRef.value?.showModal()
const close = () => {
  dialogRef.value?.close()
  Object.keys(form).forEach(key => form[key] = "")
}

// 🔹 Emitir solo los datos, nunca SubmitEvent
const handleSubmit = () => {
  emit("submit", { ...form })  // Objeto plano con los datos
  close()
}

const onCancel = () => {
  emit("cancel")
  close()
}

// Exponer métodos al padre
defineExpose({ open, close, setFormData })
</script>
