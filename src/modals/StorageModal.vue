<script>
import {createBasicDialogStore} from "../stores/BasicDialogStore";
const StorageStore = createBasicDialogStore()
export default {
  storageStore: StorageStore,
}
</script>

<script setup>
import {onBeforeUpdate, onMounted, onUpdated, ref} from "vue";
import BitmapStore from "../stores/BitmapStore.ts";
import SvgPreview from "../components/SvgPreview.vue";
import {fromMemPos, getNibble} from "../util/utils.ts";


const data = ref([])
const preview = ref(null)
const ctx = ref(null)

data.value.push  ( { key: 'aaa',
  color: 'aaaa',
  css: 'colorPixelBlock',
  colorStyle: 'e' ,
  replaceColor: 'bbb',
  replaceColorStyle: 'e'  } )
data.value.push  ( { key: 'aaa',
  color: 'aaaa',
  css: 'colorPixelBlock',
  colorStyle: 'e' ,
  replaceColor: 'bbb',
  replaceColorStyle: 'e'  } )


const storageVisible = ref(StorageStore.isVisible())
StorageStore.subscribe( () => {
  storageVisible.value = StorageStore.isVisible()
} )

const columns = [
  {
    key: 'entry',
    title: '',
    dataIndex: 'entry',
    width: 100,
    align: 'left',
  }
];

onBeforeUpdate( () => {
  if (StorageStore.isVisible()) {
      // do anything
      console.log('test...(0):' , getNibble(154,0))
      console.log('test...(1):' , getNibble(154,1))
  }
})

const toSvgData = (data) => {
  data = {  mempos: 0, bitmap: [ 65,0,65,64,128,64,128,196 ], screen: 154, color: 7 }
  let coords = fromMemPos( data.mempos )
  let svgPixels = []

  let svgPixel = { x: coords.coordX, y:coords.coordY, width: 2, height: 1, fill: '' }

}

</script>


<template>
  <a-modal title="Storage"
           :closable="true"
           width="500px"
            :open=storageVisible
           @cancel="StorageStore.toggle()">
    <a-row justify="space-around" align="middle">
      <a-col flex="320">
        <a-table :columns="columns"
                 :data-source="data"
                 :pagination="false"
                 size="small"
                 row-key="key"
                  >

          <template #bodyCell="{ column, record }">
              <div :id="record.key">
                <SvgPreview />
              </div>
          </template>
        </a-table>
      </a-col>
    </a-row>
  </a-modal>
</template>






