<template>
  <div class="camera-page">
    <!-- 相机预览区域 -->
    <div class="camera-preview">
      <video
        ref="videoRef"
        class="camera-video"
        autoplay
        playsinline
        :style="{ filter: selectedFilter?.type === 'css' ? (selectedFilter?.cssFilter || 'none') : 'none' }"
      ></video>
      <canvas ref="canvasRef" class="camera-canvas"></canvas>
      <img
        ref="templateRef"
        class="camera-template"
        v-if="selectedTemplate"
        :src="selectedTemplate.src"
      />
      <!-- 网格辅助线（示例中的九宫格） -->
      <div class="camera-grid" v-show="gridEnabled"></div>

      <!-- 拍照成功闪烁边框 -->
      <div class="capture-flash" v-if="isCapturing"></div>

      <!-- 滤镜状态指示器 -->
      <div class="filter-indicator" v-if="selectedFilter && selectedFilter.name !== '原图'">
        <div class="filter-tag">
          <span class="filter-name">{{ selectedFilter.name }}</span>
          <van-icon
            name="cross"
            class="filter-close"
            @click="removeFilter"
          />
        </div>
      </div>

      <!-- AR特效状态指示器 -->
      <div class="filter-indicator" v-if="currentAREffect && currentAREffect !== 'none'" style="top: 120px;">
        <div class="filter-tag">
          <van-icon name="star" class="filter-ar-icon" />
          <span class="filter-name">{{ getAREffectName(currentAREffect) }}</span>
          <van-icon
            name="cross"
            class="filter-close"
            @click="removeAR"
          />
        </div>
      </div>

      <!-- 顶部功能按钮栏 -->
      <div class="top-controls">
        <!-- 左上：返回按钮 -->
        <van-icon name="arrow-left" class="top-btn back-btn" @click="handleBack" />
        <!-- 中上：AR特效按钮（核心修改：确保容器和按钮样式正确） -->
        <div class="flash-ar-container top-btn">
          <div class="ar-menu-btn" @click.stop="toggleARMenu">
            <span class="ar-menu-text">特效</span>
          </div>
          <!-- AR特效下拉菜单 -->
          <div class="ar-dropdown-menu" v-show="showARMenu" ref="arMenuRef">
            <div class="ar-menu-item" @click.stop="selectAR('cat')">  <!-- 修复：添加.stop阻止冒泡 -->
              <div class="ar-icon cat-icon"></div>
              <span>猫脸特效</span>
            </div>
            <div class="ar-menu-item" @click.stop="selectAR('dog')">  <!-- 修复：添加.stop阻止冒泡 -->
              <div class="ar-icon dog-icon"></div>
              <span>狗脸特效</span>
            </div>
            <div class="ar-menu-item" @click.stop="selectAR('sunglasses')">  <!-- 修复：添加.stop阻止冒泡 -->
              <div class="ar-icon sunglasses-icon"></div>
              <span>墨镜特效</span>
            </div>
            <div class="ar-menu-item" @click.stop="selectAR('none')">  <!-- 修复：添加.stop阻止冒泡 -->
              <div class="ar-icon none-icon"></div>
              <span>关闭特效</span>
            </div>
          </div>
        </div>
        <!-- 右上-左：模板按钮 -->
        <div class="top-btn template-btn" @click="handleTemplate">
          <span class="template-text">模板</span>
        </div>
        <!-- 右上-右：设置按钮 -->
        <van-icon name="setting-o" class="top-btn setting-btn" @click="handleSetting" />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-controls">
      <!-- 左下：切换摄像头 -->
      <img src="@/assets/icon/refresh.png" class="bottom-btn flip-btn" @click="handleFlipCamera" />
      <!-- 左中：滤镜按钮 -->
      <div class="filter-button-wrapper" @click="handleFilter">
        <van-icon name="smile-o" class="bottom-btn filter-btn" />
        <!-- 滤镜红点提示 -->
        <div class="filter-dot" v-if="selectedFilter && selectedFilter.name !== '原图'"></div>
      </div>
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
          <van-cell
            title="当前滤镜"
            :value="selectedFilter ? selectedFilter.name : '无'"
            @click="handleFilter"
          />
          <van-cell
            title="AR特效"
            :value="getAREffectName(currentAREffect)"
            @click="toggleARMenu"
          />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import { Icon, Popup, Cell } from 'vant'
  import { photoDB } from '@/utils/db';

  // ---------------- 类型接口 ----------------
  interface Template {
    name: string;
    cover: string;
    src: string;
  }

  interface Filter {
    name: string
    type?: 'css' | 'ar'
    cssFilter?: string | null
    arEffect?: 'cat' | null
  }

  type AREffect = 'cat' | 'dog' | 'sunglasses' | 'none'

  // ---------------- canvas / video ----------------
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const videoRef = ref<HTMLVideoElement | null>(null)
  const templateRef = ref<HTMLImageElement | null>(null)
  const arMenuRef = ref<HTMLElement | null>(null)

  // ---------------- 状态 ----------------
  const isCapturing = ref(false)
  const selectedTemplate = ref<Template | null>(null)
  const selectedFilter = ref<Filter | null>(null)
  const mediaStream = ref<MediaStream | null>(null)
  const currentFacingMode = ref<'user' | 'environment'>('environment')

  const flashEnabled = ref(false)
  const gridEnabled = ref(true)
  const settingPopupShow = ref(false)
  const resolutionOption = ref('1080P')
  const exposureOption = ref('自动')
  const showARMenu = ref(false)  // 确保初始值为false
  const currentAREffect = ref<AREffect>('none')

  // ---------------- AR 人脸追踪 ----------------
  let faceMesh: any = null
  let animationFrameId: number | null = null
  let isARActive = ref(false)

  // ---------------- 路由 ----------------
  const router = useRouter()

  // ---------------- 功能接口 ----------------
  const handleBack = () => router.back()

  // 闪光灯/AR菜单切换 - 修复：添加nextTick确保DOM更新
  const toggleARMenu = () => {
    nextTick(() => {
      showARMenu.value = !showARMenu.value
      console.log('AR菜单状态:', showARMenu.value) // 调试日志
    })
  }

  // 点击外部关闭菜单 - 修复：优化DOM判断逻辑
  const handleClickOutside = (event: MouseEvent) => {
    if (arMenuRef.value && !arMenuRef.value.contains(event.target as Node)) {
      showARMenu.value = false
    }
  }

  // 选择AR特效
  const selectAR = (effect: AREffect) => {
    currentAREffect.value = effect
    showARMenu.value = false

    // 停止之前的AR
    stopAR()

    // 启动新的AR特效
    if (effect !== 'none') {
      setTimeout(() => {
        startAR(effect)
      }, 100)
    }

    console.log(`已选择AR特效: ${effect}`)
  }

  // 移除AR特效
  const removeAR = () => {
    selectAR('none')
  }

  // 获取AR特效名称
  const getAREffectName = (effect: AREffect): string => {
    const names = {
      'cat': '猫脸特效',
      'dog': '狗脸特效',
      'sunglasses': '墨镜特效',
      'none': '无'
    }
    return names[effect]
  }

  // 原有的闪光灯功能（可以移除或保留）
  const handleFlashToggle = () => {
    // 这里可以保留闪光灯功能，或者改为直接打开AR菜单
    toggleARMenu()
  }

  const handleTemplate = () => router.push('/template')
  const handleSetting = () => settingPopupShow.value = true
  const handleFlipCamera = () => {
    currentFacingMode.value = currentFacingMode.value === 'environment' ? 'user' : 'environment'
    initCamera()
  }
  const handleFilter = () => router.push('/filter')
  const handleGridToggle = () => gridEnabled.value = !gridEnabled.value
  const handleResolutionSetting = () => console.log('选择分辨率')
  const handleExposureSetting = () => console.log('调整曝光度')
  const handleAlbum = () => router.push('/album')

  // AR按钮点击事件
  const handleAR = () => {
    console.log('AR按钮点击')
    toggleARMenu()
  }

  // ---------------- 移除滤镜 ----------------
  const removeFilter = () => {
    selectedFilter.value = { name: '原图', type: 'css', cssFilter: 'none' }
    localStorage.setItem('selectedFilter', JSON.stringify(selectedFilter.value))
    console.log('滤镜已移除')
  }

  // ---------------- 拍照 ----------------
  const handleCapture = () => {
    if (isCapturing.value) return
    isCapturing.value = true
    takePhoto()
    setTimeout(() => { isCapturing.value = false }, 800)
  }

  const takePhoto = () => {
    if (!videoRef.value) return
    const canvas = document.createElement('canvas')
    const { videoWidth, videoHeight } = videoRef.value
    canvas.width = videoWidth
    canvas.height = videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 1️⃣ 绘制摄像头
    if (selectedFilter.value?.type === 'css' && selectedFilter.value.cssFilter && selectedFilter.value.cssFilter !== 'none') {
      ctx.filter = selectedFilter.value.cssFilter
    } else {
      ctx.filter = 'none'
    }
    ctx.drawImage(videoRef.value, 0, 0, videoWidth, videoHeight)
    ctx.filter = 'none'

    // 2️⃣ 绘制模板
    if (selectedTemplate.value && templateRef.value) {
      ctx.drawImage(templateRef.value, 0, 0, videoWidth, videoHeight)
    }

    // 3️⃣ 绘制 AR canvas
    if (canvasRef.value) {
      ctx.drawImage(canvasRef.value, 0, 0, videoWidth, videoHeight)
    }

    // 4️⃣ 保存照片
    const photoData = canvas.toDataURL('image/jpeg', 0.9)
    handlePhotoTaken(photoData)

    // 5️⃣ 清除模板
    localStorage.removeItem('selectedTemplate')
    selectedTemplate.value = null
  }

  const handlePhotoTaken = async (photoData: string) => {
    try {
      await photoDB.savePhoto(photoData)
      console.log('✅ 照片保存成功！')
    } catch (err) {
      console.error('保存照片失败:', err)
      alert('保存失败，请重试')
      isCapturing.value = false
    }
  }

  // ---------------- 相机初始化 ----------------
  const initCamera = async () => {
    try {
      if (mediaStream.value) mediaStream.value.getTracks().forEach(track => track.stop())
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentFacingMode.value,
          width: { ideal: window.innerWidth },
          height: { ideal: window.innerHeight }
        },
        audio: false
      }
      mediaStream.value = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.value) {
        videoRef.value.srcObject = mediaStream.value

        // 等待视频就绪
        videoRef.value.onloadedmetadata = () => {
          console.log('视频已就绪')
          // 如果当前有AR特效，重新启动
          if (currentAREffect.value !== 'none') {
            setTimeout(() => {
              startAR(currentAREffect.value)
            }, 300)
          }
        }
      }
    } catch (err) {
      console.error('摄像头初始化失败:', err)
      alert('请授予摄像头权限')
    }
  }

  // ---------------- 滤镜加载 ----------------
  const loadFilter = () => {
    const savedFilter = localStorage.getItem('selectedFilter')
    if (savedFilter) {
      try {
        const filterData = JSON.parse(savedFilter)
        if (filterData.name) {
          selectedFilter.value = filterData
        }
      } catch {
        selectedFilter.value = null
      }
    } else {
      selectedFilter.value = { name: '原图', type: 'css', cssFilter: 'none' }
    }
  }

  // ---------------- AR 特效 ----------------
  const initFaceMesh = async () => {
    try {
      // 动态加载MediaPipe
      await loadMediaPipe()

      if (!window.FaceMesh) {
        console.error('MediaPipe FaceMesh 加载失败')
        return
      }

      faceMesh = new window.FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      faceMesh.onResults(onFaceResults)

      console.log('FaceMesh 初始化成功')
    } catch (err) {
      console.error('FaceMesh 初始化失败:', err)
    }
  }

  const loadMediaPipe = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.FaceMesh) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh'
      script.onload = () => {
        console.log('MediaPipe FaceMesh 已加载')
        resolve()
      }
      script.onerror = () => {
        console.error('MediaPipe FaceMesh 加载失败')
        reject(new Error('加载失败'))
      }
      document.head.appendChild(script)
    })
  }

  const onFaceResults = (results: any) => {
    const canvas = canvasRef.value
    if (!canvas || !videoRef.value) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置 canvas 尺寸与视频一致
    canvas.width = videoRef.value.videoWidth
    canvas.height = videoRef.value.videoHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return

    const landmarks = results.multiFaceLandmarks[0]

    // 根据当前选择的特效进行绘制
    switch (currentAREffect.value) {
      case 'cat':
        drawCatEffect(ctx, landmarks, canvas.width, canvas.height)
        break
      case 'dog':
        drawDogEffect(ctx, landmarks, canvas.width, canvas.height)
        break
      case 'sunglasses':
        drawSunglassesEffect(ctx, landmarks, canvas.width, canvas.height)
        break
    }

    // 继续下一帧
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    animationFrameId = requestAnimationFrame(() => {})
  }

  // 猫脸特效
  const drawCatEffect = (ctx: CanvasRenderingContext2D, landmarks: any, width: number, height: number) => {
    // 获取眉毛位置
    const leftBrow = landmarks[70]
    const rightBrow = landmarks[300]

    // 左耳朵
    ctx.beginPath()
    const leftEarX = leftBrow.x * width
    const leftEarY = leftBrow.y * height - 40
    ctx.moveTo(leftEarX, leftEarY - 20)
    ctx.lineTo(leftEarX - 15, leftEarY - 40)
    ctx.lineTo(leftEarX + 15, leftEarY - 40)
    ctx.closePath()
    ctx.fillStyle = 'rgba(255, 182, 193, 0.8)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 105, 180, 0.9)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 右耳朵
    ctx.beginPath()
    const rightEarX = rightBrow.x * width
    const rightEarY = rightBrow.y * height - 40
    ctx.moveTo(rightEarX, rightEarY - 20)
    ctx.lineTo(rightEarX - 15, rightEarY - 40)
    ctx.lineTo(rightEarX + 15, rightEarY - 40)
    ctx.closePath()
    ctx.fillStyle = 'rgba(255, 182, 193, 0.8)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 105, 180, 0.9)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 猫鼻子
    const nose = landmarks[1]
    ctx.beginPath()
    ctx.arc(nose.x * width, nose.y * height, 4, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 20, 147, 0.9)'
    ctx.fill()

    // 猫胡须
    const whiskerLength = 30
    const noseX = nose.x * width
    const noseY = nose.y * height

    // 左胡须
    ctx.beginPath()
    ctx.moveTo(noseX - 5, noseY)
    ctx.lineTo(noseX - whiskerLength, noseY)
    ctx.moveTo(noseX - 5, noseY - 5)
    ctx.lineTo(noseX - whiskerLength, noseY - 15)
    ctx.moveTo(noseX - 5, noseY + 5)
    ctx.lineTo(noseX - whiskerLength, noseY + 15)

    // 右胡须
    ctx.moveTo(noseX + 5, noseY)
    ctx.lineTo(noseX + whiskerLength, noseY)
    ctx.moveTo(noseX + 5, noseY - 5)
    ctx.lineTo(noseX + whiskerLength, noseY - 15)
    ctx.moveTo(noseX + 5, noseY + 5)
    ctx.lineTo(noseX + whiskerLength, noseY + 15)

    ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // 狗脸特效
  const drawDogEffect = (ctx: CanvasRenderingContext2D, landmarks: any, width: number, height: number) => {
    // 获取眉毛位置
    const leftBrow = landmarks[70]
    const rightBrow = landmarks[300]

    // 狗耳朵（比猫耳朵更大更下垂）
    const earHeight = 25
    const earWidth = 20

    // 左耳朵
    ctx.beginPath()
    const leftEarX = leftBrow.x * width
    const leftEarY = leftBrow.y * height - 30
    ctx.ellipse(leftEarX, leftEarY, earWidth, earHeight, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(139, 69, 19, 0.8)' // 棕色
    ctx.fill()
    ctx.strokeStyle = 'rgba(101, 67, 33, 0.9)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 右耳朵
    ctx.beginPath()
    const rightEarX = rightBrow.x * width
    const rightEarY = rightBrow.y * height - 30
    ctx.ellipse(rightEarX, rightEarY, earWidth, earHeight, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(139, 69, 19, 0.8)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(101, 67, 33, 0.9)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 狗鼻子（更大）
    const nose = landmarks[1]
    ctx.beginPath()
    ctx.arc(nose.x * width, nose.y * height, 8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)' // 黑色鼻子
    ctx.fill()

    // 狗舌头（从嘴巴位置）
    const mouth = landmarks[13]
    ctx.beginPath()
    ctx.ellipse(mouth.x * width, mouth.y * height + 10, 10, 15, 0, 0, Math.PI)
    ctx.fillStyle = 'rgba(255, 105, 180, 0.8)' // 粉色舌头
    ctx.fill()
  }

  // 墨镜特效
  const drawSunglassesEffect = (ctx: CanvasRenderingContext2D, landmarks: any, width: number, height: number) => {
    // 获取眼睛位置
    const leftEye = landmarks[33]    // 左眼内角
    const rightEye = landmarks[263]  // 右眼内角
    const leftEyeOuter = landmarks[133] // 左眼外角
    const rightEyeOuter = landmarks[362] // 右眼外角

    const eyeDistance = Math.abs(rightEye.x - leftEye.x) * width
    const lensWidth = eyeDistance * 0.4
    const lensHeight = lensWidth * 0.7
    const bridgeWidth = eyeDistance * 0.2

    // 左镜片
    ctx.beginPath()
    const leftLensX = leftEye.x * width - lensWidth/2
    const leftLensY = leftEye.y * height - lensHeight/2
    ctx.roundRect(leftLensX, leftLensY, lensWidth, lensHeight, 8)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)' // 深色镜片
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)' // 金色边框
    ctx.lineWidth = 3
    ctx.stroke()

    // 右镜片
    ctx.beginPath()
    const rightLensX = rightEye.x * width - lensWidth/2
    const rightLensY = rightEye.y * height - lensHeight/2
    ctx.roundRect(rightLensX, rightLensY, lensWidth, lensHeight, 8)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)'
    ctx.lineWidth = 3
    ctx.stroke()

    // 镜桥
    ctx.beginPath()
    const bridgeX = leftLensX + lensWidth
    const bridgeY = leftLensY + lensHeight/2
    ctx.rect(bridgeX, bridgeY - 2, bridgeWidth, 4)
    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)'
    ctx.fill()

    // 镜腿（简化版）
    ctx.beginPath()
    ctx.moveTo(leftLensX, leftLensY + lensHeight/2)
    ctx.lineTo(leftLensX - 30, leftLensY + lensHeight/2)
    ctx.moveTo(rightLensX + lensWidth, rightLensY + lensHeight/2)
    ctx.lineTo(rightLensX + lensWidth + 30, rightLensY + lensHeight/2)
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)'
    ctx.lineWidth = 4
    ctx.stroke()
  }

  // 启动 AR
  const startAR = async (effect: AREffect) => {
    if (!videoRef.value || !canvasRef.value) {
      console.warn('视频或画布未就绪')
      return
    }

    // 停止现有 AR
    stopAR()

    console.log(`开始启动${getAREffectName(effect)}...`)

    try {
      // 初始化 MediaPipe FaceMesh
      await initFaceMesh()

      if (!faceMesh) {
        console.error('FaceMesh 初始化失败')
        return
      }

      isARActive.value = true
      console.log(`${getAREffectName(effect)}已激活`)

      // 启动相机处理
      const processFrame = async () => {
        if (!videoRef.value || !faceMesh || !isARActive.value) return

        try {
          await faceMesh.send({ image: videoRef.value })
        } catch (err) {
          console.error('AR 处理错误:', err)
        }

        if (isARActive.value) {
          animationFrameId = requestAnimationFrame(processFrame)
        }
      }

      // 开始处理
      animationFrameId = requestAnimationFrame(processFrame)
      console.log(`${getAREffectName(effect)} AR 已启动`)
    } catch (err) {
      console.error('启动AR失败:', err)
    }
  }

  // 停止 AR
  const stopAR = () => {
    isARActive.value = false

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    if (faceMesh) {
      try {
        faceMesh.close()
      } catch (e) {
        console.error('关闭FaceMesh失败:', e)
      }
      faceMesh = null
    }

    // 清空画布
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
      }
    }

    console.log('AR 已停止')
  }

  // ---------------- 生命周期 ----------------
  onMounted(async () => {
    try {
      // 添加点击外部关闭菜单的事件监听
      document.addEventListener('click', handleClickOutside)

      // 加载模板
      const templateStr = localStorage.getItem('selectedTemplate')
      if (templateStr) {
        try {
          selectedTemplate.value = JSON.parse(templateStr)
        } catch (e) {
          console.error('解析模板失败:', e)
        }
      }

      // 加载滤镜
      loadFilter()

      // 初始化数据库
      await photoDB.init()

      // 初始化摄像头
      if (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices) {
        await initCamera()
      } else {
        console.error('浏览器不支持摄像头')
        alert('您的浏览器不支持摄像头功能')
      }
    } catch (err) {
      console.error('初始化失败:', err)
      alert('功能异常，请刷新页面')
    }
  })

  onBeforeUnmount(() => {
    // 移除事件监听
    document.removeEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    // 停止摄像头
    if (mediaStream.value) {
      mediaStream.value.getTracks().forEach(track => track.stop())
      mediaStream.value = null
    }

    // 停止AR
    stopAR()
  })

  // 声明全局类型
  declare global {
    interface Window {
      FaceMesh: any
    }
  }
