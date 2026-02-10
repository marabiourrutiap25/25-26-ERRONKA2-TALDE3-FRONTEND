<template>
  <dialog ref="dlg">
    Hola 👋 soy un dialog externo
  </dialog>
</template>

<script setup>
import { ref, defineExpose } from 'vue'

const dlg = ref(null)

// Exponemos un método para que el padre lo pueda llamar
const show = () => {
  dlg.value.showModal()
}

defineExpose({ show })
</script>
