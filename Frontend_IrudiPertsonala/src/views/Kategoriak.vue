<template>
  <SidebarMenu :titulo="'Kategoriak'" v-model="menuAbierto" />

  <div class="d-flex justify-content-center mb-4 my-5">
    <div class="btn-group" role="group">
      <button type="button" class="btn" :class="tablaActiva === 'materials' ? 'btn-dark' : 'btn-outline-dark'"
        @click="tablaActiva = 'materials'">
        Materialak
      </button>
      <button type="button" class="btn" :class="tablaActiva === 'products' ? 'btn-dark' : 'btn-outline-dark'"
        @click="tablaActiva = 'products'">
        Produktuak
      </button>
      <button type="button" class="btn" :class="tablaActiva === 'services' ? 'btn-dark' : 'btn-outline-dark'"
        @click="tablaActiva = 'services'">
        Zerbitzuak
      </button>
    </div>
  </div>

  <div class="container my-4">
    <ToastComponent />

    <TaulaComponent 
      :filas="filasActivas" 
      :titulo="configuracionTabla.titulo" 
      :etiqueta-tabla="configuracionTabla.etiqueta" 
      :texto-btn-crear="configuracionTabla.btnCrear"
      :mapa-headers="{ id: 'ID', name: 'IZENA / NOMBRE' }"
      :columnas-excluidas="['created_at', 'updated_at', 'deleted_at']" 
      @crear="abrirCrear"
      @editar="prepararEdicion" 
      @borrar="borrar" 
      :only-view="!isRoleA" 
    />

    <dialog ref="modalRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            {{ configuracionTabla.tituloSingular }} {{ modoEdicion ? 'editatu' : 'sortu' }}
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardar">

            <div class="mb-4">
              <label for="name" class="custom-label">KATEGORIAREN IZENA</label>
              <input id="name" v-model="form.name" type="text" class="form-control custom-input" required
                :placeholder="'Sartu ' + configuracionTabla.tituloSingular.toLowerCase() + ' izena...'" />
            </div>

            <div class="d-flex justify-content-end gap-3 pt-3">
              <button type="button" class="btn btn-cancel px-4" @click="cerrarModal">Kantzelatu</button>
              <button type="submit" class="btn btn-save px-4">Aldaketak Gorde</button>
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
import SidebarMenu from '@/components/SidebarMenu.vue'
import TaulaComponent from '@/components/TaulaComponent.vue'

const { ok, err } = useToast()

const menuAbierto = ref(false)
const modalRef = ref(null)
const modoEdicion = ref(false)
const tablaActiva = ref('materials') 
const form = reactive({ id: null, name: '' })

// Listas de datos reactivas
const Materials = ref([])
const Products = ref([])
const Services = ref([])

// Permisos del administrador
const isRoleA = computed(() => Api.isAdmin())

// Relación de endpoints correspondientes a tu backend
const endpoints = {
  materials: 'equipment',
  products: 'consumables',
  services: 'services'
}

// Retorna las filas de la pestaña activa
const filasActivas = computed(() => {
  if (tablaActiva.value === 'materials') return Materials.value
  if (tablaActiva.value === 'products') return Products.value
  return Services.value
})

// Textos dinámicos según la pestaña activa
const configuracionTabla = computed(() => {
  if (tablaActiva.value === 'materials') {
    return {
      titulo: 'Materialak',
      tituloSingular: 'Materiala',
      etiqueta: 'Equipment',
      btnCrear: 'Materiala Sortu'
    }
  } else if (tablaActiva.value === 'products') {
    return {
      titulo: 'Produktuak',
      tituloSingular: 'Produktua',
      etiqueta: 'Consumables',
      btnCrear: 'Produktua Sortu'
    }
  } else {
    return {
      titulo: 'Zerbitzuak',
      tituloSingular: 'Zerbitzua',
      etiqueta: 'Services',
      btnCrear: 'Zerbitzua Sortu'
    }
  }
})

// Carga simultánea de los datos de la API
const cargarDatos = async () => {
  try {
    const [resM, resP, resS] = await Promise.all([
      Api.cargarObjetos(endpoints.materials),
      Api.cargarObjetos(endpoints.products),
      Api.cargarObjetos(endpoints.services)
    ])
    
    // Mapeamos asegurando que siempre tengan al menos id y name
    Materials.value = (resM?.data || resM || []).map(i => ({ id: i.id, name: i.name }))
    Products.value = (resP?.data || resP || []).map(i => ({ id: i.id, name: i.name }))
    Services.value = (resS?.data || resS || []).map(i => ({ id: i.id, name: i.name }))
    
  } catch (e) {
    console.error("Errorea datuak kargatzean:", e)
    Materials.value = []
    Products.value = []
    Services.value = []
  }
}

// Prepara el formulario limpio para crear un nuevo registro
const abrirCrear = () => {
  modoEdicion.value = false
  form.id = null
  form.name = ""
  modalRef.value?.showModal()
}

// Carga los datos de la fila seleccionada en el formulario para editar
const prepararEdicion = (fila) => {
  modoEdicion.value = true
  form.id = fila.id
  form.name = fila.name
  modalRef.value?.showModal()
}

const cerrarModal = () => modalRef.value?.close()

const guardar = async () => {
  try {
    const endpoint = endpoints[tablaActiva.value]
    const payload = { name: form.name }
    
    let res
    if (modoEdicion.value) {
      res = await Api.aldatuObjeto({ id: form.id, ...payload }, endpoint)
    } else {
      res = await Api.crearObjektua(payload, endpoint)
    }
    
    if (res) {
      cerrarModal()
      await cargarDatos()
      ok(res.message || 'Kategoria ongi gorde da!')
    }
  } catch (e) {
    err(e.message || 'Errore bat gertatu da gordetzerakoan')
  }
}

const borrar = async (fila) => {
  const id = fila?.id || fila
  if (!confirm('Ziur zaude kategoria hau ezabatu nahi duzulaz?')) return
  try {
    const endpoint = endpoints[tablaActiva.value]
    const res = await Api.ezabatuObjektua({ id }, endpoint)
    if (res) {
      await cargarDatos()
      ok(res.message || 'Kategoria ezabatu egin da')
    }
  } catch (e) {
    err(e.message || 'Errore bat gertatu da ezabatzerakoan')
  }
}

onMounted(cargarDatos)
</script>