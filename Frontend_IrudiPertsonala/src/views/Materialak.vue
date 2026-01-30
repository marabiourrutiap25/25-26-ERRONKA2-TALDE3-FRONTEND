<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center my-4">
      <h2 class="mb-0">Gestión de materialak</h2>
    </div>

    <Tabla
      Titulo="Listado de servicios"
      :filas="materialak"
      @editar="editar"
      @borrar="borrar"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Tabla from '../components/tabla.vue'
import Api from '../composables/Api.js'

const materialak = ref([])

onMounted(async () => {
  materialak.value = await Api.cargarObjetos("equipment")
  const tabla = document.querySelector('#miTabla tbody')

  const tr = document.createElement('tr')

  Object.keys(materialak.value[0]).forEach(key => {
    const td = document.createElement('td')
    td.textContent = key   // ← label
    tr.appendChild(td)
  })
tabla.appendChild(tr)
  console.log("Servicios cargados:", materialak.value) // <--- para debug
})

const editar = async (id) => {
  try {
    const objeto = await Api.cargarObjeto({ id }, "equipment")
    console.log("Objeto a editar:", objeto)
    // Aquí puedes abrir un modal o ir a una página de edición
    // router.push({ name: 'EditarMaterial', params: { id } })
  } catch (err) {
    console.error("Error al cargar objeto:", err)
  }
}

const borrar = async (id) => {
  if (confirm("¿Estás seguro de que quieres borrar este material?")) {
    try {
      const resultado = await Api.ezabatuObjektua({ id }, "equipment")
      console.log("Material borrado:", resultado)
      // Recargar la lista
      materialak.value = await Api.cargarObjetos("equipment")
    } catch (err) {
      console.error("Error al borrar:", err)
    }
  }
}
</script>