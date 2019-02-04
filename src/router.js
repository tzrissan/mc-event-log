import Router from 'vue-router'
import NewEvent from './views/NewEvent.vue'
import GasLog from './views/GasLog.vue'
import Maintenance from './views/Maintenance.vue'
import Tyres from './views/Tyres.vue'
import Stats from './views/Stats.vue'
import Misc from './views/Misc.vue'

const routes = [
  {
    path: '/',
    redirect: '/newevent'
  },
  {
    path: '/newevent',

    name: 'newevent',
    title: '+',
    component: NewEvent
  },
  {
    path: '/gaslog',
    name: 'gaslog',
    title: 'Tankkaukset',
    component: GasLog
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    title: 'Huollot',
    component: Maintenance
  },
  {
    path: '/tyres',
    name: 'tyres',
    title: 'Renkaat',
    component: Tyres
  },
  {
    path: '/stats',
    name: 'stats',
    title: 'Tilastot',
    component: Stats
  },
  {
    path: '/misc',
    name: 'misc',
    title: 'Muut',
    component: Misc
  }
]

export default new Router({ routes })

export const ROOT_ROUTES = routes.filter(r => !r.redirect).map(r => ({ path: r.path, title: r.title }))
