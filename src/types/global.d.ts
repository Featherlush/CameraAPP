// src/types/global.d.ts
declare interface ImageCapture {
  takePhoto(constraints?: PhotoSettings): Promise<Blob>;
  getCapabilities(): Promise<MediaTrackCapabilities>;
  applyConstraints(constraints: MediaTrackConstraints): Promise<void>;
  grabFrame(): Promise<ImageBitmap>;
  readonly track: MediaStreamTrack;
}

declare interface PhotoSettings {
  fillLightMode?: 'auto' | 'off' | 'flash';
  imageHeight?: number | { ideal: number; min?: number; max?: number };
  imageWidth?: number | { ideal: number; min?: number; max?: number };
  redEyeReduction?: boolean;
  exposureMode?: 'auto' | 'manual' | 'continuous' | 'single-shot';
  exposureCompensation?: number;
  exposureTime?: number | { ideal: number; min?: number; max?: number };
  iso?: number | { ideal: number; min?: number; max?: number };
  whiteBalanceMode?: 'auto' | 'manual';
  whiteBalanceTemperature?: number | { ideal: number; min?: number; max?: number };
  focusMode?: 'auto' | 'manual' | 'continuous' | 'single-shot';
  pointsOfInterest?: Array<{ x: number; y: number }>;
}

declare var ImageCapture: {
  prototype: ImageCapture;
  new (track: MediaStreamTrack): ImageCapture;
};

// 扩展 MediaTrackCapabilities 接口，添加曝光相关属性
declare interface MediaTrackCapabilities {
  exposureCompensation?: {
    min: number;
    max: number;
    step: number;
  };
  exposureMode?: string[];
}

// types/global.d.ts
declare global {
  /**
   * uni-app 全局API
   */
  const uni: {
    // 存储相关
    setStorageSync: (key: string, data: any) => void;
    getStorageSync: (key: string) => any;
    removeStorageSync: (key: string) => void;

    // 系统信息
    getSystemInfoSync: () => {
      windowWidth: number;
      windowHeight: number;
      [key: string]: any;
    };

    // 图片选择
    chooseImage: (options: {
      count?: number;
      sourceType?: string[];
      success?: (res: { tempFilePaths: string[] }) => void;
      fail?: (err: any) => void;
    }) => void;

    // 获取图片信息
    getImageInfo: (options: {
      src: string;
      success?: (info: { path: string; width: number; height: number }) => void;
      fail?: (err: any) => void;
    }) => void;

    // 其他uni API按需扩展
    [key: string]: any;
  };

  /**
   * HBuilder 5+ App 全局API
   */
  const plus: {
    // 运行时相关
    runtime: {
      ready: (callback: () => void) => void;
      mainActivity: any;
      invoke: (obj: any, method: string, ...args: any[]) => any;
      setActivityResultCallback: (callback: (requestCode: number, resultCode: number, data: any) => void) => void;
      [key: string]: any;
    };

    // 权限相关
    android: {
      importClass: (className: string) => any;
      runtimeMainActivity: () => any;
      [key: string]: any;
    };

    // 相机相关
    camera: {
      getCamera: (index?: number) => {
        supportedImageResolutions: string[];
        supportedImageFormats: string[];
        setImageResolution: (res: string) => void;
        setImageFormat: (fmt: string) => void;
        startCapture: (rect: any, success?: () => void, fail?: (err: any) => void) => void;
        captureImage: (success: (path: string) => void, fail?: (err: any) => void, options?: {
          filename?: string;
          format?: string;
          quality?: number;
        }) => void;
        stopCapture: () => void;
        [key: string]: any;
      };
    };

    // IO相关
    io: {
      resolveLocalFileSystemURL: (path: string, success?: (entry: any) => void, fail?: (err: any) => void) => void;
      FileReader: new () => {
        onloadend: ((e: any) => void) | null;
        readAsDataURL: (file: any) => void;
        [key: string]: any;
      };
      [key: string]: any;
    };

    // 相册相关
    gallery: {
      save: (path: string, success?: () => void, fail?: (err: any) => void) => void;
    };

    // 原生对象
    nativeObj: {
      Bitmap: new (name: string) => {
        loadBase64Data: (data: string, success?: () => void, fail?: (err: any) => void) => void;
        save: (path: string, options: { quality?: number }, success?: (info: any) => void, fail?: (err: any) => void) => void;
        clear: () => void;
        [key: string]: any;
      };
    };

    [key: string]: any;
  };
}

// 必须导出空对象，让TS识别这是模块
export {};
