<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mt-5 mb-3">
            <h3 class="mb-0">{{ titulo }}</h3>
            <button class="btn btn-success" @click="$emit('crear')">{{ textoBtnCrear }}</button>
        </div>

        <div v-if="filas.length" class="table-responsive mb-5">
            <table class="table table-hover border rounded mb-0">
                <tbody class="bg-light">
                    <tr>
                        <td colspan="100%">
                            <span class="fw-bold">{{ etiquetaTabla }}</span>
                        </td>
                    </tr>
                </tbody>
                <thead class="table-light">
                    <tr>
                        <th v-for="header in headersVisibles" :key="header">
                            {{ formatHeader(header) }}
                        </th>
                        <th class="text-end">Akzioak</th>
                    </tr>
                </thead>
                <tbody class="bg-white">
                    <tr v-for="(fila, index) in filas" :key="index">
                        <td v-for="header in headersVisibles" :key="header" class="align-middle">
                            {{ truncar(fila[header]) }}
                        </td>
                        <td class="text-end">
                            <button class="btn p-0 me-2" @click="$emit('editar', fila)">
                                <img src="@/assets/editatu.png" alt="Editar" style="max-width: 24px;" />
                            </button>
                            <button class="btn p-0 me-2" @click="$emit('borrar', fila.id)">
                                <img src="@/assets/ezabatu.png" alt="Borrar" style="max-width: 24px;" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

// Los jodidos props hechos por el asistente de IA del MediaMarkt.
const props = defineProps({
    // Datos a mostrar
    filas: {
        type: Array,
        default: () => []
    },
    // Título encima de la tabla  ("Kontsumible - Ikasle")
    titulo: {
        type: String,
        default: ''
    },
    // Negrita dentro de la primera fila de la tabla ("Consumable")
    etiquetaTabla: {
        type: String,
        default: ''
    },
    // Texto del botón de creación
    textoBtnCrear: {
        type: String,
        default: 'Crear'
    },
    // Columnas que nunca deben mostrarse en la tabla
    columnasExcluidas: {
        type: Array,
        default: () => ['id', 'student_id', 'consumable_id', 'equipment_id', 'created_at', 'updated_at', 'deleted_at', 'consumable_category_id']
    },
    // Mapa de cabeceras personalizadas { clave: 'Texto visible' }
    mapaHeaders: {
        type: Object,
        default: () => ({ student_name: 'IKASLEA', item_name: 'PRODUKTUA' })
    },
    // Longitud máxima antes de truncar el texto de una celda
    maxLongitud: {
        type: Number,
        default: 20
    }
})

// Emit de mierda, puede no funcionar.
defineEmits(['crear', 'editar', 'borrar'])

// sí
const headersVisibles = computed(() => {
    if (!props.filas.length) return []
    const excluidos = props.columnasExcluidas.map(c => c.toLowerCase())
    return Object.keys(props.filas[0]).filter(h => !excluidos.includes(h.toLowerCase()))
})

// Helpers (como Egoitz)
const formatHeader = (h) => {
    if (props.mapaHeaders[h]) return props.mapaHeaders[h]
    return h.toUpperCase().replace(/_/g, ' ')
}

const truncar = (t) => {
    if (!t) return ''
    const str = t.toString()
    return str.length > props.maxLongitud ? str.slice(0, props.maxLongitud) + '…' : str
}
</script>