</script>

<style scoped>
/* 原有的所有样式保持不变，只添加以下新样式 */

.flash-ar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible !important; /* 允许下拉菜单溢出显示 */
  width: auto;
  height: 32px; /* 和其他top-btn保持一致 */
}

/* 修复AR按钮样式：确保显示正常 */
.ar-menu-btn {
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 15px;
  padding: 4px 12px;
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
  height: 28px;
  min-width: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: visible;
  /* 新增：确保按钮不被遮挡 */
  z-index: 100;
}

.ar-menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.9);
}

.ar-menu-text {
  color: #fff;
  font-weight: 500;
  letter-spacing: 0.5px;
  /* 新增：确保文字显示 */
  display: block;
}


/* AR下拉菜单 - 修复：提高z-index */
.ar-dropdown-menu {
  position: absolute;
  top: 45px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.95);
  border-radius: 12px;
  padding: 8px;
  min-width: 160px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 9999; /* 修复：提高z-index避免遮挡 */
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 菜单项 */
.ar-menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.ar-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 图标 */
.ar-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  border-radius: 4px;
}

.cat-icon {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
}

.dog-icon {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}

.sunglasses-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.none-icon {
  background: linear-gradient(135deg, #666 0%, #999 100%);
}

/* AR特效指示器图标 */
.filter-ar-icon {
  color: #FFD700; /* 金色 */
  font-size: 14px;
  margin-right: 6px;
}

/* 保持原有的所有其他样式不变 */
.camera-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
  position: relative;
}

