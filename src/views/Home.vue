<template>
  <div class="camera-page">
    <!-- 相机预览区域 -->
    <div class="camera-preview">
      <video ref="videoRef" class="camera-video" autoplay playsinline></video>
      <!-- 网格辅助线（示例中的九宫格） -->
      <div class="camera-grid" v-show="gridEnabled"></div>

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
      <div class="exposure-bar">
        <span class="exposure-dot"></span>
      </div>
    </div>

    <!-- 底部操作栏（参考示例：切换摄像头、滤镜、拍摄、AR、相册） -->
    <div class="bottom-controls">
      <!-- 左下：切换摄像头 -->
      <img src="@/assets/icon/refresh.png" class="bottom-btn flip-btn" @click="handleFlipCamera" />
      <!-- 左中：滤镜按钮 -->
      <van-icon name="smile-o" class="bottom-btn filter-btn" @click="handleFilter" />
      <!-- 中间：拍摄按钮 -->
      <button class="capture-btn" @click="handleCapture">
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
    <van-popup v-model:show="settingPopupShow" position="bottom" :style="{ height: '70%' }">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon, Popup, Cell } from 'vant'

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
  router.push('/templates')
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
  router.push('/filters')
}

/** 拍照功能 */
const handleCapture = () => {
  console.log('执行拍照操作')
  takePhoto()
}

/** AR按钮 - 跳转路由 */
const handleAR = () => {
  router.push('/ar-feature')
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
  if (!videoRef.value) return
  const canvas = document.createElement('canvas')
  const { videoWidth, videoHeight } = videoRef.value
  canvas.width = videoWidth
  canvas.height = videoHeight
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(videoRef.value, 0, 0, videoWidth, videoHeight)
    const photoData = canvas.toDataURL('image/jpeg', 0.9)
    console.log('拍摄完成:', photoData)
    handlePhotoTaken(photoData)
  }
}

const handlePhotoTaken = (photoData: string) => {
  // 预留：预览/保存逻辑
}

// ========== 生命周期 ==========
onMounted(() => {
  if (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices) {
    initCamera()
  } else {
    alert('浏览器不支持摄像头')
  }
})

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

/* 顶部按钮栏（参考示例布局：左、中、右左、右右） */
.top-controls {
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
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
</style>
