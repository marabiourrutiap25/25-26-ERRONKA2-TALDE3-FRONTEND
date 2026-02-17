<template>
  <div class="container my-5">

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
            <th v-for="header in headersFiltrados" :key="header">
              {{ formatHeader(header) }}
            </th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="(fila, index) in filas" :key="index">
            <td 
              v-for="header in headersFiltrados" 
              :key="header" 
              style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
              :title="fila[header]"
            >
              {{ truncar(fila[header]) }}
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
      Ez daude erakusteko daturik.
    </div>

    <EditatuDialog
      ref="editDialogRef"
      :title="`Editar ${Titulo}`"
      :headers="headersFiltrados"
      @submit="handleEditSubmit"
    />

    <CrearDialog
      ref="crearDialogRef"
      :title="`Crear ${Titulo}`"
      :headers="headersFiltrados"
      @submit="handleCreateSubmit"
    />

  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import EditatuDialog from "./editatu.vue"
import CrearDialog from "./sortu.vue"

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

// 🔹 Headers originales
const headers = computed(() => {
  if (!props.filas.length) return []
  return Object.keys(props.filas[0])
})

// 🔹 FILTRO DINÁMICO: Aquí es donde ocurre la magia
const headersFiltrados = computed(() => {
  const excluidos = ['id', 'created_at', 'updated_at', 'deleted_at']
  return headers.value.filter(h => !excluidos.includes(h.toLowerCase()))
})

// 🔹 Formatear texto de cabecera (opcional, para que se vea bonito)
const formatHeader = (h) => {
  return h.toUpperCase().replace('_', ' ')
}

const currentEditRow = ref(null)

const truncar = (texto, limite = 20) => {
  if (!texto) return ''
  return texto.length > limite ? texto.slice(0, limite) + '…' : texto
}

const abrirCrear = () => {
  crearDialogRef.value?.open()
}

const editar = (fila) => {
  currentEditRow.value = fila
  if (editDialogRef.value) {
    const formData = {}
    // Solo pasamos al formulario los campos que no están excluidos
    headersFiltrados.value.forEach(header => {
      formData[header] = fila[header] || ""
    })
    editDialogRef.value.setFormData?.(formData)
    editDialogRef.value.open()
  }
}

const borrarFila = (id) => {
  if (confirm('¿Estás seguro de que quieres borrar este registro?')) {
    emit('borrar', id)
  }
}

const handleEditSubmit = (formData) => {
  emit('editar', {
    id: currentEditRow.value?.id,
    ...formData
  })
}

const handleCreateSubmit = (formData) => {
  emit('crear', formData)
}
</script>