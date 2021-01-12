import {h, ref, onMounted} from 'vue'
import ScreenStore from '../stores/ScreenStore'
import BitmapStore from '../stores/BitmapStore'

const StatusBar = {

    setup() {

        let text = ref(null)
        ScreenStore.setSelectedColorPart('f')
        let colorBackground = ref(BitmapStore.getColorByIndex(0))
        let cssBackground = ref('colorPixelBlock')
        let colorForeground = ref(BitmapStore.getColorByIndex(0))
        let cssForeground = ref('colorPixelBlockSelected')
        let colorForeground2 = ref(BitmapStore.getColorByIndex(0))
        let cssForeground2 = ref('colorPixelBlock')
        let colorForeground3 = ref(BitmapStore.getColorByIndex(0))
        let cssForeground3 = ref('colorPixelBlock')

        let colorPicBackground = ref(BitmapStore.getColorByIndex(0))
        let colorPicForeground = ref(BitmapStore.getColorByIndex(0))
        let colorPicForeground2 = ref(BitmapStore.getColorByIndex(0))
        let colorPicForeground3 = ref(BitmapStore.getColorByIndex(0))

        onMounted(() => {

            window.addEventListener("keydown", function(e) {

                if (ScreenStore.isDialogOpen()) {
                    return
                }

                e.preventDefault()
                let s = ['b','f','f2','f3']
                let i = s.findIndex( m => m===ScreenStore.getSelectedColorPart())
                if (i > s.length)
                    i=-1


                if (e.key === 'ArrowRight' && e.altKey==true && e.shiftKey==false && e.ctrlKey==false  ) {
                    if ( (ScreenStore.getSelectedColorPart() === 'f3' && BitmapStore.isMCM()) || (ScreenStore.getSelectedColorPart() === 'f' && !BitmapStore.isMCM()) )
                        return
                    ScreenStore.setSelectedColorPart(s[i+1])
                    onColor( { target: { id: ScreenStore.getSelectedColorPart() }})
                }

                if (e.key === 'ArrowLeft' && e.altKey==true && e.shiftKey==false && e.ctrlKey==false) {
                    if ( (ScreenStore.getSelectedColorPart() === 'b') )
                        return
                    ScreenStore.setSelectedColorPart(s[i-1])
                    onColor( { target: { id: ScreenStore.getSelectedColorPart() }})

                }

                if (e.key === 'X' ) {
                    colorPicBackground.value = colorBackground.value
                    colorPicForeground.value = colorForeground.value
                    if (BitmapStore.isMCM()) {
                        colorPicForeground2.value = colorForeground2.value
                        colorPicForeground3.value = colorForeground3.value
                    }
                }

                if (e.key === 'x' ) {
                    if (BitmapStore.isMCM()) {
                        BitmapStore.setBackgroundColorMCM(colorPicBackground.value.colorIndexHex)
                        BitmapStore.setForegroundColorMCM(ScreenStore.getMemoryPosition(), colorPicForeground.value.colorIndexHex)
                        BitmapStore.setForegroundColor2MCM(ScreenStore.getMemoryPosition(), colorPicForeground2.value.colorIndexHex)
                        BitmapStore.setForegroundColor3MCM(ScreenStore.getMemoryPosition(), colorPicForeground3.value.colorIndexHex)

                    } else {
                        BitmapStore.setBackgroundColorHires(ScreenStore.getMemoryPosition(), colorPicBackground.value.colorIndexHex)
                        BitmapStore.setForegroundColorHires(ScreenStore.getMemoryPosition(), colorPicForeground.value.colorIndexHex)
                    }
                    ScreenStore.refreshChar()
                    ScreenStore.doCharChange(ScreenStore.getMemoryPosition())

                }

            });
        })


        ScreenStore.subscribeCharChange( (memoryPosition) => {
            refreshSelectedColors(memoryPosition)
        } )

        const refreshSelectedColors = (memoryPosition) => {
            if (BitmapStore.isMCM()) {
                text.value = 'MULTICOLOR'
                colorBackground.value = BitmapStore.getBackgroundColorMCM()
                colorForeground.value = BitmapStore.getForegroundColorMCM(memoryPosition)
                colorForeground2.value = BitmapStore.getForegroundColor2MCM(memoryPosition)
                colorForeground3.value = BitmapStore.getForegroundColor3MCM(memoryPosition)
            } else {
                text.value = 'HIRES'
                colorBackground.value = BitmapStore.getBackgroundColorHires(memoryPosition)
                colorForeground.value = BitmapStore.getForegroundColorHires(memoryPosition)
            }
        }

        const onColor = (e) => {
            cssBackground.value = 'colorPixelBlock'
            cssForeground.value = 'colorPixelBlock'
            cssForeground2.value = 'colorPixelBlock'
            cssForeground3.value = 'colorPixelBlock'
            if (e.target.id === 'b') {
                cssBackground.value = 'colorPixelBlockSelected'
            }
            if (e.target.id === 'f') {
                cssForeground.value = 'colorPixelBlockSelected'
            }
            if (e.target.id === 'f2') {
                cssForeground2.value = 'colorPixelBlockSelected'
            }
            if (e.target.id === 'f3') {
                cssForeground3.value = 'colorPixelBlockSelected'
            }
            ScreenStore.setSelectedColorPart(e.target.id)
        }


        return  { text, colorBackground,  cssBackground, colorForeground, cssForeground, colorForeground2, cssForeground2, colorForeground3, cssForeground3,
                  colorPicBackground, colorPicForeground, colorPicForeground2, colorPicForeground3, onColor }


        },
        render() {

            let statusBarContent = []


            if (BitmapStore.isMCM()) {
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('b', this.colorBackground.r,this.colorBackground.g,this.colorBackground.b, this.cssBackground) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f', this.colorForeground.r,this.colorForeground.g,this.colorForeground.b, this.cssForeground) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f2', this.colorForeground2.r,this.colorForeground2.g,this.colorForeground2.b, this.cssForeground2) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f3', this.colorForeground3.r,this.colorForeground3.g,this.colorForeground3.b, this.cssForeground3) ) )

                statusBarContent.push( h('div') )
                statusBarContent.push( h('div') )

                statusBarContent.push( h('div', createBlock('pb', this.colorPicBackground.r,this.colorPicBackground.g,this.colorPicBackground.b) ) )
                statusBarContent.push( h('div', createBlock('pf', this.colorPicForeground.r,this.colorPicForeground.g,this.colorPicForeground.b) ) )
                statusBarContent.push( h('div', createBlock('pf2', this.colorPicForeground2.r,this.colorPicForeground2.g,this.colorPicForeground2.b) ) )
                statusBarContent.push( h('div', createBlock('pf3', this.colorPicForeground3.r,this.colorPicForeground3.g,this.colorPicForeground3.b) ) )

            } else {
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('b', this.colorBackground.r,this.colorBackground.g,this.colorBackground.b, this.cssBackground) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f', this.colorForeground.r,this.colorForeground.g,this.colorForeground.b, this.cssForeground) ) )
                statusBarContent.push( h('div') )
                statusBarContent.push( h('div') )
                statusBarContent.push( h('div') )
                statusBarContent.push( h('div') )
                statusBarContent.push( h('div', createBlock('pb', this.colorPicBackground.r,this.colorPicBackground.g,this.colorPicBackground.b) ) )
                statusBarContent.push( h('div', createBlock('pf', this.colorPicForeground.r,this.colorPicForeground.g,this.colorPicForeground.b) ) )
                statusBarContent.push( h('div') )
                statusBarContent.push( h('div') )
            }

            statusBarContent.push( h('div') )
            statusBarContent.push (h('div', null, this.text ) )
            return statusBarContent

    }
}

const createBlock = (blockId, r, g, b, css = 'colorPixelBlock') => {
    return h('div', { id: blockId, class: css, style: 'background-color: rgb(' + r + ', ' + g + ', ' + b + ')'} )
}


export { StatusBar }