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

const optimizerVisible = ref(OptimizerStore.isVisible())
OptimizerStore.subscribe( () => optimizerVisible.value = OptimizerStore.isVisible())

onBeforeUpdate( () => {
  if (OptimizerStore.isVisible()) {
    console.log('onBeforeUpdate ---- Optimizer ---- START')

    let cc = ScreenStore.getCopyContext()
    let size = "" + ( (cc.endCharX - cc.startCharX) + 1) + "x" + ( (cc.endCharY-cc.startCharY) + 1 )
    let charsTotal = cc.getSourceIndexList('normal').length
    let duplicates = "?"

    console.log('size=', size)
    console.log('charsTotal=', charsTotal)
    console.log('copy-duplicates=', duplicates)
    console.log('copy-context=', cc)
    console.log('source-mempos=', cc.getSourceIndexList('normal'))



    console.log('onBeforeUpdate ---- Optimizer ------ END')
  }

})


</script>

<template>
  <a-modal title="Bitmap Optimizer"
           width="500px"
           :closable="true"
           :open=optimizerVisible
           @cancel="OptimizerStore.toggle()"
           :okButtonProps="{ style: { display: 'none' } }"
           :cancelButtonProps="{ type: 'primary'}">
  Awesome!!!
  </a-modal>
</template>