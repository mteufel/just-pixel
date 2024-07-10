<script setup lang="ts">
    const props = defineProps(['pixels'])
</script>

<template>
  <svg width="320" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect v-for="svgPixel in props.pixels"  :x="svgPixel.x" :y="svgPixel.y" :width="svgPixel.width" :height="svgPixel.height" :fill="svgPixel.fill" />
  </svg>
</template>

<style scoped>

</style>