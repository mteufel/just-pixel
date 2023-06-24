// @ts-nocheck
import ColorPaletteStore from "./ColorPaletteStore"
import {rgbToRgbValue} from "../util/utils"

const createPngToMcm = () => {

    let png = null
    let palette = []
    ColorPaletteStore.defaultColors().forEach( c => {
        palette.push ( rgbToRgbValue(  c.r, c.g, c.b ) )
    } )

    let backgroundColor = 0

    let colsUsed = []
    let bitmap = []
    let vmem = []
    let cmem = []

    const check8x8 = function(x, y) {
       // console.log('check8x8 ', { x:x, y: y})
        let data = [ 0, 0, 0 ,0 ,0 ,0 ,0 ,0 ]

        for (let _y = 0; _y < 8; ++_y) {
            for (let _x = 0; _x < 8; _x += 2) {
                checkColorsUsed(x, y, getRGB(x + _x, y + _y) & 0xFFFFFF)
            }
        }
    /*
        for (let _y = 0; _y < 8; ++_y) {
            let n3 = 6
            for (let _x = 0; _x < 8; _x += 2) {
                data[y] += getBitPairForColor(getRGB(x + _x, y + _y) & 0xFFFFFF, n3)
                n3 -= 2
            }
        }
        */

        return data

    }

    const checkColorsUsed = function(n, n2, n3) {
        //console.log('checkColorsUsed', {n:n , n2: n2, n3: n3})
        if (n3 == backgroundColor) {
            colsUsed[0] = n3
            return colsUsed
        }
        for (let i = 1; i < 4; ++i) {
            if (colsUsed[i] == n3) {
                return colsUsed;
            }
        }
        for (let j = 1; j < 4; ++j) {
            if (colsUsed[j] == -1) {
                colsUsed[j] = n3
                return colsUsed;
            }
        }
        console.log('Error, too many colors used in 8x8 block: ' + n + ", " + n2 )
    }

    const getRGB = function(x, y) {
        if (x == 0)
            x = 1
        if (y == 0)
            y = 1
        let idx = ( x - 1 + ( (y-1) * 320 ) ) * 4
        let r = png.data[idx]
        let g = png.data[idx+1]
        let b = png.data[idx+2]
        //console.log('getRGB ', { x:y , y: y, idx: idx, r:r,g:g,b:b })
        return rgbToRgbValue(r, g, b)
    }

    const findColorInUsedColorsFor = function(color) {
        let uR = color >> 16 & 0xFF;
        let uG = color >> 8 & 0xFF;
        let uB = color & 0xFF;

        let max = 25555.0;
        let ret = 0;

        for (let i = 0; i < 4; ++i) {
            let r = colsUsed[i] >> 16 & 0xFF
            let g = colsUsed[i] >> 8 & 0xFF
            let b = colsUsed[i] & 0xFF
            let sqrt = Math.sqrt((r - uR) * (r - uR) + (g - uG) * (g - uG) + (b - uB) * (b - uB))
            if (sqrt < max) {
                max = sqrt
                ret = i
            }
        }
        return ret
    }


    const getBitPairForColor = function(n, n2) {
        if (n==backgroundColor) {
            return 0
        }
        for (let i = 1; i < 4; ++i) {
            if (colsUsed[i] == n) {
                return (i & 0x3) << n2
            }
        }
        return (findColorInUsedColorsFor(n) & 0x3) << n2
    }

    const convertToMcm = function() {


        console.log('convertToMcm palette=', palette)

        colsUsed = [-1,-1,-1,-1]

        let n2 = 0;
        let n3 = 0;
        for (let i = 0; i < 200; i += 8) {
            for (let j = 0; j < 320; j += 8) {
                colsUsed[0] = -1
                colsUsed[1] = -1
                colsUsed[2] = -1
                colsUsed[3] = -1
                let data = check8x8(j, i)
                for (let k = 0; k < 8; ++k) {
                    //console.log( { data: data, colsUsed: colsUsed})
                    bitmap[n2 + k] = data[k];
                }
                //final int[] colors = this.getColors();
                //this.vmem[n3] = (colors[1] & 0xF) + ((colors[0] & 0xF) << 4);
                //this.cmem[n3] = (colors[2] & 0xF);
                ++n3;
                n2 += 8;
            }
        }



        console.log('colsUsed ', colsUsed)
        console.log('bitmap ', bitmap)

    }


    return {
        setPng: (newPng) => png = newPng,
        convertToMcm: () => convertToMcm()
    }
}

const PngToMcm = createPngToMcm()

export default PngToMcm