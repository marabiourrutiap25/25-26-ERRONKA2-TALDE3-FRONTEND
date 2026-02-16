import { createRouter, createWebHistory } from "vue-router";
import Egutegiak from "../views/Egutegiak.vue";
import Ikasleak from "../views/Ikasleak.vue";
import Materialak from "../views/Materialak.vue";
import Produktuak from "../views/Produktuak.vue";
import Zerbitzuak from "../views/Zerbitzuak.vue";
import Menu from "../views/Menu.vue";
import Bezeroak from "../views/Bezeroak.vue";
import Hitzorduak from "../views/Hitzorduak.vue";
import Mugimenduak from "../views/Mugimenduak.vue";
import Saioa from "../views/Saioa-Hasi.vue";
import Txandak from "../views/Txandak.vue";


const routes = [
  { path: "/egutegiak", component: Egutegiak },
  { path: "/ikasleak", component: Ikasleak },
  { path: "/materialak", component: Materialak },
  { path: "/produktuak", component: Produktuak },
  { path: "/zerbitzuak", component: Zerbitzuak },
  { path: "/menu", component: Menu },
  { path: "/bezeroak", component: Bezeroak },
  { path: "/hitzorduak", component: Hitzorduak },
  { path: "/mugimenduak", component: Mugimenduak },
  { path: "/", component: Saioa },
  { path: "/txandak", component: Txandak },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;