<template>
  <SidebarMenu titulo="Historiala" v-model="menuAbierto" />
  <div class="container mt-4">
    <h4 class="mb-3">Historiala - {{ bezeroNombre || ' ' }}</h4>

    <div v-if="!loaded">Historiala kargatzen...</div>

    <div v-else>
      <div v-if="citas.length">
        <div class="row">
          <div class="col-md-6 mb-3" v-for="c in citas" :key="c.id">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-start">
                <div>
                  <div class="fw-bold">{{ c.date }}</div>
                  <div class="text-muted small">{{ c.start_time }} - {{ c.end_time }}</div>
                </div>
              </div>
              <div class="card-body">
                <div v-if="c._appointment_services && c._appointment_services.length">
                  <div v-for="(s, i) in c._appointment_services" :key="i" class="mb-2">
                    <div class="fw-semibold">
                      {{ s.service_name || '-' }}
                      <small class="text-muted">({{ s.category_name || '-' }})</small>
                    </div>
                    <div class="text-muted">{{ s.comment || '-' }}</div>
                  </div>
                </div>
                <div v-else class="text-muted">Ez da zerbitzu informaziorik.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>Bezero hau ez du historialarik.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SidebarMenu from '@/components/SidebarMenu.vue'
import Api from '@/composables/Api.js'

const menuAbierto = ref(false)
const route = useRoute()
const bezeroId = route.query.id || route.params.id || null
const citas = ref([])
const loaded = ref(false)
const bezeroNombre = ref('')

const normalizeArray = (res) => {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (res.data && Array.isArray(res.data)) return res.data
  return [res]
}

const cargarHistorial = async () => {
  if (!bezeroId) {
    loaded.value = true
    return
  }

  try {
    // Cargar appointments del cliente
    let appointmentsRes = await Api.cargarObjeto({ client_id: bezeroId }, 'appointments')
    let appointments = normalizeArray(appointmentsRes)

    if (!appointments.length) {
      citas.value = []
      loaded.value = true
      return
    }

    // Cargar todos los services y categories
    const servicesRes = await Api.cargarObjeto({}, 'services')
    const categoriesRes = await Api.cargarObjeto({}, 'services_categories')
    const services = normalizeArray(servicesRes)
    const categories = normalizeArray(categoriesRes)
    const servicesMap = new Map(services.map(s => [s.id, s]))
    const categoriesMap = new Map(categories.map(c => [c.id, c]))

    // Cargar appointment_service de cada cita en paralelo
    const citasConServicios = await Promise.all(
      appointments.map(async (c) => {
        let apsRes = await Api.cargarObjeto({ appointment_id: c.id }, 'appointment_service')
        let aps = normalizeArray(apsRes)

        const _appointment_services = aps.map(as => {
          const svc = servicesMap.get(as.service_id)
          const cat = svc ? categoriesMap.get(svc.service_category_id) : null
          return {
            comment: as.comment || as.comments || '',
            service_name: svc?.name || '',
            category_name: cat?.name || ''
          }
        })

        return { ...c, _appointment_services }
      })
    )

    // Filtrar solo citas que tengan al menos un servicio
    citas.value = citasConServicios.filter(c => c._appointment_services.length > 0)

    // Cargar nombre del cliente
    let clienteRes = await Api.cargarObjeto({ id: bezeroId }, 'clients')
    let cliente = normalizeArray(clienteRes)[0]
    if (!cliente) {
      let studRes = await Api.cargarObjeto({ id: bezeroId }, 'students')
      cliente = normalizeArray(studRes)[0]
    }

    if (cliente) {
      const nombre = cliente.name || cliente.first_name || ''
      const apellido = cliente.surnames || cliente.last_name || ''
      bezeroNombre.value = `${nombre} ${apellido}`.trim()
    }

  } catch (e) {
    console.error('Error cargando historial: ', e)
    citas.value = []
  } finally {
    loaded.value = true
  }
}

onMounted(cargarHistorial)
</script>
