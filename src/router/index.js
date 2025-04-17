import { createRouter, createWebHistory } from 'vue-router'
import Start from '@/components/Start.vue'
import Game from '@/components/Game.vue'
import Result from '@/components/Result.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Start',
      component: Start
    },
    {
      path: '/game',
      name: 'Game',
      component: Game
    },
    {
      path: '/result',
      name: 'Result',
      component: Result
    }
  ]
})
export default router
//
