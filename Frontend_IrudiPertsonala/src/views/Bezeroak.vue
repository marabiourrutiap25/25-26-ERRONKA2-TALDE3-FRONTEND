<template>
<Editatu
  ref="modal"
  title="Nuevo usuario"
  :fields="['Nombre','Email','Teléfono']"
  @submit="handleSubmit"
/>

<button @click="modal.open()">Abrir</button>

</template>

<script setup>
import { ref, reactive, watch, nextTick, defineExpose } from "vue"
import Editatu from "../components/editatu.vue"
const modal = ref(null)

function handleSubmit(data) {
  console.log(data)
}
</script>
