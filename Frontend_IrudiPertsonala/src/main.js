import { createApp } from 'vue'
import { createPinia } from "pinia";
import App from './App.vue'
import router from "./router";

// Bootstrap CSS eta JS inportatu (aukerakoa JS-a baldin eta estiloak soilik erabiltzen badituzu)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/scss/styles.scss'

// SASS estiloakimport './styles/styles.scss'

createApp(App).use(router).use(createPinia()).mount('#app')