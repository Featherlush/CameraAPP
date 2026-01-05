<template>
  <div class="album-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="相册"
      left-arrow
      @click-left="router.back()"
      background="#1a1a1a"
      color="#fff"
    />

    <!-- 照片网格 -->
    <div class="photo-grid" v-if="photos.length > 0">
      <div class="photo-item" v-for="photo in photos" :key="photo.id">
        <!-- 照片预览 -->
        <img :src="photo.data" class="photo-img" @click="previewPhoto(photo)" />
        <!-- 拍摄时间 -->
        <span class="photo-time">{{ photo.time }}</span>
        <!-- 删除按钮 -->
        <van-icon
          name="delete"
          class="delete-btn"
          @click.stop="deletePhoto(photo.id)"
        />
      </div>
    </div>

    <!-- 空相册提示 -->
    <div class="empty-album" v-else>
      <van-icon name="image-o" size="64" color="#ccc" />
      <p>暂无照片</p>
    </div>

    <!-- 照片预览弹窗 -->
    <van-popup v-model:show="previewShow" position="center" closeable>
      <img :src="previewPhotoData" class="preview-img" />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, Icon, Popup } from 'vant';
import { photoDB } from '@/utils/db';

const router = useRouter();
const photos = ref<Array<{ id: number; data: string; time: string; title: string }>>([]);
const previewShow = ref(false);
const previewPhotoData = ref('');

// 加载所有照片
const loadPhotos = async () => {
  try {
    await photoDB.init(); // 初始化数据库
    const data = await photoDB.getAllPhotos();
    photos.value = data;
  } catch (err) {
    console.error('加载相册失败:', err);
    alert('无法加载照片，请刷新重试');
  }
};

// 预览照片
const previewPhoto = (photo: any) => {
  previewPhotoData.value = photo.data;
  previewShow.value = true;
};

// 删除照片
const deletePhoto = async (id: number) => {
  if (confirm('确定删除这张照片吗？')) {
    try {
      await photoDB.deletePhoto(id);
      loadPhotos(); // 删除后重新加载相册
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败，请重试');
    }
  }
};

// 页面挂载时加载照片
onMounted(() => {
  loadPhotos();
});
</script>

<style scoped>
.album-page {
  min-height: 100vh;
  width: 100vw;
  background-color: gainsboro;
}

/* 照片网格布局 */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  padding: 2px;
}

.photo-item {
  position: relative;
  aspect-ratio: 1/1; /* 正方形布局 */
  overflow: hidden;
  border-radius: 4px;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-time {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 12px;
  padding: 2px 4px;
  pointer-events: none;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  color: #ff4444;
  font-size: 16px;
  background-color: rgba(0,0,0,0.5);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 空相册样式 */
.empty-album {
  height: calc(100vh - 46px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.empty-album p {
  margin-top: 16px;
  font-size: 18px;
}

/* 预览弹窗样式 */
.preview-img {
  max-width: 90vw;
  max-height: 78vh;
}
</style>
