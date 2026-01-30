<template>
  <div class="dashboard">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="#">
          <span class="me-2">✂️</span>
          <span>Irudi Pertsonala</span>
        </a>
        <button 
          class="btn btn-outline-light btn-sm" 
          @click="$emit('cerrar-sesion')"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>

    <!-- Contenido principal -->
    <div class="container py-5">
      <div class="text-center">
        <h2>¡Bienvenido al Panel de Administración!</h2>
        <p class="text-muted">Sistema de gestión para la peluquería</p>
      </div>

      <!-- Cards de acceso rápido -->
      <div class="row mt-5 g-4">
        <div class="col-md-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <div class="icon-circle bg-primary text-white mx-auto mb-3">📅</div>
              <h5 class="card-title">Citas</h5>
              <p class="card-text text-muted">Gestiona las citas de los clientes</p>
              <button class="btn btn-outline-primary">Ver citas</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <div class="icon-circle bg-success text-white mx-auto mb-3">👥</div>
              <h5 class="card-title">Clientes</h5>
              <p class="card-text text-muted">Administra la información de clientes</p>
              <button class="btn btn-outline-success">Ver clientes</button>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <div class="icon-circle bg-warning text-white mx-auto mb-3">💇</div>
              <h5 class="card-title">Servicios</h5>
              <p class="card-text text-muted">Configura los servicios ofrecidos</p>
              <button class="btn btn-outline-warning">Ver servicios</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['cerrar-sesion'])
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.navbar-brand {
  font-weight: 600;
}

.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.card {
  border: none;
  border-radius: 15px;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
}
</style>
