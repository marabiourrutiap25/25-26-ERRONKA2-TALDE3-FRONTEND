<template>
    <div>
        <img :src="imagenSrc" alt="Description" @click="handleClick" />
    </div>
    <div>
        {{ Titulo }}
    </div>
</template>


<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  Titulo: { type: String, default: 'Menu Botoia' },
  imagen: { type: String, default: 'ezabatu' }, // solo nombre de la imagen
})

// Computed para la URL dinámica
const imagenSrc = computed(() => {
  return new URL(`../assets/${props.imagen}.png`, import.meta.url).href
})

// Evento del botón
function handleClick() {
  console.log('Botón clicado')
}
</script>