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

    <!-- 搜索栏 -->
    <div class="search-bar-container">
      <van-search
        v-model="searchValue"
        placeholder="搜索滤镜效果"
        background="#fff"
        @clear="onClear"
      />
    </div>

    <!-- 滤镜列表 -->
    <div class="filter-list">
      <div
        v-for="filter in filteredFilters"
        :key="filter.id"
        class="filter-item"
      >
        <div class="filter-info">
          <div
            class="filter-thumbnail"
            :style="{ background: filter.thumbnailColor }"
          ></div>

          <div class="filter-details">
            <div class="filter-name">{{ filter.name }}</div>
            <div class="filter-desc">{{ filter.description }}</div>
          </div>
        </div>

        <van-button
          size="small"
          type="primary"
          class="use-btn"
          @click="useFilter(filter)"
        >
          使用
        </van-button>
      </div>

      <van-empty
        v-if="filteredFilters.length === 0"
        description="未找到相关滤镜"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const searchValue = ref('')

/* ========= 类型定义（向后兼容） ========= */
interface FilterItem {
  id: number
  name: string
  description: string
  thumbnailColor: string
  type: string              // 展示分类
  cssFilter?: string        // ⭐ 原有 CSS 滤镜
  effectType?: 'css' | 'ar' // ⭐ 新增：滤镜实现方式
  arEffect?: 'cat'          // ⭐ 新增：AR 特效标识
}

/* ========= 滤镜数据（原样 + 猫脸） ========= */
const filters = ref<FilterItem[]>([
  {
    id: 1,
    name: '反相',
    description: '色彩反转效果',
    thumbnailColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: '创意',
    cssFilter: 'invert(1)',
    effectType: 'css'
  },
  {
    id: 2,
    name: '灰化',
    description: '黑白效果',
    thumbnailColor: 'linear-gradient(135deg, #666 0%, #999 100%)',
    type: '黑白',
    cssFilter: 'grayscale(1)',
    effectType: 'css'
  },
  {
    id: 3,
    name: '复古',
    description: '怀旧老照片',
    thumbnailColor: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)',
    type: '复古',
    cssFilter: 'sepia(0.8) contrast(1.1) brightness(1.1)',
    effectType: 'css'
  },
  {
    id: 4,
    name: '变亮',
    description: '提升亮度',
    thumbnailColor: 'linear-gradient(135deg, #FFD700 0%, #FFEC8B 100%)',
    type: '人像',
    cssFilter: 'brightness(1.4) contrast(1.1)',
    effectType: 'css'
  },
  {
    id: 5,
    name: '阿凡达',
    description: '冷色系滤镜',
    thumbnailColor: 'linear-gradient(135deg, #00BFFF 0%, #1E90FF 100%)',
    type: '风景',
    cssFilter: 'hue-rotate(180deg) saturate(1.2)',
    effectType: 'css'
  },
  {
    id: 6,
    name: '暖色调',
    description: '温暖氛围',
    thumbnailColor: 'linear-gradient(135deg, #FF4500 0%, #FFA500 100%)',
    type: '人像',
    cssFilter: 'hue-rotate(-30deg) saturate(1.3) brightness(1.1)',
    effectType: 'css'
  },
  {
    id: 7,
    name: '高对比',
    description: '强烈对比',
    thumbnailColor: 'linear-gradient(135deg, #000 0%, #fff 100%)',
    type: '创意',
    cssFilter: 'contrast(1.8) brightness(1.1)',
    effectType: 'css'
  },
  {
    id: 8,
    name: '模糊效果',
    description: '柔焦朦胧',
    thumbnailColor: 'linear-gradient(135deg, #E0E0E0 0%, #B0B0B0 100%)',
    type: '创意',
    cssFilter: 'blur(2px) brightness(1.05)',
    effectType: 'css'
  },
])

/* ========= 搜索 ========= */
const filteredFilters = computed(() => {
  if (!searchValue.value.trim()) return filters.value
  const key = searchValue.value.toLowerCase()
  return filters.value.filter(f =>
    f.name.toLowerCase().includes(key) ||
    f.description.toLowerCase().includes(key) ||
    f.type.toLowerCase().includes(key)
  )
})

const onClear = () => {
  searchValue.value = ''
}

/* ========= 使用滤镜（唯一出口） ========= */
const useFilter = (filter: FilterItem) => {
  showToast(`已应用滤镜：${filter.name}`)

  // ⭐ 核心：向相机页写入「统一格式」
  localStorage.setItem(
    'selectedFilter',
    JSON.stringify({
      name: filter.name,
      type: filter.effectType ?? 'css',
      cssFilter: filter.cssFilter ?? null,
      arEffect: filter.arEffect ?? null
    })
  )

  router.push('/')
}
</script>

<style scoped>
.template-page {
  min-height: 100vh;
  width: 100vw;
  background-color: #f5f5f5;
}

/* 搜索栏 */
.search-bar-container {
  background-color: #fff;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
}

/* 列表 */
.filter-list {
  padding: 12px;
}

.filter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.filter-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 16px;
  flex-shrink: 0;
}

.filter-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filter-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.filter-desc {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.use-btn {
  width: 70px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}
</style>