.camera-preview {
  width: 100%;
  height: calc(100% - 100px);
  position: relative;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease;
}

.camera-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.filter-indicator {
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  pointer-events: auto;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-name {
  font-size: 14px;
  font-weight: 500;
}

.filter-close {
  color: #ff4444;
  cursor: pointer;
  padding: 2px;
  font-size: 14px;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-close:hover {
  background: rgba(255, 68, 68, 0.2);
}

.camera-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.3) 0%, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 0%, transparent 1px);
  background-size: 33.33% 33.33%;
  pointer-events: none;
}

.capture-flash {
  position: absolute;
  inset: 0;
  border: 8px solid #fff;
  box-sizing: border-box;
  pointer-events: none;
  z-index: 100;
  animation: flash 0.8s ease-out forwards;
}

@keyframes flash {
  0% {
    opacity: 1;
    transform: scale(1);
    border-color: #fff;
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
    border-color: #f8f8f8;
  }
  100% {
    opacity: 0;
    transform: scale(1);
    border-color: transparent;
  }
}

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

.back-btn,
.setting-btn {
  font-size: 22px;
  width: 32px;
  height: 32px;
}

.template-btn {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 14px;
  backdrop-filter: blur(4px);
}

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

.flip-btn {
  width: 22px;
  height: 22px;
}

.album-btn {
  width: 25px;
  height: 25px;
}

.filter-button-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.filter-btn {
  font-size: 24px;
  width: 36px;
  height: 36px;
  color: #fff;
}

.filter-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.ar-btn {
  border: 1px solid #fff;
  border-radius: 15px;
  padding: 2px 8px;
  font-size: 14px;
}

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
  transition: transform 0.2s;
}

.capture-btn:active:not(:disabled) {
  transform: scale(0.95);
}

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

.camera-template {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  z-index: 5;
}
</style>
