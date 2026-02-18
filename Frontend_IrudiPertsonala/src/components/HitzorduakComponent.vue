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
            <div v-for="item in citasInicioCelda(day, hour)" :key="item.id"
              class="bg-secondary text-white p-1 mb-1 rounded"
              :style="{ height: calcularAltura(item), cursor: 'pointer' }" @click="$emit('editar', item)">
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
  datos: { type: Array, default: () => [] }
})

// Egutegiko orduak (8etik 20etara)
const hours = Array.from({ length: 8 }, (_, i) => i + 8)

// Asteko egunak
const days = computed(() => {
  if (!props.week) return []
  const [year, week] = props.week.split('-W').map(Number)
  const firstDay = startOfWeek(new Date(year, 0, 1 + (week - 1) * 7), { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(firstDay, i))
})

// Goiburuaren eguna formatatu
function formatDate(date) {
  return format(date, 'EEE dd/MM')
}

// Ordu honetan hasten diren hitzorduak itzuli
function citasInicioCelda(day, hour) {
  return props.datos.filter(item => {
    if (!item.id || !item.date || !item.start_time) return false

    // Adimen-data lokala sortu, segundoak barne
    const [year, month, date] = item.date.split('-').map(Number)
    const [h, m, s] = item.start_time.split(':').map(Number)
    const start = new Date(year, month - 1, date, h, m, s)

    // Ordua soilik konparatu (osoa) gelaxkan jartzeko
    return (
      start.getFullYear() === day.getFullYear() &&
      start.getMonth() === day.getMonth() &&
      start.getDate() === day.getDate() &&
      start.getHours() === hour
    )
  })
}

// Hitzorduaren iraupenaren arabera altuera proportzionala kalkulatu
function calcularAltura(item) {
  if (!item.start_time || !item.end_time) return '60px'

  const [year, month, date] = item.date.split('-').map(Number)

  const [sh, sm, ss] = item.start_time.split(':').map(Number)
  const [eh, em, es] = item.end_time.split(':').map(Number)

  const start = new Date(year, month - 1, date, sh, sm, ss)
  const end = new Date(year, month - 1, date, eh, em, es)

  const diffHoras = (end - start) / (1000 * 60 * 60)
  const altura = Math.max(diffHoras * 60, 30)
  return `${altura}px`
}
</script>
