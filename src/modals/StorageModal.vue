<script>
import {createBasicDialogStore} from "../stores/BasicDialogStore";
const StorageStore = createBasicDialogStore()
export default {
  storageStore: StorageStore,
}
</script>

<script setup>
import {onMounted, onUpdated, ref} from "vue";
import BitmapStore from "../stores/BitmapStore.ts";


const data = ref([])
const preview = ref(null)
const ctx = ref(null)

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

onUpdated(() => {
  if (ctx.value == null) {
    console.log(preview.value)
    ctx.value = preview.value.getContext("2d")
    paintForTheFirstTime(preview, ctx, 1)
  }
})


const paintForTheFirstTime = (preview, ctx, scaleFactor) => {
  preview.value.width =320*scaleFactor.value
  preview.value.height=202*scaleFactor.value
  if (BitmapStore.isMCM()) {
    preview.value.width = preview.value.width * 1.5
    preview.value.height = preview.value.height * 1.5
  }
  ctx.value.clearRect(0,0, preview.value.width, preview.value.height)
 // paintPreviewComplete(ctx, scaleFactor.value)

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
                 :scroll="{ y: 250 }">
          <template #bodyCell="{ column, record }">
              <div :id="record.key"><canvas width="320" height="200" ref="preview" /></div>
          </template>
        </a-table>
      </a-col>
    </a-row>
  </a-modal>
</template>






