<template>
  <div class="table-responsive">
    <table class="table table-bordered text-center">
      <thead class="table-light">
        <tr>
          <th>Ordua</th>
          <th v-for="asiento in asientos" :key="asiento">
            Eserleku {{ asiento }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="hour in hours" :key="hour">
          <th class="align-middle">{{ hour }}:00</th>
          <td v-for="asiento in asientos" :key="asiento + '-' + hour" style="width: 13%; min-height: 80px; vertical-align: top;">
            
            <div v-for="item in citasInicioCelda(asiento, hour)" :key="item.id"
              class="bg-secondary text-white p-2 mb-1 rounded text-start"
              :style="{ height: calcularAltura(item), cursor: 'pointer', fontSize: '0.85rem' }" 
              @click="$emit('editar', item)">
              
              <div class="fw-bold text-warning border-bottom border-secondary pb-1 mb-1">
                {{ item.start_time.substring(0,5) }} - {{ item.end_time.substring(0,5) }}
              </div>
              <div><b>Bezeroa:</b> {{ getClientName(item.client_id) }}</div>
              <div><b>Ikaslea:</b> {{ getStudentName(item.student_id) }}</div>
              <div v-if="item.comments" class="text-white-50 mt-1" style="font-size: 0.75rem; line-height: 1.1;">
                <i><b>Iruzkinak:</b> {{ item.comments }}</i>
              </div>
            </div>

          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedDate: { type: String, required: true },
  datos: { type: Array, default: () => [] },
  clients: { type: Array, default: () => [] },
  students: { type: Array, default: () => [] }
})

const hours = Array.from({ length: 8 }, (_, i) => i + 8)
const asientos = [1, 2, 3, 4, 5, 6, 7]

function citasInicioCelda(asiento, hour) {
  return props.datos.filter(item => {
    if (!item.id || !item.start_time || item.seat === undefined) return false
    const [h] = item.start_time.split(':').map(Number)
    return Number(item.seat) === asiento && h === hour
  })
}

function calcularAltura(item) {
  if (!item.start_time || !item.end_time) return 'auto'
  const [sh, sm] = item.start_time.split(':').map(Number)
  const [eh, em] = item.end_time.split(':').map(Number)
  
  const startMinutes = sh * 60 + sm
  const endMinutes = eh * 60 + em
  const diffHoras = (endMinutes - startMinutes) / 60
  
  return `${Math.max(diffHoras * 75, 65)}px`
}

function getClientName(client_id) {
  const client = props.clients.find(c => c.id === client_id)
  return client ? `${client.name} ${client.surnames || ''}` : `ID: ${client_id}`
}

function getStudentName(student_id) {
  const student = props.students.find(s => s.id === student_id)
  return student ? `${student.name} ${student.surnames || ''}` : `ID: ${student_id}`
}
</script>