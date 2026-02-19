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
import { useToast } from '../composables/UseToast'
const { toasts } = useToast()
</script>