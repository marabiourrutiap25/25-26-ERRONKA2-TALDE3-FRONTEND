import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function useToast() {
  const mostrar = (mensaje, tipo = 'success', duracion = 3500) => {
    const id = nextId++
    toasts.value.push({ id, mensaje, tipo })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duracion)
  }

  const ok = (msg) => mostrar(msg, 'success')
  const err = (msg) => mostrar(msg, 'error')

  return { toasts, ok, err }
}