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
      homeactive: '',
      homeinactive: '',
      categoryactive: '',
      categoryinactive: '',
      chatactive: '',
      chatinactive: '',
      myactive: '',
      myinactive: '',
    }
    return {
      icon,
      active,
    }
  },
}
</script>

<style scoped></style>
