<template>
  <div class="camera-page">
    <!-- 相机预览区域 -->
    <div class="camera-preview">
      <video ref="videoRef" class="camera-video" autoplay playsinline></video>
      <img
        ref="templateRef"
        class="camera-template"
        v-if="selectedTemplate"
        :src="selectedTemplate.src"
      />
      <!-- 网格辅助线（示例中的九宫格） -->
      <div class="camera-grid" v-show="gridEnabled"></div>

      <!-- 拍照成功闪烁边框（核心新增） -->
      <div class="capture-flash" v-if="isCapturing"></div>

      <!-- 顶部功能按钮栏（参考示例：返回、闪光灯、模板、设置） -->
      <div class="top-controls">
        <!-- 左上：返回按钮 -->
        <van-icon name="arrow-left" class="top-btn back-btn" @click="handleBack" />
        <!-- 中上：闪光灯按钮 -->
        <img src="@/assets/icon/flash.png" class="top-btn flash-btn" @click="handleFlashToggle" />
        <!-- 右上-左：模板按钮 -->
        <div class="top-btn template-btn" @click="handleTemplate">
          <span class="template-text">模板</span>
        </div>
        <!-- 右上-右：设置按钮 -->
        <van-icon name="setting-o" class="top-btn setting-btn" @click="handleSetting" />
      </div>

      <!-- 底部曝光条（示例中的进度条） -->
      <!-- <div class="exposure-bar">
        <span class="exposure-dot"></span>
      </div> -->
    </div>

    <!-- 底部操作栏（参考示例：切换摄像头、滤镜、拍摄、AR、相册） -->
    <div class="bottom-controls">
      <!-- 左下：切换摄像头 -->
      <img src="@/assets/icon/refresh.png" class="bottom-btn flip-btn" @click="handleFlipCamera" />
      <!-- 左中：滤镜按钮 -->
      <van-icon name="smile-o" class="bottom-btn filter-btn" @click="handleFilter" />
      <!-- 中间：拍摄按钮 -->
      <button class="capture-btn" @click="handleCapture" :disabled="isCapturing">
        <span class="capture-inner"></span>
      </button>
      <!-- 右中：AR按钮 -->
      <div class="bottom-btn ar-btn" @click="handleAR">
        <span class="ar-text">AR</span>
      </div>
      <!-- 右下：相册按钮 -->
      <img src="@/assets/icon/album.png" class="bottom-btn album-btn" @click="handleAlbum" />
    </div>

    <!-- 设置弹窗 -->
    <van-popup v-model:show="settingPopupShow" position="bottom" >
      <div class="setting-popup">
        <div class="popup-header">
          <h3>相机设置</h3>
          <van-icon name="cross" @click="settingPopupShow = false" />
        </div>
        <div class="setting-list">
          <van-cell title="分辨率" :value="resolutionOption" @click="handleResolutionSetting" />
          <van-cell
            title="网格线"
            :value="gridEnabled ? '开启' : '关闭'"
            @click="handleGridToggle"
          />
          <van-cell title="曝光度" :value="exposureOption" @click="handleExposureSetting" />
          <van-cell title="存储位置" value="手机相册" />
        </div>
      </div>
    </van-popup>

    <!-- 保存成功弹窗 -->
    <!-- <van-popup v-model:show="saveSuccessShow" position="center" duration="200">
      <div class="save-success">
        <van-icon name="success" color="#4CAF50" size="48" />
        <p>保存成功！</p>
      </div>
    </van-popup> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon, Popup, Cell } from 'vant'
import { photoDB } from '@/utils/db';

// 新增：声明模板的类型接口
interface Template {
  name: string;
  cover: string;
  src: string;
}

// 新增状态：保存成功弹窗、拍照中状态（控制闪烁动画）
const saveSuccessShow = ref(false);
const isCapturing = ref(false); // 拍照中标记（控制闪烁动画）

// 显式声明类型（修复 never 类型问题）
const selectedTemplate = ref<Template | null>(null);
const templateRef = ref<HTMLImageElement | null>(null);

// 视频流相关
const videoRef = ref<HTMLVideoElement | null>(null)
const mediaStream = ref<MediaStream | null>(null)
const currentFacingMode = ref<'user' | 'environment'>('environment')

