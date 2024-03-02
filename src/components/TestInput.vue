<template>

  <a-space direction="vertical">
    <a-input v-model:value="value" placeholder="Basic usagesdfsdfds" />
    <a-input v-model:value="value" placeholder="Basic usage 2" />
  </a-space>
  
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
export default defineComponent({
  setup() {
    const value = ref<string>('');
    return {
      value,
    };
  },
});
</script>