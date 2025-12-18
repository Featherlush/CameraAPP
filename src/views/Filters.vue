<template>
  <div class="template-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="滤镜"
      left-arrow
      @click-left="router.back()"
      background="#fff"
      color="#000"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, Search, Button, Icon } from 'vant';

const router = useRouter();
// 跳转到拍照界面
const gotoCamera = () => {
  router.push('/');
};

</script>

<style scoped>
.template-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

</style>