// 功能状态
const flashEnabled = ref(false)
const gridEnabled = ref(true) // 默认显示九宫格
const settingPopupShow = ref(false)
const resolutionOption = ref('1080P')
const exposureOption = ref('自动')

// 路由实例
const router = useRouter()

// ========== 功能接口（对应示例按钮） ==========
/** 返回按钮 - 跳转路由 */
const handleBack = () => {
  router.back()
}

/** 闪光灯切换 */
const handleFlashToggle = () => {
  flashEnabled.value = !flashEnabled.value
  console.log('闪光灯状态:', flashEnabled.value ? '开启' : '关闭')
}

/** 模板按钮 - 跳转路由 */
const handleTemplate = () => {
  router.push('/template')
}

/** 设置按钮 - 打开弹窗 */
const handleSetting = () => {
  settingPopupShow.value = true
}

/** 切换摄像头 */
const handleFlipCamera = () => {
  currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment'
  initCamera()
}

/** 滤镜按钮 - 跳转路由 */
const handleFilter = () => {
  router.push('/filter')
}

/** 拍照功能（核心修改：添加闪烁动画控制） */
const handleCapture = () => {
  if (isCapturing.value) return; // 防止重复点击
  console.log('执行拍照操作')

  // 1. 开始闪烁动画
  isCapturing.value = true;

  // 2. 执行拍照合成
  takePhoto();

  // 3. 动画结束后关闭标记（与CSS动画时长一致）
  setTimeout(() => {
    isCapturing.value = false;
  }, 800); // 与动画时长 .8s 保持一致
}

/** AR按钮 - 跳转路由 */
const handleAR = () => {
  router.push('/AR')
}

/** 相册按钮 - 跳转路由 */
const handleAlbum = () => {
  router.push('/album')
}

/** 分辨率设置 */
const handleResolutionSetting = () => {
  console.log('选择分辨率')
}

/** 网格线切换 */
const handleGridToggle = () => {
  gridEnabled.value = !gridEnabled.value
}

/** 曝光度设置 */
const handleExposureSetting = () => {
  console.log('调整曝光度')
}

// ========== 相机核心功能 ==========
const initCamera = async () => {
  try {
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach((track) => track.stop())
    }

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: currentFacingMode.value,
        width: { ideal: window.innerWidth },
        height: { ideal: window.innerHeight },
      },
      audio: false,
    }
    if (flashEnabled.value) (constraints.video as any).torch = true

    mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints)
    if (videoRef.value) videoRef.value.srcObject = mediaStream.value
  } catch (err) {
    console.error('摄像头初始化失败:', err)
    alert('请授予摄像头权限')
  }
}

const takePhoto = () => {
  if (!videoRef.value || !selectedTemplate) return; // 无模板时不处理
  const canvas = document.createElement('canvas');
  const { videoWidth, videoHeight } = videoRef.value;
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. 绘制摄像头画面（底层）
    ctx.drawImage(videoRef.value, 0, 0, videoWidth, videoHeight);

    // 2. 绘制模板（完全覆盖上层，关键修改）
    if (templateRef.value) {
      // 模板尺寸和Canvas完全一致，实现全屏覆盖
      ctx.drawImage(
        templateRef.value,
        0, // 左上角x坐标
        0, // 左上角y坐标
        videoWidth, // 模板宽度=画布宽度
        videoHeight // 模板高度=画布高度
      );
    }

    // 3. 生成最终照片
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    handlePhotoTaken(photoData);
    localStorage.removeItem('selectedTemplate');
    selectedTemplate.value = null; // 拍照后清空模板，方便下次拍摄
  }
};

const handlePhotoTaken = async (photoData: string) => {
  try {
    await photoDB.savePhoto(photoData);
    // 闪烁动画结束后显示保存成功弹窗（延迟400ms，体验更流畅）
    setTimeout(() => {
      saveSuccessShow.value = true;
      // 2 秒后关闭弹窗
      setTimeout(() => {
        saveSuccessShow.value = false;
        // 如需自动跳转：router.push('/album');
      }, 1500);
    }, 400);
  } catch (err) {
    console.error('保存照片失败:', err);
    alert('保存失败，请重试');
    isCapturing.value = false; // 保存失败也关闭闪烁状态
  }
};

