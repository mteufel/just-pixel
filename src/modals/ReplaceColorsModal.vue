<script>
import {createBasicDialogStore} from "../stores/BasicDialogStore";
const ReplaceColorStore = createBasicDialogStore()
export default {
  replaceColorStore: ReplaceColorStore,
}
</script>

<script setup>
import {onBeforeUpdate, ref, toRaw } from "vue";
import ScreenStore from "../stores/ScreenStore";
import BitmapStore from "../stores/BitmapStore";
import {createUUID} from "../util/utils";
import ColorPaletteStore from "../stores/ColorPaletteStore";
import {cloneDeep} from "lodash-es";

  const replaceColorVisible = ref(ReplaceColorStore.isVisible())
  ReplaceColorStore.subscribe( () => {
    replaceColorVisible.value = ReplaceColorStore.isVisible()
  } )

const data = ref([])
const selection = ref(null)
const colors = ref(null)

const addColor = (color) => {
  if (data.value.filter( o => o.color.colorIndex == color.colorIndex).length == 0) {
    data.value.push  ( { key: createUUID(),
      color: color,
      css: 'colorPixelBlock',
      colorStyle: { "background-color": 'rgb(' + color.r +',' + color.g +',' + color.b +')' } ,
      replaceColor: color,
      replaceColorStyle: { "background-color": 'rgb(' + color.r +',' + color.g +',' + color.b +')' }  } )
  }
}

onBeforeUpdate( () => {
  data.value = []
  let source = ScreenStore.getCopyContext().getSourceIndexList('normal')
  source.forEach( s => {
    addColor(BitmapStore.getForegroundColorMCM(s))
    addColor(BitmapStore.getForegroundColor2MCM(s))
    addColor(BitmapStore.getForegroundColor3MCM(s))
  })
  colors.value = []
  ColorPaletteStore.colors().forEach( c => {
    let col = Object.assign({}, c)
    col.style = 'background-color: rgb(' + col.r +',' + col.g +',' + col.b +')'
    colors.value.push (col)
  })
  data.value[0].css = "colorPixelBlockSelected"
  selection.value = data.value[0]


})

const okPressed = () => {
  let source = ScreenStore.getCopyContext().getSourceIndexList('normal')
  let my_screen_ram = []
  let my_color_ram = []
  source.forEach( s => {
    my_screen_ram.push(BitmapStore.getColorFromScreenRam(s));
    my_color_ram.push(BitmapStore.getColorRam()[s/8])
  })
  console.log('copy-screen-ram.......', my_screen_ram)
  console.log('copy-color-ram........', my_color_ram)

  data.value.forEach( c => {
    my_screen_ram.forEach( (cc,i) => {
      if (c.color.colorIndex != c.replaceColor.colorIndex) {
        let toCheck1 = BitmapStore.getNibble(cc,1)
        let toCheck2 = BitmapStore.getNibble(cc,0)
        let toCheck3 = my_color_ram[i]

        // check D800
        if (c.color.colorIndex == toCheck3) {
          BitmapStore.setForegroundColor3MCM(source[i], c.replaceColor)
        } else if (c.color.colorIndex == toCheck2) {
          BitmapStore.setForegroundColor2MCM(source[i], c.replaceColor)
        } else if (c.color.colorIndex == toCheck1) {
          BitmapStore.setForegroundColorMCM(source[i], c.replaceColor)
        }

      }

    })
  })



    ScreenStore.refreshAll()
    ScreenStore.setLastAction("refresh-whole-preview")
    BitmapStore.callSubscribers()
    ScreenStore.refreshChar()
    ReplaceColorStore.toggle()

}

const columns = [
  {
    key: 'color',
    title: 'Original',
    dataIndex: 'color',
    width: 100,
    align: 'left',
  },
  {
    key: 'replaceWith',
    title: 'Replace',
    dataIndex: 'replaceWith',
    width: 100,
    align: 'left',
  },
];

const selectColorToReplace = (record) => {
  // remove old selection
  if (selection.value !== null) {
    let x = { css: "colorPixelBlock" }
    Object.assign(data.value.filter(item => selection.value.key === item.key)[0], x);
  }
  // set new selection
  selection.value = toRaw(record)
  selection.value.css = "colorPixelBlockSelected"
  Object.assign(data.value.filter(item => record.key === item.key)[0], selection.value);
}

const changeColor = (event) => {
  let oldKey = selection.value.key
  let toReplace = cloneDeep(selection)
  let selectedColor = ColorPaletteStore.colors()[event.target.id]
  toReplace.value.replaceColor = selectedColor
  toReplace.value.replaceColorStyle = { "background-color": 'rgb(' + selectedColor.r + ',' + selectedColor.g + ',' + selectedColor.b + ')' }
  toReplace.value.key = createUUID()
  Object.assign(data.value.filter(item => oldKey === item.key)[0], toReplace.value);
}

</script>


<template>
  <a-modal title="Replace Colors"
           @ok="okPressed"
           :closable="true"
           width="500px"
           :open=replaceColorVisible
           @cancel="ReplaceColorStore.toggle()">
        <a-row justify="space-around" align="middle">
            <a-col flex="200px">
              <a-table :columns="columns"
                       :data-source="data"
                       :pagination="false"
                       size="small"
                       row-key="key"
                       :scroll="{ y: 250 }">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'color'">
                    <div :id="record.key" class="colorPixelBlock" :style="record.colorStyle" />
                  </template>
                  <template v-else="column.key === 'replaceWith'">
                    <div :id="record.key" :class="record.css" :style="record.replaceColorStyle" @click="selectColorToReplace(record)"/>
                  </template>
                </template>
              </a-table>
            </a-col>
            <a-col flex="auto">
              <div class="paletteColor" style="vertical-align: middle">
                <div v-for="col in colors"  class="color" :id="col.colorIndex" :style="col.style" @click="(event) => changeColor(event)" />
              </div>
            </a-col>
        </a-row>
  </a-modal>
</template>






