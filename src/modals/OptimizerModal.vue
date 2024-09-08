<script>
import {createBasicDialogStore} from "../stores/BasicDialogStore";
const OptimizerStore = createBasicDialogStore()
export default {
  optimizerStore: OptimizerStore,
}
</script>

<script setup>
import {onBeforeUpdate, ref} from 'vue'
import ScreenStore from "../stores/ScreenStore.ts";
import {ReloadOutlined} from "@ant-design/icons-vue";
import {createUUID} from "../util/utils.ts";

const optimizerVisible = ref(OptimizerStore.isVisible())
OptimizerStore.subscribe( () => optimizerVisible.value = OptimizerStore.isVisible())

const activeKey = ref('1');

const rasterX = ref( 1 ) // will be set from marked area
const rasterY = ref( 1 ) // will be set from marked area
const tileX = ref(1)
const tileY = ref(1)

const checkBitmap = ref(true)
const checkScreenRam = ref(true)
const checkColorRam = ref(true)
const data = ref([]);


const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '85px',
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
  }
];

const calculate = () => {
  console.log('Calculate ----------- BEGIN')


  let cc = ScreenStore.getCopyContext()
  let size = "" + ( (cc.endCharX - cc.startCharX) + 1) + "x" + ( (cc.endCharY-cc.startCharY) + 1 )
  let charsTotal = cc.getSourceIndexList('normal').length

  let bytes = charsTotal * 8
  if (checkColorRam.value) {
    console.log('adding colorRam')
    bytes = bytes + charsTotal
  }
  if (checkScreenRam.value) {
    console.log('adding screenRam')
    bytes = bytes + charsTotal
  }

  let duplicates = "?"

  //console.log('size=', size)
  //console.log('charsTotal=', charsTotal)
  //console.log('copy-duplicates=', duplicates)
  console.log('copy-context=', cc)
  console.log('source-mempos=', cc.getSourceIndexList('normal'))
  data.value = [
    { key: createUUID(),name: 'Size', value: size + ', ' + bytes + ' Bytes, ' + ' ' + bytes/1000 + "kb" },
    { key: createUUID(),name: 'Chars total', value: charsTotal },
    { key: createUUID(),name: 'Duplicates', value: duplicates },
  ]
  console.log(data.value)
  console.log('Calculate ------------- END')
}

const getBlock = (memPos, x, y ) => {
  
}


onBeforeUpdate( () => {
  if (OptimizerStore.isVisible()) {
    console.log('onBeforeUpdate ---- Optimizer ---- START')
    console.log('onBeforeUpdate ---- Optimizer ------ END')
  }

})


</script>

<template>
  <a-modal title="Bitmap Optimizer"
           width="900px"
           :closable="true"
           :open=optimizerVisible>
    <template #footer>
      <a-space>
        <a-button key="defaults" @click="calculate"><ReloadOutlined />Calculate</a-button>
        <a-button key="submit" @click="OptimizerStore.toggle()">Show</a-button>
        <a-button key="submit" type="primary" @click="OptimizerStore.toggle()">Cancel</a-button>
      </a-space>
    </template>
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="Settings">
        <div class="controls">
          <div class="grid-container">
            <div>Block Size:</div>
            <div>
              <a-input-number class="number" id="rasterX" :min="1" :max="40" v-model:value="rasterX" />
              <span class="x">x</span>
              <a-input-number class="number" id="rasterY" :min="1" :max="25" v-model:value="rasterY"/>
            </div>
            <div>Tile Size:</div>
            <div>
              <a-input-number class="number" id="tileX" :min="1" :max="40" v-model:value="tileX"/>
              <span class="x">x</span>
              <a-input-number class="number" id="tileY" :min="1" :max="25" v-model:value="tileY"/>
            </div>

            <div>Options:</div>
            <div>
              <a-checkbox v-model:checked="checkBitmap" disabled>Bitmap</a-checkbox><br />
              <a-checkbox v-model:checked="checkScreenRam">Screen-RAM</a-checkbox><br />
              <a-checkbox v-model:checked="checkColorRam">Color-RAM</a-checkbox>
            </div>

            <div></div>
            <div>
              <a-table :columns="columns"
                       :data-source="data"
                       :pagination="false"
                       size="small"
                       row-key="key"
                       :scroll="{ y: 225 }" />
            </div>
          </div>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="Export">
        Export
      </a-tab-pane>
    </a-tabs>


  </a-modal>
</template>

<style>

  .controls {
    width: 850px;
    height:450px;
    overflow:scroll;
  }

  .grid-container {
    display: grid;
    grid-template-columns: 80px auto;
    grid-template-rows: 40px 40px 80px auto;
    grid-auto-rows: 80px;
    row-gap: 0px;
    column-gap: 5px;
  }

  .grid-container div {
    align-items: center;
    vertical-align: top;
  }

  .number {
    width: 60px;
  }

  .x {
    display:inline-block;
    text-align: center;
    padding-top: 5px;
    margin-left: 5px;
    margin-right: 5px;
  }

</style>
