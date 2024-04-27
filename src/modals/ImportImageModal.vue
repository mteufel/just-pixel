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
import 'jimp/browser/lib/jimp.js';
import {GraphicModes} from "../helpers/retropixels-core/profiles/GraphicModes"
import Quantizer from "../helpers/retropixels-core/conversion/Quantizer";
import {ColorSpaces} from "../helpers/retropixels-core/profiles/ColorSpaces";
import Converter from "../helpers/retropixels-core/conversion/Converter";
import OrderedDither from "../helpers/retropixels-core/conversion/OrderedDither";
import {Palettes} from "../helpers/retropixels-core/profiles/Palettes";





const original = ref(null)
const dest = ref(null)
const aaa = ref(null)

const importImageVisible = ref(ImportImageStore.isVisible())
ImportImageStore.subscribe( () => {
  importImageVisible.value = ImportImageStore.isVisible()
} )

function resizeToTargetSize(jimpImage, pixelImage) {
  const result = jimpImage.clone();
  result.resize(pixelImage.mode.width, pixelImage.mode.height);
  return result;
}

function getImageDataFromPixelImage(pixelImage, palette) {
  if (pixelImage === undefined) {
    return new ImageData(1, 1);
  }
  const imageWidth = pixelImage.mode.width * pixelImage.mode.pixelWidth;
  const imageData = new ImageData(imageWidth, pixelImage.mode.height);
  for (let y = 0; y < pixelImage.mode.height; y += 1) {
    for (let x = 0; x < pixelImage.mode.width; x += 1) {
      const paletteIndex = pixelImage.peek(x, y);
      const pixelValue = paletteIndex !== undefined ? palette.colors[paletteIndex] : [0, 0, 0, 0];
      for (let xx = 0; xx < pixelImage.mode.pixelWidth; xx += 1) {
        const index = y * 4 * imageWidth + x * pixelImage.mode.pixelWidth * 4 + xx * 4;
        const [r, g, b] = pixelValue;
        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = 0xff;
      }
    }
  }
  return imageData;
}

const graphicMode = GraphicModes.bitmap
console.log(graphicMode)


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

            const defaultQuantizer = new Quantizer(Palettes.colodore, ColorSpaces.yuv);
            const defaultConverter = new Converter(defaultQuantizer);
            const defaultDitherer = new OrderedDither(OrderedDither.presets["bayer4x4"], 64);

            const newPixelImage = GraphicModes.bitmap([false,false])
            const resizedImage = resizeToTargetSize(jimpImage, newPixelImage);
            defaultDitherer.dither(resizedImage.bitmap);
            defaultConverter.convert(resizedImage.bitmap, newPixelImage);
            console.log('result... ', newPixelImage)
            dest.value = newPixelImage
            var ctx = aaa.value.getContext('2d');
            ctx.putImageData(getImageDataFromPixelImage(newPixelImage, Palettes.colodore), 0, 0);

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
          <div class="img-wrapper" ><canvas width="320" height="200"  class="preview" ref="aaa"></canvas></div>



        </a-flex>

      </div>

      <div class="importImageControls">
          TODO Controls
      </div>
    </a-flex>
  </a-modal>
</template>