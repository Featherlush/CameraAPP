<template>
  <div class="template-page">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="AR合拍"
      left-arrow
      @click-left="router.back()"
      background="#fff"
      color="#000"
    />

    <!-- 搜索框 -->
    <div class="search-box">
      <van-search placeholder="搜索模板" v-model="searchKey" />
    </div>

    <!-- 模板列表 -->
    <div class="template-grid">
      <!-- 所有模板（预设+自定义） -->
      <div class="template-item" v-for="item in filteredTemplateList" :key="item.id">
        <div style="position: relative;">
          <img :src="item.cover" class="template-cover" @click="selectTemplate(item)" />
          <!-- 自定义素材显示删除按钮 -->
          <van-icon
            v-if="item.isCustom"
            name="close"
            style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: #fff; border-radius: 50%; width: 20px; height: 20px; font-size: 12px;"
            @click.stop="deleteTemplate(item.id)"
          />
        </div>
        <div class="template-name" @click="selectTemplate(item)">{{ item.name }}</div>
      </div>

      <!-- 上传素材按钮 -->
      <div class="template-item upload-item" @click="handleUpload">
        <van-icon name="plus" size="40" color="#999" />
        <div class="upload-text">上传自定义素材</div>
      </div>
    </div>

    <!-- 底部拍照按钮（选中模板后显示） -->
    <van-button
      class="capture-btn"
      type="primary"
      round
      icon="camera-o"
      @click="gotoCamera"
      v-if="selectedTemplate"
    >
      去拍照
    </van-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, Search, Button, Icon } from 'vant';
import { photoDB } from '@/utils/db';

// 模板类型定义
interface Template {
  id: number;
  name: string;
  cover: string;
  src: string;
  isCustom: boolean;
}

const router = useRouter();

// 1. 预设模板（固定ID，避免与自定义模板冲突）
const presetTemplates = ref<Template[]>([
]);

// 2. 自定义模板（从数据库读取）
const customTemplates = ref<Template[]>([]);

// 3. 合并后的模板列表（预设+自定义，去重）
const templateList = computed<Template[]>(() => {
  const allTemplates = [...presetTemplates.value, ...customTemplates.value];
  // 按 id 去重（避免预设与自定义冲突）
  return Array.from(new Map(allTemplates.map(item => [item.id, item])).values());
});

// 搜索相关
const searchKey = ref('');
const filteredTemplateList = computed<Template[]>(() => {
  if (!searchKey.value) return templateList.value;
  return templateList.value.filter(item =>
    item.name.toLowerCase().includes(searchKey.value.toLowerCase())
  );
});

// 选中的模板
const selectedTemplate = ref<Template | null>(null);

// 选择模板
const selectTemplate = (item: Template) => {
  selectedTemplate.value = item;
  localStorage.setItem('selectedTemplate', JSON.stringify(item));
};

// 上传自定义素材
const handleUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // 检查重复（按文件名去重）
    const isDuplicate = templateList.value.some(item => item.name === file.name);
    if (isDuplicate) {
      alert('该素材已存在，无需重复上传');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (res) => {
      // 生成唯一ID（13位时间戳，避免重复）
      const templateId = Date.now();
      const customTemplate: Template = {
        id: templateId,
        name: file.name || "自定义素材",
        cover: res.target?.result as string,
        src: res.target?.result as string,
        isCustom: true
      };

      try {
        // 1. 存入数据库（确保持久化）
        await photoDB.saveTemplate(customTemplate);
        // 2. 添加到前端列表（实时显示）
        customTemplates.value.push(customTemplate);
        // 3. 自动选中
        selectedTemplate.value = customTemplate;
        localStorage.setItem('selectedTemplate', JSON.stringify(customTemplate));
        console.log('模板上传成功:', customTemplate);
      } catch (err) {
        console.error('模板上传失败:', err);
        alert('素材保存失败，请重试');
      }
    };
    reader.readAsDataURL(file);
  };
  input.click();
};

// 删除自定义模板
const deleteTemplate = async (templateId: number) => {
  try {
    // 1. 从数据库删除
    await photoDB.deleteTemplate(templateId);
    // 2. 从前端列表删除
    customTemplates.value = customTemplates.value.filter(item => item.id !== templateId);
    // 3. 若删除的是选中模板，清空选中状态
    if (selectedTemplate.value?.id === templateId) {
      selectedTemplate.value = null;
      localStorage.removeItem('selectedTemplate');
    }
    console.log('模板删除成功:', templateId);
  } catch (err) {
    console.error('模板删除失败:', err);
    alert('素材删除失败，请重试');
  }
};

// 跳转到拍照界面
const gotoCamera = () => {
  router.push('/');
};

// 页面初始化：从数据库加载自定义模板
onMounted(async () => {
  try {
    // 初始化数据库
    await photoDB.init();
    // 读取所有自定义模板
    const savedTemplates = await photoDB.getAllTemplates();
    customTemplates.value = savedTemplates.filter(item => item.isCustom);
    console.log('从数据库加载模板:', customTemplates.value);

    // 读取之前选中的模板（可选）
    const selectedTemplateStr = localStorage.getItem('selectedTemplate');
    if (selectedTemplateStr) {
      const selected = JSON.parse(selectedTemplateStr) as Template;
      // 从合并列表中匹配有效模板
      selectedTemplate.value = templateList.value.find(item => item.id === selected.id) || null;
    }
  } catch (err) {
    console.error('模板页面初始化失败:', err);
    alert('加载素材失败，请刷新重试');
  }
});
</script>

<style scoped>
.template-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-box {
  padding: 10px 16px;
  background-color: #fff;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
}

.template-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.template-cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 4px;
}

.template-name {
  margin-top: 8px;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
}

.upload-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed #eee;
  background-color: #fafafa;
}

.upload-text {
  margin-top: 8px;
  font-size: 14px;
  color: #999;
}

.capture-btn {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 50px;
  font-size: 16px;
}
</style>
