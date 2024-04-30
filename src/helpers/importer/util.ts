// @ts-nocheck
import Quantizer from "./conversion/Quantizer";
import {Palettes} from "./profiles/Palettes";
import {ColorSpaces} from "./profiles/ColorSpaces";
import Converter from "./conversion/Converter";
import OrderedDither from "./conversion/OrderedDither";
import {GraphicModes} from "./profiles/GraphicModes";
import 'jimp/browser/lib/jimp.js';

enum PREPARATION {
    YES = true,
    NO = false,
}


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

function cropJimpImage(jimpImage) {
    const isTooSmall = jimpImage.bitmap.width < 320 || jimpImage.bitmap.height < 200;
    let blitImage;

    // if the image is too small, the cropped image is cleared,
    // and then the smaller image is blitted onto it
    // this is a workaround for artifacts when cropping images to larger sizes
    if (isTooSmall) {
        blitImage = jimpImage.clone();
    }
    jimpImage.crop(0, 0, 320, 200);
    if (blitImage !== undefined) {
        //this.clearJimpImage(jimpImage);
        console.log('normally we need to clear the jimpImage now')
        jimpImage.blit(blitImage, 0, 0);
    }
    return jimpImage
}

async function prepare(uploadedFile, uploadedImage, cropMode, brightness) {
    const clonedImage = uploadedFile.value.clone();

    if (cropMode.value === 'fit') {
        uploadedImage.value = await clonedImage.contain(320,200);
    }
    if (cropMode.value === 'fill') {
        uploadedImage.value = await clonedImage.cover(320,200);
    }
    if (cropMode.value === 'crop') {
        uploadedImage.value =cropJimpImage(clonedImage)
    }

    uploadedImage.value.brightness(brightness.value);


}


function convert(image, destination, colorspace, dithering, ditheringStrength) {

    if (image.value == null) {
        return
    }

    const defaultQuantizer = new Quantizer(Palettes.JustPixelPalette, ColorSpaces.byString(colorspace.value));
    const defaultConverter = new Converter(defaultQuantizer);
    const defaultDitherer = new OrderedDither(OrderedDither.presets[dithering.value], ditheringStrength.value);

    const newPixelImage = GraphicModes.bitmap([false,false])
    const resizedImage = resizeToTargetSize(image.value, newPixelImage);
    defaultDitherer.dither(resizedImage.bitmap);
    defaultConverter.convert(resizedImage.bitmap, newPixelImage);
    let ctx = destination.value.getContext('2d');
    ctx.putImageData(getImageDataFromPixelImage(newPixelImage, Palettes.JustPixelPalette), 0, 0);
    return newPixelImage
}



export { PREPARATION, resizeToTargetSize, getImageDataFromPixelImage, prepare, convert }