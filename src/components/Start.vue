<template>
  <div class="start-page">
    <h1>您好呀!一起来玩游戏吧~</h1>
    <button @click="startGame">开始</button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  // 修正组件命名，使用多单词命名
  name: 'StartPageComponent',
  setup () {
    const router = useRouter()

    const startGame = () => {
      router.push('/game')
    }

    return {
      startGame
    }
  }
}
</script>

<style scoped>
.start-page {
  text-align: center;
  padding: 20px;
}
</style>
//
