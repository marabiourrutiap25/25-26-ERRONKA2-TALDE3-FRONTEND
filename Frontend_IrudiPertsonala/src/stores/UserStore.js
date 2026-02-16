import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMainStore = defineStore('main', () => {
  // STATE: Propiedades reactivas
  const usuario = ref(null)
  const cargando = ref(false)
  const error = ref(null)
  const items = ref([])
  const token = ref(null)

  // GETTERS: Propiedades calculadas
  const usuarioNombre = computed(() => usuario.value?.nombre || 'Anónimo')
  const tieneItems = computed(() => items.value.length > 0)

  // ACTIONS: Métodos/funciones
  const setUsuario = (nuevoUsuario,token) => {
    usuario.value = nuevoUsuario
    token.value = token // Asegura que el token se mantenga actualizado en el usuario
  }

  const setToken = (nuevoToken) => {
    token.value = nuevoToken
  }

  const agregarItem = (item) => {
    items.value.push(item)
  }

  const limpiar = () => {
    usuario.value = null
    items.value = []
    error.value = null
    token.value = null
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
    token,
    // Actions
    setUsuario,
    agregarItem,
    limpiar
  }
})