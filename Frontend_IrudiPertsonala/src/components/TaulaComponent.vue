<template>
    <div>
        <div class="d-flex justify-content-between align-items-center mt-5 mb-4">
            <h3 class="mb-0 table-title fw-bold">{{ titulo }} kudeatu</h3>
            <button v-if="!props.onlyView" class="btn btn-primary text-white fw-bold" @click="$emit('crear')">+ {{ textoBtnCrear }}</button>
        </div>

        <div v-if="filas.length" class="table-responsive mb-5">
            <table class="table table-hover border rounded mb-0">
                <thead class="table-light">
                    <tr>
                        <th v-for="header in headersVisibles" :key="header">
                            {{ formatHeader(header) }}
                        </th>
                        <th v-if="!props.onlyView" class="text-center">AKZIOAK</th>
                    </tr>
                </thead>
                <tbody class="bg-white">
                    <tr v-for="(fila, index) in filas" :key="index">
                        <td v-for="header in headersVisibles" :key="header" class="align-middle">
                            {{ truncar(fila[header]) }}
                        </td>
                        <td v-if="!props.onlyView" class="text-center">
                            <button v-if="isBezeroView" class="btn btn-dark p-2 me-3" @click="verHistorial(fila)">
                                <img src="@/assets/ikusi.png" alt="Ikusi" />
                            </button>
                            <button class="btn btn-primary p-2 me-3" @click="$emit('editar', fila)">
                                <img src="@/assets/editatu.png" alt="Editar" />
                            </button>
                            <button class="btn btn-danger p-2 me-2" @click="$emit('borrar', fila.id)">
                                <img src="@/assets/ezabatu.png" alt="Borrar" />
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
import { useRoute, useRouter } from 'vue-router'

// Props osoa egindako proposamenak
const props = defineProps({
    // Erakusteko datuak
    filas: {
        type: Array,
        default: () => []
    },
    // Taularen gaineko izenburua ("Kontsumible - Ikaslea")
    titulo: {
        type: String,
        default: ''
    },
    // Taularen lehenengo errenkadan lodia ("Kontsumible")
    etiquetaTabla: {
        type: String,
        default: ''
    },
    // Sortze botoiaren testua
    textoBtnCrear: {
        type: String,
        default: 'Sortu'
    },
    // Si true, oculta todos los controles (solo ver tabla)
    onlyView: {
        type: Boolean,
        default: false
    },
    // Taulan ez daitezke bistaratu osoa denean zutabeak
    columnasExcluidas: {
        type: Array,
        default: () => ['id', 'student_id', 'consumable_id', 'equipment_id', 'created_at', 'updated_at', 'deleted_at', 'consumable_category_id']
    },
    // Pertsonalizatutako goiburuaren mapa { gakoa: 'Ikusgarri testua' }
    mapaHeaders: {
        type: Object,
        default: () => ({ student_name: 'IKASLEA', item_name: 'PRODUKTUA' })
    },
    // Gelaxka baten testua ebakitzeko aurreko gehienezko luzera
    maxLongitud: {
        type: Number,
        default: 20
    }
})

// Sortu, editatu eta ezabatu emit-ak
defineEmits(['crear', 'editar', 'borrar'])

const route = useRoute()
const router = useRouter()
const isBezeroView = computed(() => {
    const name = route && route.name ? String(route.name).toLowerCase() : ''
    const path = route && route.path ? String(route.path).toLowerCase() : ''
    return name.includes('bezero') || path.includes('bezero')
})

const verHistorial = (fila) => {
    const id = fila && (fila.id || fila.student_id || fila.user_id)
    if (!id) return
    router.push({ name: 'historiala', query: { id } })
}

// Ikusgarri dauden goiburuak
const headersVisibles = computed(() => {
    if (!props.filas.length) return []
    const excluidos = props.columnasExcluidas.map(c => c.toLowerCase())
    return Object.keys(props.filas[0]).filter(h => !excluidos.includes(h.toLowerCase()))
})

// Laguntza funtzioak
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

<style scoped>
.btn-primary img,
.btn-danger img,
.btn-dark img {
    filter: brightness(0) invert(1);
    max-width: 24px;
}
</style>