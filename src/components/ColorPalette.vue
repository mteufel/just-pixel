<script setup lang="ts">
import ColorPaletteStore from "../stores/ColorPaletteStore";
import {ref, unref} from "vue";
import {Color, PalettColor} from "../domain/Color";

const props = defineProps({
  multiSelection: Boolean,
})
const emit = defineEmits(['selectionChanged'])

const colors = ref<Array<PalettColor>>([])    // construcs a ref containing an Array or Colors

ColorPaletteStore.colors().forEach( c => {
  let col:PalettColor = {
    ...c,
    selected: true,
    style: 'background-color: rgb(' + c.r +',' + c.g +',' + c.b +')',
    css: 'Color'
  }
  colors.value.push (col)
})

const colorSelected = (event:any) => {

  let col = unref(colors).find ( c => c.colorIndex == event.target.id)
  if (col != undefined) {

    col.selected = !col.selected
    if (col.selected) {
      col.css = 'Color'
    } else {
      if (col.colorIndex==0) {
        col.css = 'Color CrossedWhite'
      } else {
        col.css = 'Color Crossed'
      }

    }

    if (props.multiSelection == true) {
      let selected:Array<Color> = []
      unref(colors).forEach( c => {
        if (c.selected) {
          selected.push(ColorPaletteStore.colors()[c.colorIndex])
        }
      })
      emit('selectionChanged', selected)
    } else {
      col.css = 'Color'
      let selectedColor = ColorPaletteStore.colors()[event.target.id]
      emit('selectionChanged', selectedColor)
    }
  }

}
</script>

<template>
  <div class="ColorPaletteLayout" style="vertical-align: middle">
    <div v-for="col in colors"
         :class="col.css" :id="col.colorIndex.toString()"
         :style="col.style"
         @click="(event) => colorSelected(event)" />
  </div>
</template>

<style scoped>
  .ColorPaletteLayout {
      display: grid;
      margin-left: 10px;
      margin-right: 10px;
      grid-template-columns: 20px 20px 20px 20px 20px 20px;
      grid-auto-rows: 20px;
  }
  .Color {
    border-style: dotted;
    border-width: 1px;
    height: 20px;
    border-color: #333333
  }

  .Color:hover {
    border-style: dotted;
    border-width: 2px;
    border-color: #aaaaaa
  }

  .Crossed {
    background:
        linear-gradient(to top left,
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,0) calc(50% - 0.8px),
        rgba(0,0,0,1) 50%,
        rgba(0,0,0,0) calc(50% + 0.8px),
        rgba(0,0,0,0) 100%),
        linear-gradient(to top right,
        rgba(0,0,0,0) 0%,
        rgba(0,0,0,0) calc(50% - 0.8px),
        rgba(0,0,0,1) 50%,
        rgba(0,0,0,0) calc(50% + 0.8px),
        rgba(0,0,0,0) 100%);
  }

  .CrossedWhite {
    background:
        linear-gradient(to top left,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0) calc(50% - 0.8px),
        rgba(255,255,255,1) 50%,
        rgba(255,255,255,0) calc(50% + 0.8px),
        rgba(255,255,255,0) 100%),
        linear-gradient(to top right,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0) calc(50% - 0.8px),
        rgba(255,255,255,1) 50%,
        rgba(255,255,255,0) calc(50% + 0.8px),
        rgba(255,255,255,0) 100%);
  }


</style>