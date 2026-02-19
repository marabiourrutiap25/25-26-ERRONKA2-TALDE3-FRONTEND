<template>
  <SidebarMenu titulo="Produktuak" v-model="menuAbierto" />

  <div class="container">
    <ToastComponent />


    <div class="d-flex justify-content-between justify-content-md-end mt-5 mb-4">
      <div>
        <button class="btn btn-success text-white fw-bold" @click="abrirSacar">Produktua atera</button>
      </div>
    </div>

    <TaulaComponent :filas="Produktuak" titulo="Produktuak" etiqueta-tabla="Consumables"
      texto-btn-crear="Produktua Sortu"
      :mapa-headers="{ name: 'IZENA', description: 'DESKRIBAPENA', batch: 'LOTE', brand: 'MARKA', expiration_date: 'IRAUNGITZE-DATA', category_name: 'KATEGORIA' }"
      :columnas-excluidas="['id', 'consumable_category_id', 'created_at', 'updated_at', 'deleted_at']"
      @crear="abrirCrear" @editar="prepararEdicion" @borrar="borrar" />

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
                <input :id="key" v-model="form[key]" type="text" class="form-control custom-input"
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
import { ref, reactive, onMounted } from 'vue'
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
const formSacar = reactive({ student_id: '', consumable_id: '', quantity: 1 })

const modalRef = ref(null)
const modoEdicion = ref(false)
const form = reactive({})

const esCampoEditable = (key) => {
  const excluidos = ['id', 'consumable_category_id', 'category_name', 'created_at', 'updated_at', 'deleted_at']
  return !excluidos.includes(key.toLowerCase())
}

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