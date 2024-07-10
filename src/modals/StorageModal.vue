<script>
import {createBasicDialogStore} from "../stores/BasicDialogStore";
const StorageStore = createBasicDialogStore()
export default {
  storageStore: StorageStore,
}
</script>

<script setup>
import {computed, onBeforeUpdate, ref} from "vue";
import SvgPreview from "../components/SvgPreview.vue";
import { DeleteOutlined } from "@ant-design/icons-vue";
import {CopyContext} from "../stores/CopyContext.ts";
import ScreenStore from "../stores/ScreenStore.ts";
import BitmapStore from "../stores/BitmapStore.ts";
import {unmarkArea} from "../util/utils.ts";

const data = ref([])
const onOff = ref(false)
const selection = ref(null)
const removeEnabled = computed( () => !onOff.value )


const storageVisible = ref(StorageStore.isVisible())
StorageStore.subscribe( () => {
  storageVisible.value = StorageStore.isVisible()
} )

const columns = [
  {
    key: 'entry',
    title: '',
    dataIndex: 'entry',
    height: 200,
    align: 'left',
  }
];

onBeforeUpdate( () => {
  if (StorageStore.isVisible()) {
    console.log('onBeforeUpdate Start')
    readFromStore()
    console.log('onBeforeUpdate End')
  }

})

const customRow = (record) => {
  return {
    onDblclick: (event) => {
      console.log('dblclick...', record)
      let original = record.key
      let withoutSvg = original.replace("_svg", "")
      //let pixels = JSON.parse(localStorage.getItem(withoutSvg))
      console.log(ScreenStore.getCopyContext())
      unmarkArea()
      ScreenStore.getCopyContext().svgFromStore = withoutSvg
      StorageStore.toggle()

    }
  };
}

const rowSelection = {
  type: 'radio',
  onChange: (selectedRowKeys,) => {
    onOff.value = true
    selection.value = selectedRowKeys[0]
  }
}

const deletefromStore = () => {
  console.log('delete from store...', selection.value)
  let original = selection.value
  let withoutSvg = original.replace("_svg", "")
  localStorage.removeItem(original)
  localStorage.removeItem(withoutSvg)
  readFromStore()
  onOff.value = false
  selection.value = null
}

const readFromStore = () => {
  onOff.value = false
  selection.value = null
  data.value = []
  Object.keys(localStorage).forEach((key) => {
    if (key.endsWith("_svg")) {
      let pixels = JSON.parse(localStorage.getItem(key))
      let src = JSON.parse(localStorage.getItem(key.replace("_svg", "")))
      data.value.push({
        key: key,
        pixels: pixels,
        src: src
      })
    }

  })
}

</script>


<template>
  <a-modal title="Storage"
           :closable="true"
           width="500px"
           :open=storageVisible
           @cancel="StorageStore.toggle()">
    <template #footer>
      <a-space>
        <a-button :disabled="removeEnabled"  key="defaults" @click="deletefromStore"><DeleteOutlined />Remove</a-button>
        <a-button key="cancel" type="primary" @click="StorageStore.toggle()">Close</a-button>
      </a-space>
    </template>
    <a-row justify="space-around" align="middle">
      <a-col flex="320">
        <a-table :columns="columns"
                 :data-source="data"
                 :pagination="false"
                 size="small"
                 row-key="key"
                 :scroll="{ y: 600 }"
                 :custom-row="customRow"
                 :row-selection="rowSelection">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'entry'"> <SvgPreview :id="record.key" :pixels="record.pixels"/></template>
          </template>


        </a-table>
      </a-col>
    </a-row>
  </a-modal>
</template>






