<template>
    <div class="d-flex flex-column align-items-center p-4 border rounded-3" style="background-color: #f8f9fa; cursor: pointer;" @click="handleClick">
        <img :src="imagenSrc" alt="Description" class="img-fluid" style="max-width: 120px; margin-bottom: 10px;" />
        <div class="text-center">
            {{ Titulo }}
        </div>
    </div>
</template>


<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Props
const props = defineProps({
  Titulo: { type: String, default: 'Menu Botoia' },
  imagen: { type: String, default: 'ezabatu' }, // solo nombre de la imagen
  ruta: { type: String, default: '/' }, // nueva prop para la ruta
})

// Computed para la URL dinámica
const imagenSrc = computed(() => {
  return new URL(`../assets/${props.imagen}.png`, import.meta.url).href
})

// Evento del botón
function handleClick() {
  router.push(props.ruta)
}
</script>