<script>
import {createBasicDialogStore} from "../stores/BasicDialogStore";
const ImportImageStore = createBasicDialogStore()
export default {
  importImageStore: ImportImageStore,
}
</script>

<script setup>
import { ref } from "vue";
import { UploadOutlined } from '@ant-design/icons-vue';
import 'jimp/browser/lib/jimp.js';  // Now we have a Jimp-Object available


const original = ref(null)

const importImageVisible = ref(ImportImageStore.isVisible())
ImportImageStore.subscribe( () => {
  importImageVisible.value = ImportImageStore.isVisible()
} )


const okPressed = () => {
  ImportImageStore.toggle()
}

const handleChange = (file, fileList) => {
  console.log('beforeUpload ', file, fileList )



  new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      Jimp.read(reader.result)
          .then(async jimpImage => {

            const coveredImage = await jimpImage.cover(320,200);
            const myImage = await coveredImage.getBase64Async(Jimp.MIME_JPEG);
            original.value = myImage
            console.log('aaaa')



          })
          .catch(err => {
            console.log(err)
          });
    }

  })
  return false;



}


</script>


<template>
  <a-modal title="Import Image"
           :closable="true"
           width="1000px"
           :open=importImageVisible
           @cancel="ImportImageStore.toggle()">
    <template #footer>
      <a-space>
        <a-upload :before-upload="handleChange" :multiple="false" :show-upload-list="false" :list-type="picture">
          <a-button key="upload">
            <UploadOutlined />
            Upload
          </a-button>
        </a-upload>
        <a-button key="submit" type="primary" @click="okPressed">OK</a-button>
      </a-space>
    </template>
    <a-flex :vertical="false">
      <div class="importImagePreview">
        <a-flex :vertical="true">
          <div>Original</div>
          <div class="img-wrapper" ><img :src="original" /></div>
          <div>Preview</div>
          <div><canvas width="320" height="200" class="preview"></canvas></div>
        </a-flex>

      </div>

      <div class="importImageControls">
          TODO Controls
      </div>
    </a-flex>
  </a-modal>
</template>