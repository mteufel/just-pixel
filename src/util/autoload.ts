import ScreenStore from "../stores/ScreenStore";
import BitmapStore from "../stores/BitmapStore";
import {CopyContext} from "../stores/CopyContext";

export { autoload }

// set to true only for debugging purposes (developer feature only)
const autoloadActive = true;

const autoload = () => {
    if (autoloadActive) {
        let pixels = getPixelsByName('simple')
        //console.log('autoload.... =================================')
        //console.log('autoload.... ', pixels)

        if (pixels?.mode === 'mcm') {
            pixels.bytes.forEach( by => {
                let idx = 0
                if (by.mempos > 0) {
                    idx = by.mempos
                }
                BitmapStore.getScreenRam()[idx/8] = by.screen
                BitmapStore.getColorRam()[idx/8] = by.color

                let cnt = 0
                by.bitmap.forEach( bitmapValue => {
                    BitmapStore.getBitmap()[idx+cnt] = bitmapValue
                    cnt++
                })
            })

            ScreenStore.setCopyContext(CopyContext())
            ScreenStore.refreshChar(pixels.marker.startMemPos)
            ScreenStore.refreshChar(pixels.marker.endMemPos)
            let cc = ScreenStore.getCopyContext()
            cc.startMemPos = pixels.marker.startMemPos
            cc.endMemPos = pixels.marker.endMemPos
            cc.startCharX = pixels.marker.startCharX
            cc.startCharY = pixels.marker.startCharY
            cc.endCharX = pixels.marker.endCharX
            cc.endCharY = pixels.marker.endCharY

            BitmapStore.activateMulticolorBitmaps()
            ScreenStore.refreshAll()
            ScreenStore.setLastAction("uploaded")
            BitmapStore.callSubscribers()
            ScreenStore.refreshChar()
            ScreenStore.doCharChange(ScreenStore.getMemoryPosition())
        }
        //console.log('autoload.... =================================')
    } else {
        console.log('autoload deactivated =========================')
    }
    return autoloadActive
}

const getPixelsByName = (name:string) => {
    return pixels.find ( (e) => e.name === name  )
}

const pixels = [
    {
        name: 'simple',
        mode: 'mcm',
        marker: {startMemPos:0,endMemPos:328,startCharX:1,startCharY:1,endCharX:2,endCharY:2},
        bytes: [
                    {  mempos: 0, bitmap: [ 1,0,1,0,0,0,0,4 ], screen: 154, color: 7 },
                    {  mempos: 8, bitmap: [ 175,0,175,110,170,121,170,105 ], screen: 154, color: 7 },
                    {  mempos: 320, bitmap: [ 1,2,5,1,4,0,0,0 ], screen: 154, color: 7 },
                    {  mempos: 328, bitmap: [ 150,69,17,4,17,0,0,0 ], screen: 154, color: 7 }
        ]
    },
    {
        name: 'one_char',
        mode: 'mcm',
        marker: {startMemPos:0,endMemPos:0,startCharX:1,startCharY:1,endCharX:1,endCharY:1},
        bytes: [
            {  mempos: 0, bitmap: [ 3,2,5,1,4,0,0,0 ], screen: 154, color: 7 },
        ]
    }


]