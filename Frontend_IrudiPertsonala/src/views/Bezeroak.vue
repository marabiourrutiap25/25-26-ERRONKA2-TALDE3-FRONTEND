<template>
  <SidebarMenu titulo="Bezeroak" v-model="menuAbierto" />

  <div class="container">
    <ToastComponent />

    <!-- Buscador -->
    <div class="search-container mb-4">
      <div class="search-wrapper">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.2.283.487.529.846.708l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a7 7 0 0 0 .078-.86Z"/>
        </svg>
        <input 
          v-model="busqueda" 
          type="text" 
          class="search-input" 
          placeholder="Bilatu izena, abizenak edo telefonoa..."
        />
        <button v-if="busqueda" @click="busqueda = ''" class="clear-btn">✕</button>
      </div>
    </div>

    <TaulaComponent :filas="BezeroaFiltrado" titulo="Bezeroak" etiqueta-tabla="Clients"
      :mapa-headers="{ name: 'IZENA', surnames: 'ABIZENAK', telephone: 'TELEFONOA', home_client: 'MOTA' }"
      texto-btn-crear="Bezeroa Sortu" @crear="abrirCrear" @editar="prepararEdicion" @borrar="borrar" />

    <dialog ref="modalRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            Bezeroa {{ modoEdicion ? 'editatu' : 'sortu' }}
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardar">
            <div v-for="key in Object.keys(form)" :key="key">
              <div v-if="esCampoEditable(key)" class="mb-4">
                <label :for="key" class="custom-label">
                  {{ key.toUpperCase().replace(/_/g, ' ') }}
                </label>

                <!-- SELECT solo para home_client -->
                <select v-if="key === 'home_client'" :id="key" v-model.number="form[key]"
                  class="form-control custom-input">
                  <option :value="0">Kanpokoa</option>
                  <option :value="1">Etxekoa</option>
                </select>

                <!-- INPUT normal -->
                <input v-else :id="key" v-model="form[key]" type="text" class="form-control custom-input"
                  :placeholder="'Sartu ' + key" />
              </div>
            </div>

            <div class="d-flex justify-content-end gap-3 pt-3">
              <button type="button" class="btn btn-cancel px-4" @click="cerrarModal">
                Kantzelatu
              </button>
              <button type="submit" class="btn btn-save px-4">
                Aldaketak Gorde
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import Api from '../composables/Api.js'
import { useToast } from '../composables/UseToast.js'
import ToastComponent from '../components/ToastComponent.vue'
import TaulaComponent from '@/components/TaulaComponent.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'

const { ok, err } = useToast()

const menuAbierto = ref(false)
const Bezeroa = ref([])
const busqueda = ref('')
const tableName = "clients"

const modalRef = ref(null)
const modoEdicion = ref(false)
const form = reactive({})

const esCampoEditable = (key) => {
  const excluidos = ['id', 'created_at', 'updated_at', 'deleted_at']
  return !excluidos.includes(key.toLowerCase())
}

const cargarDatos = async () => {
  try {
    const res = await Api.cargarObjetos(tableName)
    Bezeroa.value = res?.data || res || []
  } catch (e) {
    console.error("Error cargando datos:", e)
    Bezeroa.value = []
  }
}

/* Taula txikitzeko testua erakusteko soilik */
const BezeroaFormateado = computed(() =>
  Bezeroa.value.map(item => ({
    ...item,
    home_client: item.home_client == 1 ? 'Etxekoa' : 'Kanpokoa'
  }))
)

/* Filtrar por búsqueda */
const BezeroaFiltrado = computed(() => {
  if (!busqueda.value.trim()) {
    return BezeroaFormateado.value
  }

  const termino = busqueda.value.toLowerCase().trim()
  
  return BezeroaFormateado.value.filter(bezeroa => 
    bezeroa.name?.toLowerCase().includes(termino) ||
    bezeroa.surnames?.toLowerCase().includes(termino) ||
    bezeroa.telephone?.toLowerCase().includes(termino)
  )
})

const abrirCrear = () => {
  modoEdicion.value = false
  for (let k in form) delete form[k]

  if (Bezeroa.value.length > 0) {
    Object.keys(Bezeroa.value[0]).forEach(key => {
      if (esCampoEditable(key)) {
        form[key] = key === 'home_client' ? 0 : ""
      }
    })
  }

  modalRef.value?.showModal()
}

const prepararEdicion = (fila) => {
  modoEdicion.value = true
  for (let k in form) delete form[k]
  Object.assign(form, fila)
  modalRef.value?.showModal()
}

const cerrarModal = () => modalRef.value?.close()

const guardar = async () => {
  try {
    const { id, created_at, updated_at, deleted_at, ...payload } = form

    let res
    if (modoEdicion.value)
      res = await Api.aldatuObjeto({ id, ...payload }, tableName)
    else
      res = await Api.crearObjektua(payload, tableName)

    if (res) {
      cerrarModal()
      await cargarDatos()
      ok(
        res.message ||
        (modoEdicion.value
          ? 'Client actualizado correctamente'
          : 'Client creado correctamente')
      )
    }
  } catch (e) {
    err(e.message || 'Error al guardar')
  }
}

const borrar = async (id) => {
  if (!confirm('Ziur zaude ezabatu nahi duzulaz?')) return

  try {
    const res = await Api.ezabatuObjektua({ id }, tableName)
    if (res) {
      await cargarDatos()
      ok(res.message || 'Client eliminado correctamente')
    }
  } catch (e) {
    err(e.message || 'Error al eliminar')
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2c4666;
  box-shadow: 0 0 0 3px rgba(44, 70, 102, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #333;
}
</style>