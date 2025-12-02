// src/utils/db.ts
class PhotoDB {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'CameraPhotoDB';
  private readonly PHOTO_STORE = 'photos'; // 照片存储仓库
  private readonly TEMPLATE_STORE = 'templates'; // 模板存储仓库
  private readonly DB_VERSION = 2; // 升级版本号（新增模板仓库）

  // 初始化数据库
  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      // 数据库首次创建/升级时触发（版本号变更时执行）
      request.onupgradeneeded = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;

        // 1. 照片仓库（原有逻辑，保持不变）
        if (!this.db.objectStoreNames.contains(this.PHOTO_STORE)) {
          this.db.createObjectStore(this.PHOTO_STORE, { keyPath: 'id', autoIncrement: true });
        }

        // 2. 新增模板仓库（关键：使用前端传入的 id 作为主键，不自动递增）
        if (!this.db.objectStoreNames.contains(this.TEMPLATE_STORE)) {
          this.db.createObjectStore(this.TEMPLATE_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (e) => {
        reject((e.target as IDBOpenDBRequest).error);
      };
    });
  }

  // 保存照片（原有逻辑，保持不变）
  savePhoto(photoData: string): Promise<{ id: number; time: string }> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');

      const photo = {
        data: photoData, // Base64 图片数据
        time: new Date().toLocaleString(), // 拍摄时间
        title: `照片_${new Date().getTime().toString().slice(-6)}` // 自动生成标题
      };

      const transaction = this.db.transaction(this.PHOTO_STORE, 'readwrite');
      const store = transaction.objectStore(this.PHOTO_STORE);
      const request = store.add(photo);

      request.onsuccess = () => {
        resolve({
          id: request.result as number,
          time: photo.time
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 新增：保存模板
  saveTemplate(template: {
    id: number;
    name: string;
    cover: string;
    src: string;
    isCustom: boolean;
  }): Promise<typeof template> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');

      const transaction = this.db.transaction(this.TEMPLATE_STORE, 'readwrite');
      const store = transaction.objectStore(this.TEMPLATE_STORE);
      const request = store.add(template);

      request.onsuccess = () => {
        resolve(template);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 新增：获取所有模板
  getAllTemplates(): Promise<Array<{
    id: number;
    name: string;
    cover: string;
    src: string;
    isCustom: boolean;
  }>> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');

      const transaction = this.db.transaction(this.TEMPLATE_STORE, 'readonly');
      const store = transaction.objectStore(this.TEMPLATE_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as Array<typeof request.result[0]>);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 新增：删除模板
  deleteTemplate(templateId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');

      const transaction = this.db.transaction(this.TEMPLATE_STORE, 'readwrite');
      const store = transaction.objectStore(this.TEMPLATE_STORE);
      const request = store.delete(templateId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 获取所有照片（倒序：最新的在前面）- 原有逻辑不变
  getAllPhotos(): Promise<Array<{ id: number; data: string; time: string; title: string }>> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');

      const transaction = this.db.transaction(this.PHOTO_STORE, 'readonly');
      const store = transaction.objectStore(this.PHOTO_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        // 按 id 倒序（id 越大越新）
        const sortedPhotos = request.result.sort((a, b) => b.id - a.id);
        resolve(sortedPhotos as Array<typeof sortedPhotos[0]>);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 删除照片（原有逻辑不变）
  deletePhoto(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('数据库未初始化');

      const transaction = this.db.transaction(this.PHOTO_STORE, 'readwrite');
      const store = transaction.objectStore(this.PHOTO_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const photoDB = new PhotoDB();
