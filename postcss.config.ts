module.exports = {
  plugins: {
    // 如果使用了 TailwindCSS 或其他 PostCSS 插件，需要保留
    // 'tailwindcss': {},
    // 'autoprefixer': {},

    'postcss-px-to-viewport': {
      viewportWidth: 375, // 设计稿宽度（Vant 基于 375px）
      viewportHeight: 667, // 设计稿高度（可选）
      unitPrecision: 2, // 转换后的小数精度
      viewportUnit: 'vw', // 转换单位（vw 最常用）
      selectorBlackList: [
        // 忽略转换的选择器（如 Vant 组件）
        '.ignore',
        '.hairlines',
        'van-', // 忽略 Vant 组件的样式，避免二次转换
      ],
      minPixelValue: 1, // 小于 1px 的值不转换
      mediaQuery: false, // 不在媒体查询中转换
      exclude: /node_modules\/(?!vant)/, // 排除 node_modules，但包含 vant
    },
  },
}
