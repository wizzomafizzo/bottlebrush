import { createRouter, createWebHashHistory } from "vue-router";
import Controller from "@/components/Controller.vue";

const routes = [{ path: "/controller", component: Controller }];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
