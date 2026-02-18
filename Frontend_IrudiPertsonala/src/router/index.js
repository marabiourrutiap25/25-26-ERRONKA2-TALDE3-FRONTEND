import { createRouter, createWebHistory } from "vue-router";
import Api from "@/composables/Api.js";
import Egutegiak from "../views/Egutegiak.vue";
import Ikasleak from "../views/Ikasleak.vue";
import Materialak from "../views/Materialak.vue";
import Produktuak from "../views/Produktuak.vue";
import Zerbitzuak from "../views/Zerbitzuak.vue";
import Bezeroak from "../views/Bezeroak.vue";
import Hitzorduak from "../views/Hitzorduak.vue";
import Mugimenduak from "../views/Mugimenduak.vue";
import Login from "../views/Login.vue";
import Txandak from "../views/Txandak.vue";
import Dashboard from "../views/Dashboard.vue";
import BezeroHistoriala from "@/views/BezeroHistoriala.vue";

const routes = [
  { path: "/", name: "login", component: Login },
  { path: "/dashboard", name: "dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/egutegiak", name: "egutegiak", component: Egutegiak, meta: { requiresAuth: true } },
  { path: "/ikasleak", name: "ikasleak", component: Ikasleak, meta: { requiresAuth: true } },
  { path: "/materialak", name: "materialak", component: Materialak, meta: { requiresAuth: true } },
  { path: "/produktuak", name: "produktuak", component: Produktuak, meta: { requiresAuth: true } },
  { path: "/zerbitzuak", name: "zerbitzuak", component: Zerbitzuak, meta: { requiresAuth: true } },
  { path: "/bezeroak", name: "bezeroak", component: Bezeroak, meta: { requiresAuth: true } },
  { path: "/hitzorduak", name: "hitzorduak", component: Hitzorduak, meta: { requiresAuth: true } },
  { path: "/mugimenduak", name: "mugimenduak", component: Mugimenduak, meta: { requiresAuth: true } },
  { path: "/txandak", name: "txandak", component: Txandak, meta: { requiresAuth: true } },
  { path: "/historiala", name: "historiala", component: BezeroHistoriala, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard: si la ruta requiere auth y no hay token, redirige a login
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !Api.isAuthenticated()) {
    return { name: "login" };
  }
  // Si ya está logeado e intenta ir al login, redirige a dashboard
  if (to.name === "login" && Api.isAuthenticated()) {
    return { name: "dashboard" };
  }
});

export default router;