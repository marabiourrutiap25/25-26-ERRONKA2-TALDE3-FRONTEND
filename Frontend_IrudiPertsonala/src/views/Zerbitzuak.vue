<template>
    <div class="container">
      <div class="d-flex justify-content-between align-items-center my-4">
        <h2 class="mb-0">Gestión de Personas</h2>
        <button class="btn btn-success" @click="crearPersona">
          ➕ Nueva persona
        </button>
      </div>

      <Tabla
        Titulo="Listado de personas"
        :filas="personas"
        @editar-servicio="editarPersona"
        @borrar-servicio="borrarPersona"
      />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import Tabla from '../components/tabla.vue'
const personas = ref([])

const cargarPersonas = async () => {
  personas.value = [
    { id: 1, nombre: 'Juan', email: 'juan@test.com', edad: 30 },
    { id: 2, nombre: 'Ana', email: 'ana@test.com', edad: 25 },
    { id: 3, nombre: 'Luis', email: 'luis@test.com', edad: 40 }
  ]
}
onMounted(cargarPersonas)

const editarPersona = (id) => {
  console.log('Editar', id)

}

const borrarPersona = async (id) => {
  const confirmar = confirm('¿Seguro que quieres borrar esta persona?')

  if (!confirmar) return

  personas.value = personas.value.filter(p => p.id !== id)
}

const crearPersona = () => {
}
</script>