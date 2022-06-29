import { createRouter, createWebHistory } from 'vue-router'
import TankkauksetView from '../views/TankkauksetView.vue'
import UusiTankkausView from '../views/UusiTankkausView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    }
  ]
})

export default router
