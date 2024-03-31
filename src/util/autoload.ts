import ScreenStore from "../stores/ScreenStore";
import BitmapStore from "../stores/BitmapStore";

export { autoload }

// set to true only for debugging purposes (developer feature only)
const autoloadActive = true;

const autoload = () => {
    if (autoloadActive) {
        let pixels = getPixelsByName('simple')
        console.log('autoload.... =================================')
        console.log('autoload.... ', pixels)

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
            BitmapStore.activateMulticolorBitmaps()
            ScreenStore.refreshAll()
            ScreenStore.setLastAction("uploaded")
            BitmapStore.callSubscribers()
            ScreenStore.refreshChar()
            ScreenStore.doCharChange(ScreenStore.getMemoryPosition())
        }
        console.log('autoload.... =================================')
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
        bytes: [
                    {  mempos: 0, bitmap: [ 0,0,1,0,0,0,0,4 ], screen: 154, color: 7 },
                    {  mempos: 8, bitmap: [ 0,0,175,110,170,121,170,105 ], screen: 154, color: 7 },
                    {  mempos: 320, bitmap: [ 1,2,5,1,4,0,0,0 ], screen: 154, color: 7 },
                    {  mempos: 328, bitmap: [ 150,69,17,4,17,0,0,0 ], screen: 154, color: 7 }
        ]
    },

]