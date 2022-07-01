import { createRouter, createWebHashHistory } from 'vue-router'
import TankkauksetView from '../views/TankkauksetView.vue'
import UusiTankkausView from '../views/UusiTankkausView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'uusi tankkaus',
      component: UusiTankkausView
    },
    /*{
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },*/
    {
      path: '/tankkaukset',
      name: 'tankkaukset',
      component: TankkauksetView
    },
    {
      path: '/huollot',
      name: 'huollot',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/HuollotView.vue')
    },
    {
      path: '/renkaat',
      name: 'renkaat',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/RenkaatView.vue')
    },
    {
      path: '/ajokaudet',
      name: 'ajokaudet',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Ajokaudet.vue')
    }
  ]
})

export default router
