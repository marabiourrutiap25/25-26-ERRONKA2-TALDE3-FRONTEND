<template>
  <SidebarMenu titulo="Taldeak" v-model="menuAbierto" />

  <div class="container">
    <ToastComponent />
    <div class="d-flex justify-content-end">
      <button class="btn btn-success text-white mt-4 fw-bold" @click="router.push('/egutegiak')">
        <img src="@/assets/ikusi.png" alt="Egutegiak Ikusi" />
        Egutegiak Ikusi</button>
    </div>
    
    <TaulaComponent :filas="taldeak" titulo="Taldeak" etiqueta-tabla="Groups" texto-btn-crear="Taldea Sortu"
      :mapa-headers="{ izena: 'TALDEAREN IZENA' }"
      :columnas-excluidas="['id', 'kide_1', 'kide_2', 'kide_3', 'kide_4', 'created_at', 'updated_at', 'deleted_at']" @crear="abrirCrear"
      @editar="prepararEdicion" @borrar="borrar" :only-view="!isRoleA" />

    <dialog ref="modalRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            Taldea {{ modoEdicion ? 'editatu' : 'sortu' }}
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardar">

            <!-- MEJORADO: Buscador con diseño de barra real (Lupa integrada) -->
            <div class="mb-4">
              <label for="buscarIkaslea" class="custom-label text-secondary fw-bold">IKASLEAK BILATU</label>
              <div class="input-group search-box-container">
                <span class="input-group-text bg-white border-end-0 rounded-start-3 text-secondary">
                  🔍
                </span>
                <input id="buscarIkaslea" v-model="filtroBusqueda" type="text" 
                  class="form-control border-start-0 rounded-end-3 custom-search-input"
                  placeholder="Idatzi ikasle baten izena..." />
              </div>
            </div>

            <div v-for="key in Object.keys(form)" :key="key">
              <div v-if="esCampoEditable(key)" class="mb-4">
                
                <label :for="key" class="custom-label">
                  {{ 
                    key === 'izena' ? 'TALDEAREN IZENA' : 
                    key === 'kide_1' ? '1. KIDEA' :
                    key === 'kide_2' ? '2. KIDEA' :
                    key === 'kide_3' ? '3. KIDEA' : '4. KIDEA'
                  }}
                </label>
                
                <!-- Nombre del grupo -->
                <input v-if="key === 'izena'" :id="key" v-model="form[key]" type="text" class="form-control custom-input"
                  placeholder="Sartu taldearen izena" required />

                <!-- Desplegables de los integrantes usando la lista FILTRADA -->
                <select v-else :id="key" v-model="form[key]" class="form-control custom-input" required>
                  <option value="" disabled>Hautatu ikasle bat...</option>
                  
                  <!-- Si el alumno ya está seleccionado en este grupo, se muestra siempre -->
                  <option v-if="form[key]" :value="form[key]">{{ form[key] }} (Hautatua)</option>
                  
                  <!-- Renderiza solo los alumnos que coinciden con el buscador -->
                  <option v-for="ikasle in ikasleFiltratuak" :key="ikasle" :value="ikasle">
                    {{ ikasle }}
                  </option>
                </select>

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
import { useRouter } from 'vue-router'
import Api from '../composables/Api.js'
import { useToast } from '../composables/UseToast.js'
import ToastComponent from '../components/ToastComponent.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import TaulaComponent from '@/components/TaulaComponent.vue'

const { ok, err } = useToast()
const router = useRouter()

const menuAbierto = ref(false)
const taldeak = ref([])
const modalRef = ref(null)
const modoEdicion = ref(false)
const form = reactive({})

const filtroBusqueda = ref("")

const isRoleA = computed(() => Api.isAdmin())

const ikasleak = ref([
  'Ane Agirre', 'Mikel Mendia', 'Jon Lopes', 'Sara Ortiz', 
  'Gorka Zubiri', 'Idoia Goikoetxea', 'Oier Urkizu', 'Nerea Elorza',
  'Xabi Alonso', 'Maite Larrañaga', 'Koldo Bilbao', 'Amaia Etxebarria',
  'Julen Guerrero', 'Iratxe Solana', 'Unai Vergara', 'Leire Martinez'
])

const ikasleFiltratuak = computed(() => {
  if (!filtroBusqueda.value) return ikasleak.value;
  return ikasleak.value.filter(ikasle => 
    ikasle.toLowerCase().includes(filtroBusqueda.value.toLowerCase())
  )
})

const esCampoEditable = (key) => {
  const excluidos = ['id', 'created_at', 'updated_at', 'deleted_at']
  return !excluidos.includes(key.toLowerCase())
}

const cargarDatos = async () => {
  try {
    taldeak.value = [
      { id: 1, izena: 'Alfa Taldea', kide_1: 'Ane Agirre', kide_2: 'Mikel Mendia', kide_3: 'Jon Lopes', kide_4: 'Sara Ortiz' },
      { id: 2, izena: 'Beta Taldea', kide_1: 'Gorka Zubiri', kide_2: 'Idoia Goikoetxea', kide_3: 'Oier Urkizu', kide_4: 'Nerea Elorza' },
      { id: 3, izena: 'Gamma Taldea', kide_1: 'Xabi Alonso', kide_2: 'Maite Larrañaga', kide_3: 'Koldo Bilbao', kide_4: 'Amaia Etxebarria' }
    ]
  } catch (e) {
    console.error("Errorea datuak kargatzean:", e)
    taldeak.value = []
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  filtroBusqueda.value = ""
  for (let k in form) delete form[k]
  
  form.izena = ""
  form.kide_1 = ""
  form.kide_2 = ""
  form.kide_3 = ""
  form.kide_4 = ""
  
  modalRef.value?.showModal()
}

const prepararEdicion = (fila) => {
  modoEdicion.value = true
  filtroBusqueda.value = ""
  for (let k in form) delete form[k]
  Object.assign(form, fila)
  modalRef.value?.showModal()
}

const cerrarModal = () => modalRef.value?.close()

const guardar = async () => {
  try {
    if (modoEdicion.value) {
      const index = taldeak.value.findIndex(t => t.id === form.id)
      if (index !== -1) taldeak.value[index] = { ...form }
      ok('Taldea ongi eguneratu da')
    } else {
      const nuevoId = taldeak.value.length ? Math.max(...taldeak.value.map(t => t.id)) + 1 : 1
      taldeak.value.push({ id: nuevoId, ...form })
      ok('Taldea ongi sortu da')
    }
    cerrarModal()
  } catch (e) {
    err(e.message || 'Errorea gordetzean')
  }
}

const borrar = async (id) => {
  if (!confirm('Ziur zaude ezabatu nahi duzulaz?')) return
  try {
    taldeak.value = taldeak.value.filter(t => t.id !== id)
    ok('Taldea ongi ezabatu da')
  } catch (e) {
    err(e.message || 'Errorea ezabatzean')
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
/* Estilos opcionales para un acabado premium de la barra de búsqueda */
.search-box-container .input-group-text {
  border: 1px solid #ced4da;
  padding-right: 0.5rem;
  font-size: 1.1rem;
}
.custom-search-input {
  box-shadow: none !important;
  border: 1px solid #ced4da;
  height: calc(2.5rem + 2px); /* Ajusta al alto de tus inputs */
}
.custom-search-input:focus {
  border-color: #86b7fe;
}
</style>