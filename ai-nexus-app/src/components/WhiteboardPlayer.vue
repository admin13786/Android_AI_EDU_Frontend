<template>
  <view class="whiteboard-player">
    <view class="whiteboard-stage" :style="{ paddingTop: `${ratioPercent}%`, background: backgroundColor }">
      <view class="whiteboard-layer">
        <view
          v-for="element in renderedElements"
          :key="element.id"
          class="whiteboard-element"
          :class="[`type-${element.type}`, { active: element.id === activeElementId }]"
          :style="element.style"
        >
          <rich-text
            v-if="element.type === 'text'"
            class="whiteboard-text"
            :nodes="element.content"
          />
          <view
            v-else
            class="whiteboard-shape"
            :style="{ background: element.fill || '#EDE9FE' }"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  whiteboard: {
    type: Object,
    default: () => ({})
  },
  activeElementId: {
    type: String,
    default: ''
  }
})

const viewportWidth = computed(() => Number(props.whiteboard?.viewportSize || 1000))
const viewportHeight = computed(() => Number(props.whiteboard?.viewportHeight || viewportWidth.value * Number(props.whiteboard?.viewportRatio || 0.5625)))
const ratioPercent = computed(() => {
  if (!viewportWidth.value) return 56.25
  return (viewportHeight.value / viewportWidth.value) * 100
})

const backgroundColor = computed(() => {
  const background = props.whiteboard?.background || {}
  return background.color || '#ffffff'
})

const percentX = (value) => `${((Number(value || 0) / viewportWidth.value) * 100).toFixed(4)}%`
const percentY = (value) => `${((Number(value || 0) / viewportHeight.value) * 100).toFixed(4)}%`

const renderedElements = computed(() =>
  (props.whiteboard?.elements || []).map((element) => ({
    ...element,
    style: {
      left: percentX(element.left),
      top: percentY(element.top),
      width: percentX(element.width),
      height: percentY(element.height),
      transform: element.rotate ? `rotate(${element.rotate}deg)` : 'none'
    }
  }))
)
</script>

<style lang="scss" scoped>
.whiteboard-player {
  width: 100%;
}

.whiteboard-stage {
  position: relative;
  width: 100%;
  border-radius: 24rpx;
  overflow: hidden;
  border: 2rpx solid rgba(124, 58, 237, 0.22);
}

.whiteboard-layer {
  position: absolute;
  inset: 0;
}

.whiteboard-element {
  position: absolute;
  box-sizing: border-box;
  transition: box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease;
}

.whiteboard-element.active {
  z-index: 3;
  box-shadow: 0 0 0 4rpx rgba(34, 211, 238, 0.32), 0 0 24rpx rgba(124, 58, 237, 0.28);
}

.whiteboard-element.type-shape {
  border-radius: 18rpx;
}

.whiteboard-element.type-shape.active {
  border: 2rpx solid rgba(124, 58, 237, 0.5);
}

.whiteboard-shape {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

.whiteboard-text {
  width: 100%;
  height: 100%;
  display: block;
  color: #111827;
  font-size: 24rpx;
  line-height: 1.45;
}
</style>
