<template>
  <SidebarMenu titulo="Bezeroak" v-model="menuAbierto" />

  <div class="container">
    <ToastComponent />

    <TaulaComponent :filas="BezeroaFormateado" titulo="Bezeroak" etiqueta-tabla="Clients"
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
.custom-dialog {
  width: 100%;
  max-width: 450px;
  background: white;
}

.custom-dialog::backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.custom-label {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  color: #333;
  margin-bottom: 8px;
}

.custom-input {
  background-color: #f0f0f0;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-size: 0.95rem;
}

.custom-input:focus {
  background-color: #f0f0f0;
  box-shadow: 0 0 0 2px #3b82f6;
  outline: none;
}

.btn-close-custom {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.btn-cancel {
  background-color: #e9ecef;
  border-radius: 50px;
  color: #333;
  font-weight: 600;
  border: none;
}

.btn-save {
  background-color: #1d7eda;
  border-radius: 50px;
  color: white;
  font-weight: 500;
  border: none;
}
</style>
