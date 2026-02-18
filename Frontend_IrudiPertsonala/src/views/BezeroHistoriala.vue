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
                <div class="text-end small text-muted">ID: {{ c.id }}</div>
              </div>
              <div class="card-body">
                <div v-if="c._appointment_services && c._appointment_services.length">
                  <div v-for="(s, i) in c._appointment_services" :key="i" class="mb-2">
                    <div class="fw-semibold">{{ s.service_name || '-' }} <small class="text-muted">({{ s.category_name || '-' }})</small></div>
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

const cargarHistorial = async () => {
  if (!bezeroId) {
    loaded.value = true
    return
  }

  try {
    const resultado = await Api.cargarObjeto({ student_id: bezeroId }, 'appointments')
    citas.value = Array.isArray(resultado) ? resultado : (resultado?.data || resultado || [])

    // Para cada cita, cargar appointment_service y enriquecer con nombre de servicio y categoria
    await Promise.all(
      citas.value.map(async (c) => {
        try {
          let aps = await Api.cargarObjeto({ appointment_id: c.id }, 'appointment_service')
          aps = Array.isArray(aps) ? aps : (aps?.data || aps || [])

          const detalles = await Promise.all(
            aps.map(async (as) => {
              const comment = as.comments || as.comment || ''
              let serviceName = ''
              let categoryName = ''
              try {
                const svcRes = await Api.cargarObjeto({ id: as.service_id }, 'services')
                const svc = Array.isArray(svcRes) ? svcRes[0] : (svcRes?.data || svcRes || null)
                if (svc) {
                  serviceName = svc.name || svc.title || ''
                  const catId = svc.service_category_id || svc.category_id || svc.services_category_id || svc.service_category || null
                  if (catId) {
                    const catRes = await Api.cargarObjeto({ id: catId }, 'services_categories')
                    const cat = Array.isArray(catRes) ? catRes[0] : (catRes?.data || catRes || null)
                    categoryName = cat?.name || ''
                  }
                }
              } catch (err) {
                console.error('Error cargando servicio/categoria:', err)
              }

              return { comment, service_name: serviceName, category_name: categoryName }
            })
          )

          c._appointment_services = detalles
        } catch (err) {
          c._appointment_services = []
        }
      })
    )

    // No filtrar: mostrar también citas sin servicios (se renderizarán con mensaje 'Ez da zerbitzu informaziorik.')

    // Cargar nombre del cliente
    try {
      let cliente = await Api.cargarObjeto({ id: bezeroId }, 'clients')
      cliente = Array.isArray(cliente) ? cliente[0] : (cliente?.data || cliente || null)
      if (!cliente) {
        let stud = await Api.cargarObjeto({ id: bezeroId }, 'students')
        stud = Array.isArray(stud) ? stud[0] : (stud?.data || stud || null)
        cliente = stud
      }
      if (cliente) {
        const nombre = cliente.name || cliente.first_name || ''
        const apellido = cliente.surnames || cliente.last_name || ''
        bezeroNombre.value = `${nombre} ${apellido}`.trim()
      }
    } catch (err) {
      console.error('Error cargando cliente: ', err)
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

<style scoped></style>
