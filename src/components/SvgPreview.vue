<script setup lang="ts">

    import {ref} from "vue";

    const data = ref({
                        name: 'simple',
                        mode: 'mcm',
                        marker: {startMemPos:0,endMemPos:328,startCharX:1,startCharY:1,endCharX:2,endCharY:2},
                        bytes: [
                          {  mempos: 0, bitmap: [ 65,0,65,64,128,64,128,196 ], screen: 154, color: 7 },
                          {  mempos: 8, bitmap: [ 175,0,175,110,170,121,170,105 ], screen: 154, color: 7 },
                          {  mempos: 320, bitmap: [ 193,130,69,129,68,0,64,0 ], screen: 154, color: 7 },
                          {  mempos: 328, bitmap: [ 150,69,17,4,17,0,0,0 ], screen: 154, color: 7 }
                        ]
                      })

</script>

<template>
  <svg width="320" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="1" height="1" fill="#fff000"/>
  </svg>
</template>

<style scoped>

</style>