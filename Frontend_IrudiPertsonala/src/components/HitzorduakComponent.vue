<template>
  <div class="table-responsive">
    <table class="table table-bordered text-center">
      <thead class="table-light">
        <tr>
          <th>Hora</th>
          <th v-for="day in days" :key="day.toDateString()">
            {{ formatDate(day) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="hour in hours" :key="hour">
          <th>{{ hour }}:00</th>
          <td v-for="day in days" :key="day.toDateString() + '-' + hour">
            <!-- Mostrar solo las citas que empiezan en esta celda -->
            <div
              v-for="item in citasInicioCelda(day, hour)"
              :key="item.id"
              class="bg-secondary text-white p-1 mb-1 rounded"
              :style="{ height: calcularAltura(item), cursor: 'pointer' }"
              @click="$emit('editar', item)"  <!-- Abrir modal Editatu.vue -->
            >
              Seat {{ item.seat }} <br>
              {{ item.start_time }} - {{ item.end_time }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { startOfWeek, addDays, format } from 'date-fns'

const props = defineProps({
  week: { type: String, required: true },
  datos: { type: Array, default: () => [] } // array de citas
})

// Horas del calendario (8 a 20)
const hours = Array.from({ length: 13 }, (_, i) => i + 8)

// Días de la semana
const days = computed(() => {
  if (!props.week) return []
  const [year, week] = props.week.split('-W').map(Number)
  const firstDay = startOfWeek(new Date(year, 0, 1 + (week - 1) * 7), { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(firstDay, i))
})

// Formatear fecha para la cabecera
function formatDate(date) {
  return format(date, 'EEE dd/MM')
}

// Devuelve las citas que comienzan en esta hora
function citasInicioCelda(day, hour) {
  return props.datos.filter(item => {
    if (!item.id || !item.date || !item.start_time) return false
    const start = new Date(`${item.date}T${item.start_time}`)
    return (
      start.getFullYear() === day.getFullYear() &&
      start.getMonth() === day.getMonth() &&
      start.getDate() === day.getDate() &&
      start.getHours() === hour
    )
  })
}


// Calcular altura proporcional según duración de la cita
function calcularAltura(item) {
  if (!item.start_time || !item.end_time) return '60px'
  const start = new Date(`${item.date}T${item.start_time}`)
  const end = new Date(`${item.date}T${item.end_time}`)
  const diffMs = end - start
  const diffHoras = diffMs / (1000 * 60 * 60)
  const altura = Math.max(diffHoras * 60, 30) // mínimo 30px
  return `${altura}px`
}
</script>
