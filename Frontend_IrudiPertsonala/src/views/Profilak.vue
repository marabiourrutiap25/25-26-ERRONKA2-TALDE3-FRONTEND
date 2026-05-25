<template>
  <SidebarMenu titulo="Erabiltzaileak" v-model="menuAbierto" />

  <div class="container">
    <ToastComponent />
    <div class="d-flex justify-content-end">
      <button class="btn btn-success text-white mt-4 fw-bold" @click="router.push('/egutegiak')">
        <img src="@/assets/ikusi.png" alt="Egutegiak Ikusi" />
        Egutegiak Ikusi</button>
    </div>
    
    <!-- Mapeo adaptado exactamente a los campos del modelo de Laravel -->
    <TaulaComponent :filas="erabiltzaileak" titulo="Erabiltzaileak" etiqueta-tabla="Users" texto-btn-crear="Erabiltzailea Sortu"
      :mapa-headers="{ username: 'ERABILTZAILEA', email: 'EMAILA', password: 'PASAHITZA', rol: 'ROLA' }"
      :columnas-excluidas="['id', 'remember_token', 'created_at', 'updated_at', 'deleted_at']" @crear="abrirCrear"
      @editar="prepararEdicion" @borrar="borrar" :only-view="!isRoleA" />

    <dialog ref="modalRef" class="custom-dialog p-0 border-0 shadow-lg rounded-4">
      <div class="modal-content border-0">
        <div class="modal-header border-bottom-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <h4 class="modal-title fw-bold text-dark">
            Erabiltzailea {{ modoEdicion ? 'editatu' : 'sortu' }}
          </h4>
          <button type="button" class="btn-close-custom" @click="cerrarModal">✕</button>
        </div>

        <div class="modal-body px-4 pb-4">
          <form @submit.prevent="guardar">

            <div v-for="key in Object.keys(form)" :key="key">
              <div v-if="esCampoEditable(key)" class="mb-4">
                <label :for="key" class="custom-label">{{ key.toUpperCase().replace(/_/g, ' ') }}</label>
                
                <!-- Selector específico para el campo 'rol' acorde al modelo -->
                <select v-if="key === 'rol'" :id="key" v-model="form[key]" class="form-control custom-input" required>
                  <option value="Administratzaile">Administratzaile</option>
                  <option value="Erabiltzaile">Erabiltzaile</option>
                </select>

                <!-- Input dinámico adaptado a 'password' si coincide con la columna -->
                <input v-else :id="key" v-model="form[key]" :type="key === 'password' ? 'password' : 'text'" class="form-control custom-input"
                  :placeholder="'Sartu ' + key" required />
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
const erabiltzaileak = ref([])
const modalRef = ref(null)
const modoEdicion = ref(false)
const form = reactive({})

const isRoleA = computed(() => Api.isAdmin())

const esCampoEditable = (key) => {
  const excluidos = ['id', 'remember_token', 'created_at', 'updated_at', 'deleted_at']
  return !excluidos.includes(key.toLowerCase())
}

// Datos mockeados basados en las propiedades del $fillable del modelo User
const cargarDatos = async () => {
  try {
    erabiltzaileak.value = [
      { id: 1, username: 'ane_agirre', email: 'ane.agirre@example.com', password: '********', rol: 'Administratzaile', remember_token: null },
      { id: 2, username: 'mikel_m', email: 'mikel.mendia@example.com', password: '********', rol: 'Erabiltzaile', remember_token: null },
      { id: 3, username: 'jon_lopes', email: 'jon.lopes@example.com', password: '********', rol: 'Erabiltzaile', remember_token: null },
      { id: 4, username: 'sara_ortiz', email: 'sara.ortiz@example.com', password: '********', rol: 'Administratzaile', remember_token: null },
      { id: 5, username: 'gorka_zub', email: 'gorka.zubiri@example.com', password: '********', rol: 'Erabiltzaile', remember_token: null }
    ]
  } catch (e) {
    console.error("Error cargando datos:", e)
    erabiltzaileak.value = []
  }
}

const abrirCrear = () => {
  modoEdicion.value = false
  for (let k in form) delete form[k]
  
  // Campos idénticos a los definidos en el array $fillable de Laravel
  form.username = ""
  form.email = ""
  form.password = ""
  form.rol = "Erabiltzaile"
  
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
    if (modoEdicion.value) {
      const index = erabiltzaileak.value.findIndex(u => u.id === form.id)
      if (index !== -1) erabiltzaileak.value[index] = { ...form }
      ok('User actualizado correctamente')
    } else {
      const nuevoId = erabiltzaileak.value.length ? Math.max(...erabiltzaileak.value.map(u => u.id)) + 1 : 1
      erabiltzaileak.value.push({ id: nuevoId, ...form, remember_token: null })
      ok('User creado correctamente')
    }
    cerrarModal()
  } catch (e) {
    err(e.message || 'Error al guardar')
  }
}

const borrar = async (id) => {
  if (!confirm('Ziur zaude ezabatu nahi duzulaz?')) return
  try {
    erabiltzaileak.value = erabiltzaileak.value.filter(u => u.id !== id)
    ok('User eliminado correctamente')
  } catch (e) {
    err(e.message || 'Error al eliminar')
  }
}

onMounted(cargarDatos)
</script>