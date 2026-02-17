<template>
    <teleport to="body">
        <div class="toast-wrapper">
            <transition-group name="toast">
                <div v-for="toast in toasts" :key="toast.id" class="toast-item" :class="toast.tipo">
                    <span class="toast-icon">{{ toast.tipo === 'success' ? '✓' : '✕' }}</span>
                    <span>{{ toast.mensaje }}</span>
                </div>
            </transition-group>
        </div>
    </teleport>
</template>

<script setup>
import { useToast } from '../composables/Movida_Necesarria_Use_Toast'
const { toasts } = useToast()
</script>

<style scoped>
.toast-wrapper {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.toast-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1.25rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.9rem;
    color: white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    min-width: 220px;
}

.toast-item.success {
    background-color: #22c55e;
}

.toast-item.error {
    background-color: #ef4444;
}

.toast-icon {
    font-size: 1rem;
    font-weight: 700;
}

/* Animación entrada/salida */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(12px);
}
</style>