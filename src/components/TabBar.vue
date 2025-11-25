<template>
  <div>
    <van-tabbar v-model="active" v-if="$route.meta.showTabbar">
      <van-tabbar-item to="/">
        <span>主页</span>
        <template #icon="props">
          <img :src="props.active ? icon.homeactive : icon.homeinactive" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/album">
        <span>分类</span>
        <template #icon="props">
          <img :src="props.active ? icon.categoryactive : icon.categoryinactive" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/template">
        <span>讨论</span>
        <template #icon="props">
          <img :src="props.active ? icon.chatactive : icon.chatinactive" />
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/my">
        <span>我的</span>
        <template #icon="props">
          <img :src="props.active ? icon.myactive : icon.myinactive" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { ref } from 'vue'
export default {
  name: 'Tabbar',
  setup() {
    const active = ref(0)
    const icon = {
      homeactive: 'https://krseoul.imgtbl.com/i/2024/07/26/66a3a4db03689.png',
      homeinactive: 'https://krseoul.imgtbl.com/i/2024/07/26/66a3a4ce49e0a.png',
      categoryactive: 'https://krseoul.imgtbl.com/i/2024/07/26/66a3a4ce02516.png',
      categoryinactive: 'https://krseoul.imgtbl.com/i/2024/07/26/66a3ac700e3b8.png',
      chatactive: 'https://krseoul.imgtbl.com/i/2024/07/26/66a3a4e39de46.png',
      chatinactive: 'https://krseoul.imgtbl.com/i/2024/07/26/66a3a4ce2c368.png',
      myactive: 'https://krseoul.imgtbl.com/i/2024/07/26/66a3ad4a7525b.png',
      myinactive: 'https://krseoul.imgtbl.com/i/2024/07/26/66a3a4ce0c8ec.png',
    }
    return {
      icon,
      active,
    }
  },
}
</script>

<style scoped></style>
