<script setup>
import { Screen } from "./Screen";
import { ConfigProvider } from "ant-design-vue";
import { theme } from 'ant-design-vue';
const { darkAlgorithm } = theme;

const myTheme = {
  algorithm: [darkAlgorithm],
};

</script>
<template>
  <ConfigProvider :theme="myTheme">
    <screen></screen>
  </ConfigProvider>
</template>
