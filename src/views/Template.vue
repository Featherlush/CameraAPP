<template>
  <div class="template-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="模板"
      left-arrow
      @click-left="router.back()"
      background="#fff"
      color="#000"
    />

    <!-- 模板列表 -->
    <div class="template-list">
      <div
        v-for="template in templateList"
        :key="template.type"
        class="template-item"
        @click="selectTemplate(template)"
      >
        <span class="template-name">{{ template.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar } from 'vant';

const router = useRouter();

// 核心：预定义所有模板的最终渲染配置（包含DOM结构+样式）
const templateList = ref([
  // 1. 拍立得模板
  {
    type: 'polaroid',
    name: '拍立得边框',
    cover: 'https://via.placeholder.com/300x400?text=拍立得模板',
    renderConfig: {
      type: 'frame',
      style: `
        top: 20px;
        left: 20px;
        right: 20px;
        bottom: 60px;
        border: 10px solid #fff;
        border-radius: 4px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
        pointer-events: none;
        position: absolute;
        box-sizing: border-box;
      `
    }
  },
  // 2. 胶片模板
  {
    type: 'film',
    name: '胶片边框',
    cover: 'https://via.placeholder.com/300x400?text=胶片模板',
    renderConfig: {
      type: 'filmFrame',
      mainStyle: `
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 20px solid #1a1a1a;
        background: linear-gradient(90deg, transparent 0%, transparent 4px, #000 4px, #000 8px, transparent 8px, transparent 92%, #000 92%, #000 96px, transparent 96px);
        pointer-events: none;
        position: absolute;
        box-sizing: border-box;
      `,
      topBarStyle: `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 30px;
        background: #1a1a1a;
      `,
      bottomBarStyle: `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 30px;
        background: #1a1a1a;
      `
    }
  },
  // 3. 复古相框模板
  {
    type: 'retro-frame',
    name: '复古相框',
    cover: 'https://via.placeholder.com/300x400?text=复古相框',
    renderConfig: {
      type: 'retroFrame',
      innerStyle: `
        top: 15px;
        left: 15px;
        right: 15px;
        bottom: 15px;
        border: 8px solid #d4b886;
        border-radius: 2px;
        box-shadow: inset 0 0 20px rgba(100, 70, 30, 0.3);
        pointer-events: none;
        position: absolute;
        box-sizing: border-box;
      `,
      outerStyle: `
        position: absolute;
        top: -18px;
        left: -18px;
        right: -18px;
        bottom: -18px;
        border: 3px solid #b9945a;
        border-radius: 4px;
        opacity: 0.8;
        background: url(https://via.placeholder.com/100x100?text=纹理) repeat;
        background-size: 50px;
        opacity: 0.1;
        pointer-events: none;
        box-sizing: border-box;
      `
    }
  },
  // 4. 日系贴纸模板
  {
    type: 'japanese-sticker',
    name: '日系贴纸',
    cover: 'https://via.placeholder.com/300x400?text=日系贴纸',
    renderConfig: {
      type: 'sticker',
      wrapStyle: `
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        position: absolute;
        box-sizing: border-box;
      `,
      stickers: [
        {
          content: '🌸',
          style: `
            position: absolute;
            top: 30px;
            right: 30px;
            transform: rotate(-10deg);
            font-size: 24px;
            color: #fff;
            text-shadow: 0 0 3px #000;
          `
        },
        {
          content: '✨',
          style: `
            position: absolute;
            bottom: 100px;
            left: 20px;
            transform: rotate(15deg);
            font-size: 30px;
            color: #fff;
            text-shadow: 0 0 3px #000;
          `
        },
        {
          content: '元气满满',
          style: `
            position: absolute;
            top: 50%;
            left: 20px;
            transform: rotate(-5deg);
            font-size: 18px;
            color: #fff;
            text-shadow: 0 0 3px #000;
            background: rgba(255, 105, 180, 0.6);
            padding: 4px 8px;
            border-radius: 4px;
          `
        }
      ]
    }
  }
]);

// 选择模板并跳转（仅传递最终渲染配置）
const selectTemplate = (template: any) => {
  router.push({
    path: '/',
    query: {
      renderConfig: JSON.stringify(template.renderConfig)
    }
  });
};
</script>

<style scoped>
.template-page {
  min-height: 100vh;
  width: 100vw;
  background-color: #f5f5f5;
}

.template-list {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.template-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  padding-bottom: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.template-item:active {
  transform: scale(0.98);
}

.template-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
}

.template-name {
  font-size: 14px;
  color: #333;
  display: block;
  margin-top: 8px;
}
</style>
