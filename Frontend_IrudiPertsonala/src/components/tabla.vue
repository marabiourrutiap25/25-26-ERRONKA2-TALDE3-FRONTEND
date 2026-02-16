<template>
  <div class="container my-5">

    <!-- 🔵 BOTÓN CREAR -->
    <div class="mb-3 d-flex justify-content-end">
      <button 
        class="btn btn-success"
        @click="abrirCrear"
      >
        Crear {{ Titulo }}
      </button>
    </div>

    <div v-if="filas.length" class="table-responsive">
      <table class="table table-hover border rounded mb-0">
        <tbody class="bg-light">
          <tr>
            <td colspan="100%">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">{{ Titulo }}</span>
              </div>
            </td>
          </tr>
        </tbody>
        <thead class="table-light">
          <tr>
            <th v-for="header in headers" :key="header">{{ header }}</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="(fila, index) in filas" :key="index">
            <td v-for="header in headers" :key="header">
              {{ fila[header] }}
            </td>
            <td>
              <div class="d-flex justify-content-end">
                <button 
                  type="button" 
                  class="btn p-0 me-2" 
                  @click="editar(fila)" 
                  title="Editar fila"
                >
                  <img src="@/assets/editatu.png" alt="Editar" class="img-fluid" style="max-width: 24px;" />
                </button>

                <button 
                  type="button" 
                  class="btn p-0 me-2" 
                  @click="borrarFila(fila.id)" 
                  title="Borrar fila"
                >
                  <img src="@/assets/ezabatu.png" alt="Borrar" class="img-fluid" style="max-width: 24px;" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center text-muted">
      No hay datos para mostrar
    </div>

    <!-- 🔵 DIALOGO EDITAR -->
    <EditatuDialog
      ref="editDialogRef"
      :title="`Editar ${Titulo}`"
      :headers="headers"
      @submit="handleEditSubmit"
    />

    <!-- 🟢 DIALOGO CREAR -->
    <CrearDialog
      ref="crearDialogRef"
      :title="`Crear ${Titulo}`"
      :headers="headers"
      @submit="handleCreateSubmit"
    />

  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import EditatuDialog from "./editatu.vue"
import CrearDialog from "./sortu.vue" // 👈 nuevo

const emit = defineEmits(['editar', 'borrar', 'crear'])

const editDialogRef = ref(null)
const crearDialogRef = ref(null)

const props = defineProps({
  filas: { 
    type: Array, 
    default: () => [] 
  },
  Titulo: { 
    type: String, 
    default: "Tabla de datos" 
  }
})

const headers = computed(() => {
  if (!props.filas.length) return []
  return Object.keys(props.filas[0])
})

const currentEditRow = ref(null)


// 🔵 ABRIR CREAR
const abrirCrear = () => {
  crearDialogRef.value?.open()
}


// 🔵 EDITAR
const editar = (fila) => {
  currentEditRow.value = fila
  if (editDialogRef.value) {
    const formData = {}
    headers.value.forEach(header => {
      formData[header] = fila[header] || ""
    })
    editDialogRef.value.setFormData?.(formData)
    editDialogRef.value.open()
  }
}


// 🔵 BORRAR
const borrarFila = (id) => {
  if (confirm('¿Estás seguro de que quieres borrar este registro?')) {
    emit('borrar', id)
  }
}


// 🔵 SUBMIT EDITAR
const handleEditSubmit = (formData) => {
  emit('editar', {
    id: currentEditRow.value?.id,
    ...formData
  })
}


// 🟢 SUBMIT CREAR
const handleCreateSubmit = (formData) => {
  emit('crear', formData)
}
</script>
