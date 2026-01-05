<template>
  <!-- 页面根容器：仅保留背景图+标题+功能按钮 -->
  <div class="my-page">
    <!-- 顶部背景图区域 -->
    <div class="my-page__top-bg" :style="{ backgroundImage: `url(${bgImage})` }">
      <h1 class="my-page__title">资源库管理</h1>
    </div>

    <!-- 功能按钮区域（调整下移） -->
    <div class="my-page__buttons">
      <button class="my-page__btn" @click="goToAlbum">相册</button>
      <button class="my-page__btn" @click="goToTemplate">模板</button>
      <button class="my-page__btn" @click="goToEffect">特效</button>
      <button class="my-page__btn" @click="goToAR">素材</button>
      <button class="my-page__btn1" @click="goToclick">
        <div class="wrap">
        <img src="@/assets/icon/click.svg" alt="去拍照" class="img" />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
// 绝对路径导入背景图（确保Vite能识别）
import { useRouter, useRoute } from 'vue-router'
import myBgImage from '@/assets/images/my-bg.png'
const bgImage = myBgImage

// 路由跳转逻辑
const router = useRouter()
const route = useRoute()

// 按钮点击逻辑
const goToAlbum = () => router.push('/album')
const goToTemplate = () => router.push('/template')
const goToAR = () => router.push('/AR')
const goToEffect = () => router.push('/filter')
const goToclick = () => router.push('/')
</script>

<style scoped>
.my-page {
  width: 100vw;
  min-height: 100vh;
  background-color: #ffffff;
  overflow-x: hidden;
}

/* 顶部背景图：固定高度，确保显示完整 */
.my-page__top-bg {
  width: 100%;
  height: 280px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

/* “我的”标题样式 */
.my-page__title {
  position: absolute;
  top: 240px;
  left: 20px;
  font-size: 20px;
  color: #ffffff;
  font-weight: bold;
}

/* 功能按钮容器：核心调整 - 下移按钮 */
.my-page__buttons {
  padding: 20px 30px;
  /* 把负值改为正值，让按钮完全下移到背景图下方，数值可根据需求调整 */
  margin-top: 20px;
}

/* 按钮样式：保持和设计图一致 */
.my-page__btn {
  width: 100%;
  height: 60px;
  background-color: #f0e6e6;
  border: none;
  border-radius: 30px;
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  cursor: pointer;
}

.my-page__btn1 {
  width: 100%;
  height: 60px;
  background-color: #b199ad;
  border: none;
  border-radius: 30px;
  font-size: 20px;
  color: white;
  margin-bottom: 20px;
  cursor: pointer;
  font-weight: bold;
}
.wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.img {
  width: 40px;
  height: 40px;
}
</style>
