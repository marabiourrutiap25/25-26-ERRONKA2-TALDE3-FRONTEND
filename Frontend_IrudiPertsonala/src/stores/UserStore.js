import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMainStore = defineStore('main', () => {
  // STATE: Propiedades reactivas
  const usuario = ref(null)
  const cargando = ref(false)
  const error = ref(null)
  const items = ref([])

  // GETTERS: Propiedades calculadas
  const usuarioNombre = computed(() => usuario.value?.nombre || 'Anónimo')
  const tieneItems = computed(() => items.value.length > 0)

  // ACTIONS: Métodos/funciones
  const setUsuario = (nuevoUsuario) => {
    usuario.value = nuevoUsuario
  }

  const agregarItem = (item) => {
    items.value.push(item)
  }

  const limpiar = () => {
    usuario.value = null
    items.value = []
    error.value = null
  }

  return {
    // State
    usuario,
    cargando,
    error,
    items,
    // Getters
    usuarioNombre,
    tieneItems,
    // Actions
    setUsuario,
    agregarItem,
    limpiar
  }
})