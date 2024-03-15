// @ts-nocheck
import {h, ref, onMounted} from 'vue'
import ScreenStore from '../stores/ScreenStore'
import BitmapStore from '../stores/BitmapStore'
import { Tooltip } from 'ant-design-vue'
import { defineStatusbarKeys} from '../util/keys'
import bitmapStore from "../stores/BitmapStore";

const StatusBar = {

    setup(context , { emit }) {

        let text = ref(null)
        let textMemPos = ref(null)
        let textChar = ref(null)
        let textPixel = ref(null)
        let textCoordPixel = ref(null)
        ScreenStore.setSelectedColorPart('f')

        let colorBackground = ref(BitmapStore.getColorByIndex(0))
        let colorForeground = ref(BitmapStore.getColorByIndex(0))
        let colorForeground2 = ref(BitmapStore.getColorByIndex(0))
        let colorForeground3 = ref(BitmapStore.getColorByIndex(0))
        let colorForeground4 = ref(BitmapStore.getColorByIndex(0))
        let colorForeground5 = ref(BitmapStore.getColorByIndex(0))
        let colorForeground6 = ref(BitmapStore.getColorByIndex(0))
        let colorForeground7 = ref(BitmapStore.getColorByIndex(0))
        let colorForeground8 = ref(BitmapStore.getColorByIndex(0))
        let colorForeground9 = ref(BitmapStore.getColorByIndex(0))
        let colorForeground0 = ref(BitmapStore.getColorByIndex(0))

        let cssBackground = ref('colorPixelBlock')
        let cssForeground = ref('colorPixelBlockSelected')
        let cssForeground2 = ref('colorPixelBlock')
        let cssForeground3 = ref('colorPixelBlock')
        let cssForeground4 = ref('colorPixelBlock')
        let cssForeground5 = ref('colorPixelBlock')
        let cssForeground6 = ref('colorPixelBlock')
        let cssForeground7 = ref('colorPixelBlock')
        let cssForeground8 = ref('colorPixelBlock')
        let cssForeground9 = ref('colorPixelBlock')
        let cssForeground0 = ref('colorPixelBlock')

        let colorPicForeground = ref(BitmapStore.getColorByIndex(0))
        let colorPicForeground2 = ref(BitmapStore.getColorByIndex(0))
        let colorPicForeground3 = ref(BitmapStore.getColorByIndex(0))

        let toolTipScreenUpper = ref("")
        let toolTipScreenLower = ref("")
        let toolTipColorRAM = ref("")

        onMounted(() => {
            refreshSelectedColors(ScreenStore.getMemoryPosition())
        })


        ScreenStore.subscribeCharChange( (memoryPosition) => {
            refreshSelectedColors(memoryPosition)
        } )

        BitmapStore.subscribeCursorMove( () => {
            statusbar()
        });

        const statusbar = () => {
                let data = ScreenStore.getCoordinates()
                if (BitmapStore.isMCM()) {
                    text.value = 'MULTICOLOR'
                    textMemPos.value = data.memPos  + '\n' + (data.memPos + (+ data.pixelY - 1))
                    textChar.value = data.charX + '/' + data.charY + '\n$' + data.charX.toString(16) + '/$' + data.charY.toString(16)
                    textPixel.value = data.pixelX + '/' + data.pixelY
                    textCoordPixel.value = data.coordX + '/' + data.coordY
                } else if (BitmapStore.isFCM()) {
                    text.value = 'FULL COLOR MODE'
                } else {
                    text.value = 'HIRES'
                }
        }


        const refreshSelectedColors = (memoryPosition) => {
            if (BitmapStore.isMCM()) {
                colorBackground.value = BitmapStore.getBackgroundColorMCM()
                colorForeground.value = BitmapStore.getForegroundColorMCM(memoryPosition)
                colorForeground2.value = BitmapStore.getForegroundColor2MCM(memoryPosition)
                colorForeground3.value = BitmapStore.getForegroundColor3MCM(memoryPosition)
                let temp = BitmapStore.getColorFromScreenRam(memoryPosition)
                toolTipScreenUpper.value = "Screen-RAM (upper nibble): $" + temp.toString(16) + "/%" + + temp.toString(2) + " -> " + colorForeground.value.colorIndex + "/$" + colorForeground.value.colorIndex.toString(16) + "/" + colorForeground.value.color
                toolTipScreenLower.value = "Screen-RAM (lower nibble): $" + temp.toString(16) + "/%" + + temp.toString(2) + " -> " + colorForeground2.value.colorIndex + "/$" + colorForeground2.value.colorIndex.toString(16) + "/" + colorForeground2.value.color
                toolTipColorRAM.value = "Color-RAM $D800: " + colorForeground3.value.colorIndex + "/$" + colorForeground3.value.colorIndex.toString(16) + "/" + colorForeground3.value.color
            } else if (BitmapStore.isFCM()) {
                colorForeground.value = BitmapStore.getForegroundColor1FCM();
                colorForeground2.value = BitmapStore.getForegroundColor2FCM();
                colorForeground3.value = BitmapStore.getForegroundColor3FCM();
                colorForeground4.value = BitmapStore.getForegroundColor4FCM();
                colorForeground5.value = BitmapStore.getForegroundColor5FCM();
                colorForeground6.value = BitmapStore.getForegroundColor6FCM();
                colorForeground7.value = BitmapStore.getForegroundColor7FCM();
                colorForeground8.value = BitmapStore.getForegroundColor8FCM();
                colorForeground9.value = BitmapStore.getForegroundColor9FCM();
                colorForeground0.value = BitmapStore.getForegroundColor0FCM();
            } else {
                colorBackground.value = BitmapStore.getBackgroundColorHires(memoryPosition)
                colorForeground.value = BitmapStore.getForegroundColorHires(memoryPosition)

            }
            statusbar()
        }

        const onColor = (e) => {
            cssBackground.value = 'colorPixelBlock'
            cssForeground.value = 'colorPixelBlock'
            cssForeground2.value = 'colorPixelBlock'
            cssForeground3.value = 'colorPixelBlock'
            cssForeground4.value = 'colorPixelBlock'
            cssForeground5.value = 'colorPixelBlock'
            cssForeground6.value = 'colorPixelBlock'
            cssForeground7.value = 'colorPixelBlock'
            cssForeground8.value = 'colorPixelBlock'
            cssForeground9.value = 'colorPixelBlock'
            cssForeground0.value = 'colorPixelBlock'

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
            if (e.target.id === 'f4') {
                cssForeground4.value = 'colorPixelBlockSelected'
            }
            if (e.target.id === 'f5') {
                cssForeground5.value = 'colorPixelBlockSelected'
            }
            if (e.target.id === 'f6') {
                cssForeground6.value = 'colorPixelBlockSelected'
            }
            if (e.target.id === 'f7') {
                cssForeground7.value = 'colorPixelBlockSelected'
            }
            if (e.target.id === 'f8') {
                cssForeground8.value = 'colorPixelBlockSelected'
            }
            if (e.target.id === 'f9') {
                cssForeground9.value = 'colorPixelBlockSelected'
            }
            if (e.target.id === 'f0') {
                cssForeground0.value = 'colorPixelBlockSelected'
            }

            ScreenStore.setSelectedColorPart(e.target.id)
        }

        defineStatusbarKeys(onColor,  {colorPicForeground, colorPicForeground2, colorPicForeground3, colorForeground, colorForeground2, colorForeground3}  )


        return  { text, textMemPos, textChar, textPixel,
                 colorBackground,  cssBackground, colorForeground, cssForeground, colorForeground2, cssForeground2, colorForeground3, cssForeground3,
                 colorForeground4, cssForeground4, colorForeground5, cssForeground5, colorForeground6, cssForeground6,
                 cssForeground7, colorForeground7,
                 cssForeground8, colorForeground8,
                 cssForeground9, colorForeground9,
                 cssForeground0, colorForeground0,
                 colorPicForeground, colorPicForeground2, colorPicForeground3, onColor, textCoordPixel,
                 toolTipColorRAM,
                 toolTipScreenUpper,
                 toolTipScreenLower}

        },
        render() {

            let statusBarContent = []

            if (BitmapStore.isMCM()) {
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('b', this.colorBackground.r,this.colorBackground.g,this.colorBackground.b, this.cssBackground) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, h(Tooltip, { title: this.toolTipScreenUpper},  createBlock('f', this.colorForeground.r,this.colorForeground.g,this.colorForeground.b, this.cssForeground)  ) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, h(Tooltip, { title: this.toolTipScreenLower},  createBlock('f2', this.colorForeground2.r,this.colorForeground2.g,this.colorForeground2.b, this.cssForeground2)  ) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, h(Tooltip, { title: this.toolTipColorRAM},  createBlock('f3', this.colorForeground3.r,this.colorForeground3.g,this.colorForeground3.b, this.cssForeground3)  ) ) )

                statusBarContent.push( h('div') )
                statusBarContent.push( h('div') )

                statusBarContent.push( h('div', createBlock('pf', this.colorPicForeground.r,this.colorPicForeground.g,this.colorPicForeground.b) ) )
                statusBarContent.push( h('div', createBlock('pf2', this.colorPicForeground2.r,this.colorPicForeground2.g,this.colorPicForeground2.b) ) )
                statusBarContent.push( h('div', createBlock('pf3', this.colorPicForeground3.r,this.colorPicForeground3.g,this.colorPicForeground3.b) ) )

            } else if (BitmapStore.isFCM()) {

                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f', this.colorForeground.r,this.colorForeground.g,this.colorForeground.b, this.cssForeground) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f2', this.colorForeground2.r,this.colorForeground2.g,this.colorForeground2.b, this.cssForeground2) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f3', this.colorForeground3.r,this.colorForeground3.g,this.colorForeground3.b, this.cssForeground3) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f4', this.colorForeground4.r,this.colorForeground4.g,this.colorForeground4.b, this.cssForeground4) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f5', this.colorForeground5.r,this.colorForeground5.g,this.colorForeground5.b, this.cssForeground5) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f6', this.colorForeground6.r,this.colorForeground6.g,this.colorForeground6.b, this.cssForeground6) ) )

                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f7', this.colorForeground7.r,this.colorForeground7.g,this.colorForeground7.b, this.cssForeground7) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f8', this.colorForeground8.r,this.colorForeground8.g,this.colorForeground8.b, this.cssForeground8) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f9', this.colorForeground9.r,this.colorForeground9.g,this.colorForeground9.b, this.cssForeground9) ) )
                statusBarContent.push( h('div', { onClick: (e) => this.onColor(e) }, createBlock('f0', this.colorForeground0.r,this.colorForeground0.g,this.colorForeground0.b, this.cssForeground0) ) )


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

            statusBarContent.push( h('div' ) )
            statusBarContent.push( h('div' ) )

            // here starts div number 12 with a wider width (see justpixel.css) - there are 6 divs in this size so much of information to show:
            statusBarContent.push( h('div', null , h(Tooltip, { title: 'Mode'},  this.text  ) ) )
            statusBarContent.push( h('div' ) )
            statusBarContent.push( h('div', null , h(Tooltip, { title: 'Position in memory'},  this.textMemPos ) ) )
            statusBarContent.push( h('div', null , h(Tooltip, { title: 'Character position (x/y)'},  this.textChar  ) ) )
            statusBarContent.push( h('div', null , h(Tooltip, { title: 'Pixel Position inside character (x/y)'},  this.textPixel  ) ) )
            if (BitmapStore.isMCM() && this.textCoordPixel != '-1/-1') {
                statusBarContent.push( h('div', null , h(Tooltip, { title: 'Pixel Position inside coordinate system 160x200 (x/y)'},  this.textCoordPixel  ) ) )
            } else {
                statusBarContent.push( h('div' ) )
            }


           // statusBarContent.push( h(Tooltip, {}, h('div', null , this.text ) ) )
           // statusBarContent.push (h('div', null , this.text ) )

            return statusBarContent

    }
}

const createBlock = (blockId, r, g, b, css = 'colorPixelBlock') => {
    return h('div', { id: blockId, class: css, style: 'background-color: rgb(' + r + ', ' + g + ', ' + b + ')'} )
}




export { StatusBar }