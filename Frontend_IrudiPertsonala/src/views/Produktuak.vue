<template>
  <SidebarMenu titulo="Produktuak" v-model="menuAbierto" />

  <div class="container">
    <ToastComponent />

    <div class="d-flex justify-content-between justify-content-md-end mt-5 mb-4 gap-3">
      <div>
        <button class="btn btn-warning position-relative" @click="mostrarAlertasStock">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742.37.142.646.335.646.635C4.186 10.864 7.06 12 8 12s3.814-1.136 3.813-2.623c0-.3.276-.493.646-.635C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12.896a1 1 0 0 1-.646.605l.645-.645zm.738-.154a.993.993 0 0 1-.27.36l.27-.36z"/>
          </svg>
          <span v-if="productosStockBajo.length > 0" class="badge bg-danger position-absolute top-0 start-100 translate-middle">
            {{ productosStockBajo.length }}
          </span>
        </button>
      </div>
      <div>
        <button class="btn btn-success text-white fw-bold" @click="abrirSacar">Produktua atera</button>
      </div>
    </div>

    <TaulaComponent :filas="Produktuak" titulo="Produktuak" etiqueta-tabla="Consumables"
      texto-btn-crear="Produktua Sortu"
      :mapa-headers="{ name: 'IZENA', description: 'DESKRIBAPENA', batch: 'LOTE', brand: 'MARKA', expiration_date: 'IRAUNGITZE-DATA', category_name: 'KATEGORIA', stock: 'STOCK', min_stock: 'MIN STOCK' }"
      :columnas-excluidas="['id', 'consumable_category_id', 'created_at', 'updated_at', 'deleted_at']"
      :filas-marcadas="productosStockBajo.map(p => p.id)"
      @crear="abrirCrear" @editar="prepararEdicion" @borrar="borrar" />

    <!-- Modal Alertas de Stock -->
    <dialog ref="modalAlertasRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" class="me-2">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742.37.142.646.335.646.635C4.186 10.864 7.06 12 8 12s3.814-1.136 3.813-2.623c0-.3.276-.493.646-.635C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12.896a1 1 0 0 1-.646.605l.645-.645zm.738-.154a.993.993 0 0 1-.27.36l.27-.36z"/>
            </svg>
            Alertak - Stock baxua
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModalAlertas">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <div v-if="productosStockBajo.length === 0" class="alert alert-info">
            Ez dago produkturik stock baxua dena.
          </div>

          <div v-else class="alertas-list">
            <div v-for="producto in productosStockBajo" :key="producto.id" class="alert alert-danger alert-dismissible fade show">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="alert-heading">{{ producto.name }}</h6>
                  <div class="small">
                    <p class="mb-1">
                      <strong>Stock actual:</strong> {{ producto.stock ?? 0 }}
                    </p>
                    <p class="mb-1">
                      <strong>Stock minimoa:</strong> {{ producto.min_stock ?? 0 }}
                    </p>
                    <p class="mb-0">
                      <strong>Falta:</strong> 
                      <span class="badge bg-danger">{{ (producto.min_stock ?? 0) - (producto.stock ?? 0) }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>

    <dialog ref="modalSacarRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">Produktua Atera</h4>
          <button type="button" class="btn-close-custom" @click="cerrarModalSacar">✕</button>
        </div>
        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardarSacar">
            <div class="mb-4">
              <label class="custom-label">IKASLEA</label>
              <select v-model="formSacar.student_id" class="form-control custom-input" required>
                <option value="" disabled>Ikasle bat hautatu</option>
                <option v-for="a in listaAlumnos" :key="a.id" :value="a.id">
                  {{ a.name }} {{ a.surnames }}
                </option>
              </select>
            </div>
            <div class="mb-4">
              <label class="custom-label">PRODUKTUA</label>
              <select v-model="formSacar.consumable_id" class="form-control custom-input" required>
                <option value="" disabled>Produktua hautatu</option>
                <option v-for="c in listaConsumables" :key="c.id" :value="c.id" :disabled="!c.stock || c.stock < 1">
                  {{ c.name }} (Stock: {{ c.stock ?? '?' }})
                </option>
              </select>
            </div>
            <div class="mb-4">
              <label class="custom-label">KOPURUA</label>
              <input v-model="formSacar.quantity" type="number" min="1" class="form-control custom-input" required
                placeholder="Kopurua" />
            </div>
            <div class="d-flex justify-content-end gap-3 pt-3">
              <button type="button" class="btn btn-cancel px-4" @click="cerrarModalSacar">Kantzelatu</button>
              <button type="submit" class="btn btn-save px-4">Sartu</button>
            </div>
          </form>
        </div>
      </div>
    </dialog>

    <dialog ref="modalRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            Produktua {{ modoEdicion ? 'editatu' : 'sortu' }}
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardar">

            <div class="mb-4">
              <label class="custom-label">KATEGORIA</label>
              <select v-model="form.consumable_category_id" class="form-control custom-input" required>
                <option value="" disabled>Kategoria bat hautatu</option>
                <option v-for="cat in listaCategorias" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div v-for="key in Object.keys(form)" :key="key">
              <div v-if="esCampoEditable(key)" class="mb-4">
                <label :for="key" class="custom-label">{{ key.toUpperCase().replace(/_/g, ' ') }}</label>
                <input :id="key" v-model="form[key]" :type="key === 'stock' || key === 'min_stock' ? 'number' : 'text'" class="form-control custom-input"
                  :placeholder="'Sartu  ' + key" />
              </div>
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
import TaulaComponent from '@/components/TaulaComponent.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'

const { ok, err } = useToast()

const menuAbierto = ref(false)

const Produktuak = ref([])
const listaCategorias = ref([])
const tableName = "consumables"
const listaAlumnos = ref([])
const listaConsumables = ref([])
const modalSacarRef = ref(null)
const modalAlertasRef = ref(null)
const formSacar = reactive({ student_id: '', consumable_id: '', quantity: 1 })

const modalRef = ref(null)
const modoEdicion = ref(false)
const form = reactive({})

const esCampoEditable = (key) => {
  const excluidos = ['id', 'consumable_category_id', 'category_name', 'created_at', 'updated_at', 'deleted_at']
  return !excluidos.includes(key.toLowerCase())
}

// Computed para productos con stock bajo
const productosStockBajo = computed(() => {
  return Produktuak.value.filter(producto => {
    const stock = producto.stock ?? 0
    const minStock = producto.min_stock ?? 0
    return stock < minStock && minStock > 0
  })
})

const cargarDatos = async () => {
  try {
    const [resConsumables, resCat, resAlumnos, resConsumablesList] = await Promise.all([
      Api.cargarObjetos(tableName),
      Api.cargarObjetos("consumable-categories"),
      Api.cargarObjetos("students"),
      Api.cargarObjetos("consumables")
    ])
    listaCategorias.value = resCat?.data || resCat || []
    const consumablesRaw = resConsumables?.data || resConsumables || []
    Produktuak.value = consumablesRaw.map(item => {
      const cat = listaCategorias.value.find(c => c.id === item.consumable_category_id)
      return { ...item, category_name: cat ? cat.name : `ID: ${item.consumable_category_id}` }
    })
    listaAlumnos.value = resAlumnos?.data || resAlumnos || []
    listaConsumables.value = resConsumablesList?.data || resConsumablesList || []
  } catch (e) {
    console.error("Error cargando datos:", e)
    Produktuak.value = []
    listaAlumnos.value = []
    listaConsumables.value = []
  }
}

const abrirSacar = () => {
  formSacar.student_id = ''
  formSacar.consumable_id = ''
  formSacar.quantity = 1
  modalSacarRef.value?.showModal()
}

const cerrarModalSacar = () => modalSacarRef.value?.close()

const mostrarAlertasStock = () => {
  modalAlertasRef.value?.showModal()
}

const cerrarModalAlertas = () => modalAlertasRef.value?.close()

const guardarSacar = async () => {
  try {
    const selected = listaConsumables.value.find(c => c.id == formSacar.consumable_id)
    const stock = selected?.stock ?? 0
    const qty = Number(formSacar.quantity)
    if (!selected) {
      err('Debes seleccionar un producto')
      return
    }
    if (stock < 1) {
      err('No hay stock disponible de este producto')
      return
    }
    if (qty > stock) {
      err('No puedes sacar más de lo disponible (stock: ' + stock + ')')
      return
    }
    // Automatiko eguna
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const date = `${yyyy}-${mm}-${dd}`
    const payload = {
      student_id: formSacar.student_id,
      consumable_id: formSacar.consumable_id,
      date,
      quantity: qty
    }
    // Mugimenduen endpointa
    const res = await Api.crearObjektua(payload, 'student-consumables')
    if (res) {
      // Produktuaren stock-a eguneratu (eremu guztiak bidaltzea)
      const productoCompleto = { ...selected, stock: stock - qty }
      // Irakurri-soilik datuak kendu
      delete productoCompleto.created_at
      delete productoCompleto.updated_at
      delete productoCompleto.deleted_at
      delete productoCompleto.category_name
      await Api.aldatuObjeto(productoCompleto, 'consumables')
      cerrarModalSacar()
      await cargarDatos()
      ok(res.message || 'Producto sacado correctamente')
    }
  } catch (e) {
    err(e.message || 'Error al sacar producto')
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  for (let k in form) delete form[k]
  if (Produktuak.value.length > 0) {
    Object.keys(Produktuak.value[0]).forEach(key => { if (esCampoEditable(key)) form[key] = "" })
  }
  form.consumable_category_id = ""
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
    const { id, category_name, created_at, updated_at, deleted_at, ...payload } = form
    let res
    if (modoEdicion.value) res = await Api.aldatuObjeto({ id, ...payload }, tableName)
    else res = await Api.crearObjektua(payload, tableName)
    if (res) {
      cerrarModal()
      await cargarDatos()
      ok(res.message || (modoEdicion.value ? 'Consumable actualizado correctamente' : 'Consumable creado correctamente'))
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
      ok(res.message || 'Consumable eliminado correctamente')
    }
  } catch (e) {
    err(e.message || 'Error al eliminar')
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.alertas-list {
  max-height: 500px;
  overflow-y: auto;
}

.alertas-list .alert {
  border-left: 4px solid #dc3545;
  margin-bottom: 1rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.65rem;
}
</style>