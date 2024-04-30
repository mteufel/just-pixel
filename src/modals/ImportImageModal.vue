<script>
import {createBasicDialogStore} from "../stores/BasicDialogStore";
const ImportImageStore = createBasicDialogStore()
export default {
  importImageStore: ImportImageStore,
}
</script>

<script setup>
import { ref, watch } from "vue";
import { UploadOutlined } from '@ant-design/icons-vue';
import 'jimp/browser/lib/jimp.js';
import {PREPARATION, convert, prepare} from "../helpers/importer/util";
import BitmapStore from "../stores/BitmapStore";
import ScreenStore from "../stores/ScreenStore";
import {convertBitmap, convertColorram, convertScreenram} from "../helpers/importer/io/C64Layout";
import ColorPaletteStore from "../stores/ColorPaletteStore";

const uploadedFile = ref(null)  // this one holds the original uploaded picture
const uploadedImage = ref(null) // and this is the one which holds the original picture after cropping
const pixelImage = ref(null)    // this is the preview picture as a result of cropping and converting

const original = ref(null)
const preview = ref(null)

const brightness = ref(0)

const colorspace = ref('yuv')
const dithering = ref('bayer4x4')
const ditheringStrengthDisabled = ref(false)
const ditheringStrength = ref(32)
const crop = ref('fit')


const importImageVisible = ref(ImportImageStore.isVisible())
ImportImageStore.subscribe( () =>  importImageVisible.value = ImportImageStore.isVisible()  )


const refreshPixels = async (preparation) => {
  if (preparation) {
    await prepare(uploadedFile, uploadedImage, crop, brightness)
  }
  const image = await uploadedImage.value.getBase64Async(Jimp.MIME_JPEG);
  original.value = image
  pixelImage.value = convert(uploadedImage, preview, colorspace, dithering, ditheringStrength)
}

watch(uploadedFile, async () => await refreshPixels(PREPARATION.YES) )
watch(crop, async () => await refreshPixels(PREPARATION.YES) )
watch(brightness, async () => await refreshPixels(PREPARATION.YES)  )
watch(colorspace, async () => await refreshPixels(PREPARATION.NO)  )

watch(ditheringStrength, async () => await refreshPixels(PREPARATION.NO)  )
watch(dithering, () => {
      ditheringStrengthDisabled.value = false
      if (dithering.value === 'none') {
        ditheringStrengthDisabled.value = true
      }
    pixelImage.value = convert(uploadedImage, preview, colorspace, dithering, ditheringStrength)
    console.log(pixelImage.value)
})


const okPressed = () => {

  BitmapStore.activateMulticolorBitmaps()
  BitmapStore.setBitmap(convertBitmap(pixelImage.value))
  BitmapStore.setScreenRam(convertScreenram(pixelImage.value,2,1))
  BitmapStore.setColorRam(convertColorram(pixelImage.value,3))
  BitmapStore.setBackgroundColorMCM((ColorPaletteStore.colors().find( color  => color.colorIndex===pixelImage.value.colorMaps[0].getNonEmpty(0, 0))))
  ScreenStore.refreshAll()
  ScreenStore.setLastAction("uploaded")
  BitmapStore.callSubscribers()
  ScreenStore.refreshChar()
  ScreenStore.doCharChange(ScreenStore.getMemoryPosition())

  ImportImageStore.toggle()

}

const fileUpload = (file) => {
  new Promise( () => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      Jimp.read(reader.result)
          .then(async jimpImage => {
            uploadedFile.value = jimpImage;
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
           width="1200px"
           :open=importImageVisible
           @cancel="ImportImageStore.toggle()">
    <template #footer>
      <a-space>
        <a-upload :before-upload="fileUpload" :multiple="false" :show-upload-list="false">
          <a-button key="upload">
            <UploadOutlined />
            Upload
          </a-button>
        </a-upload>
        <a-button key="submit" type="primary" @click="okPressed">OK</a-button>
      </a-space>
    </template>
    <a-flex :vertical="false">

      <div class="previews">
        <a-flex :vertical="true">
          <div>Original</div>
          <div class="img-wrapper"><img :src="original" /></div>
          <div>Preview</div>
          <div class="canvas-wrapper"><canvas width="320" height="200" ref="preview"></canvas></div>
        </a-flex>
      </div>

      <div class="controls">
        <div class="grid-container">
          <div>Cropping</div>
          <div>
            <a-radio-group v-model:value="crop" button-style="solid">
              <a-radio-button value="crop">crop</a-radio-button>
              <a-radio-button value="fill">fill</a-radio-button>
              <a-radio-button value="fit">fit</a-radio-button>
            </a-radio-group>
          </div>
          <div>Brightness</div>
          <div>
            <a-slider :min="-1.0" :max="1.0" :step="0.05" v-model:value="brightness" />
          </div>
          <div>Colorspace</div>
          <div>
            <a-radio-group v-model:value="colorspace" button-style="solid">
              <a-radio-button value="rgb">rgb</a-radio-button>
              <a-radio-button value="yuv">yuv</a-radio-button>
              <a-radio-button value="xyz">xyz</a-radio-button>
              <a-radio-button value="rainbow">rainbow</a-radio-button>
            </a-radio-group>
          </div>
          <div>Dithering</div>
          <div>
            <a-row>
              <a-col flex="350px">
                <a-radio-group v-model:value="dithering" button-style="solid">
                  <a-radio-button value="none">none</a-radio-button>
                  <a-radio-button value="bayer2x2">bayer2x2</a-radio-button>
                  <a-radio-button value="bayer4x4">bayer4x4</a-radio-button>
                  <a-radio-button value="bayer8x8">bayer8x8</a-radio-button>
                </a-radio-group>
              </a-col>
              <a-col flex="250px">
                <a-slider :min="0" :max="64" v-model:value="ditheringStrength" :disabled="ditheringStrengthDisabled" />
              </a-col>
            </a-row>
          </div>
        </div>

      </div>
    </a-flex>
  </a-modal>
</template>

<style>

  .previews {
    width: 375px;
  }

  .controls {
    width: 800px;
    height:500px;
    overflow:scroll;
  }

  .img-wrapper {
    height: 200px;
    width: 320px;
    border-color: #000000;
    background-color: #000000;
    position: relative;
    overflow-x:auto;
    overflow-y:auto;
  }

  .img-wrapper > img {
    display: inline-block;
    position: relative;
  }

  .canvas-wrapper {
    height: 200px;
    width: 320px;
    border-color: #000000;
    background-color: #000000;
  }

  .grid-container {
    display: grid;
    grid-template-columns: 125px auto;
    grid-auto-rows: 50px;
    row-gap: 0px;
    column-gap: 5px;
  }

  .grid-container div {
    align-items: center;
    vertical-align: top;
  }

</style>