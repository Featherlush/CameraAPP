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
