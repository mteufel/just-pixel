// @ts-nocheck
import {h, onMounted, ref } from 'vue'
import BitmapStore from '../stores/BitmapStore'
import ScreenStore from '../stores/ScreenStore'


const GridBitmap = {

    setup() {
        const x = ref(0)
        const y = ref(0)
        console.log('Setup GridBitmap......... ')
        return { x,y}
    },
    render() {
        //console.trace()
        console.log('Render GridBitmap......... ')
        //console.log(BitmapStore.getBitmap())
        let result
        let offset // offset defines number of data inside bitmap-data to define one 8x8 char
        //ScreenStore.clearSubscribers()
        //BitmapStore.clearSubscribers()
        if (BitmapStore.isFCM()) {
            //  console.log('...FCM')
            offset = 64
        } else {
            //  console.log('...OTHERS')
            offset = 8
        }

        ScreenStore.build(offset, 40, 25, this.x, this.y)
        //let calculatedMemoryPosition = ScreenStore.getScreenStartMemoryPos() + ( ( (40*offset) * (ScreenStore.getCharY()-1) ) + (ScreenStore.getCharX()-1) * offset  )
        result =  h('div', { class: 'gridBitmap', }, [ScreenStore.getScreen() ] )
        //ScreenStore.setMemoryPosition(calculatedMemoryPosition)
        //BitmapStore.callSubscribers() // repaint the preview (show cursor)
        console.log('Render GridBitmap End')
        return result
    }

}

export { GridBitmap }