// ========== 初始化数据库（页面挂载时） ==========
onMounted(async () => {
  try {
    // 新增：读取本地存储的模板（关键！之前没加）
    const templateStr = localStorage.getItem('selectedTemplate');
    if (templateStr) {
      selectedTemplate.value = JSON.parse(templateStr);
    }

    await photoDB.init(); // 初始化 IndexedDB
    if (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices) {
      initCamera();
    } else {
      alert('浏览器不支持摄像头');
    }
  } catch (err) {
    console.error('数据库初始化失败:', err);
    alert('存储功能异常，无法保存照片');
  }
});

onUnmounted(() => {
  if (mediaStream.value) mediaStream.value.getTracks().forEach((track) => track.stop())
})
</script>

<style scoped>
.camera-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
  position: relative;
}

/* 预览区域 */
.camera-preview {
  width: 100%;
  height: calc(100% - 100px);
  position: relative;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 九宫格网格线（和示例一致） */
.camera-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.3) 0%, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 1px);
  background-size: 33.33% 33.33%;
  pointer-events: none;
}

/* 核心新增：拍照闪烁边框动画 */
.capture-flash {
  position: absolute;
  inset: 0;
  border: 8px solid #fff; /* 边框宽度和颜色 */
  box-sizing: border-box;
  pointer-events: none;
  z-index: 100; /* 确保在最上层显示 */
  animation: flash 0.8s ease-out forwards; /* 动画名称、时长、缓动效果 */
}

/* 闪烁动画关键帧 */
@keyframes flash {
  0% {
    opacity: 1;
    transform: scale(1);
    border-color: #fff; /* 初始白色边框 */
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02); /* 轻微放大，增强视觉冲击 */
    border-color: #f8f8f8; /* 稍浅的白色 */
  }
  100% {
    opacity: 0;
    transform: scale(1);
    border-color: transparent; /* 最终透明消失 */
  }
}

/* 顶部按钮栏（参考示例布局：左、中、右左、右右） */
.top-controls {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  top: 0px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  z-index: 10;
}

.top-btn {
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 顶部按钮细节 */
.back-btn,
.setting-btn {
  font-size: 22px;
  width: 32px;
  height: 32px;
}

.flash-btn {
  width: 22px;
  height: 28px;
}

.template-btn {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 14px;
  backdrop-filter: blur(4px);
}

/* 底部曝光条（示例中的进度条） */
.exposure-bar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.3);
}

.exposure-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 底部操作栏（参考示例：5个按钮） */
.bottom-controls {
  height: 100px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  padding: 0 20px;
}

.bottom-btn {
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 底部按钮细节 */
.flip-btn {
  width: 22px;
  height: 22px;
}

.album-btn {
  width: 25px;
  height: 25px;
}

.filter-btn {
  font-size: 24px;
  width: 36px;
  height: 36px;
}

.ar-btn {
  border: 1px solid #fff;
  border-radius: 15px;
  padding: 2px 8px;
  font-size: 14px;
}

/* 拍摄按钮（示例中的圆形按钮） */
.capture-btn {
  width: 70px;
  height: 70px;
  border: 3px solid #fff;
  border-radius: 50%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  cursor: pointer;
}

/* 拍照中禁用按钮样式（防止重复点击） */
.capture-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.capture-inner {
  display: block;
  width: 60px;
  height: 60px;
  background-color: #fff;
  border-radius: 50%;
}

/* 设置弹窗 */
.setting-popup {
  background-color: #1a1a1a;
  color: #fff;
}
.popup-header {
  padding: 16px 20px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:deep(.van-cell) {
  background-color: #1a1a1a;
  color: #fff;
  border-bottom: 1px solid #222;
}

.camera-preview {
  width: 100%;
  height: calc(100% - 100px);
  position: relative; /* 关键：作为模板绝对定位的父容器 */
  overflow: hidden; /* 裁剪超出预览区的模板部分 */
}

/* 核心：模板完全覆盖样式 */
.camera-template {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; /* 宽度铺满预览区 */
  height: 100%; /* 高度铺满预览区 */
  object-fit: cover; /* 保持比例，裁剪超出部分（避免变形） */
  pointer-events: none; /* 不遮挡摄像头操作（如点击、切换） */
  z-index: 5; /* 确保在摄像头画面之上，按钮之下 */
}

/* 保存成功弹窗样式 */
.save-success {
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  padding: 30px 40px;
  border-radius: 12px;
  text-align: center;
  color: #fff;
}
.save-success p {
  margin-top: 15px;
  font-size: 16px;
}
</style>
