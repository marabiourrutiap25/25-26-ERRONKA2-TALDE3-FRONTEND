<template>
  <div class="container my-5">
    <div v-if="filas.length" class="table-responsive">
      <table class="table table-hover border rounded mb-0">
        <tbody class="bg-light">
          <tr>
            <td colspan="100%">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold">{{ Titulo }}</span>
                </div>
            </td>
          </tr>
        </tbody>
        <thead class="table-light">
          <tr>
            <th v-for="header in headers" :key="header">{{ header }}</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white">
          <tr v-for="(fila, index) in filas" :key="index">
              <td v-for="header in headers" :key="header">{{ fila[header] }}</td>
              <td>
                  <div class="d-flex justify-content-end">
                      <button type="button" class="btn p-0 me-2" @click="$emit('editar', fila.id)" title="Editar fila">
                        <img src="@/assets/editatu.png" alt="Editar" class="img-fluid" style="max-width: 24px;" />
                      </button>
                      <button type="button" class="btn p-0 me-2" @click="$emit('borrar', fila.id)" title="Borrar fila">
                        <img src="@/assets/ezabatu.png" alt="Borrar" class="img-fluid" style="max-width: 24px;" />
                      </button>
                  </div>
              </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center text-muted">No hay datos para mostrar</div>
  </div>
</template>

<script setup type="module">
  import { computed } from 'vue'

  const props = defineProps({
    filas: { type: Array, default: () => [] },
  })

  const headers = computed(() => {
    if (!props.filas.length) return []
    return Object.keys(props.filas[0])
  })
</script>