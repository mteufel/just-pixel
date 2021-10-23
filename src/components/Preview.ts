// @ts-nocheck
import {h, ref, toRef, onMounted} from 'vue'
import BitmapStore from '../stores/BitmapStore'
import ScreenStore from '../stores/ScreenStore'
import { Button, Checkbox } from 'ant-design-vue'
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons-vue'

const Preview = {
    props: {
        modeCycle: String
    },
    setup(props) {
        //console.log('Preview Setup....................')
        const modeCycle = toRef(props, 'modeCycle')

        const scaleFactor = ref(1)


        const showCursor = ref(true)
        const clickAndPixel = ref(false)
        const takeOverColor = ref(true)
        const preview = ref(null)
        const ctx = ref(null)
        BitmapStore.subscribe( () => {


            if (ScreenStore.getLastAction() === 'new' || ScreenStore.getLastAction() === 'uploaded') {
                //console.log('aaa')
                paintForTheFirstTime(preview, ctx, scaleFactor, showCursor)
                ScreenStore.setLastAction('')
            }  else {
                //console.log('bbb  ', ctx.value)
                let matrix = generateMatrix()
                paintPreview(ctx, scaleFactor.value, matrix, ScreenStore.getMemoryPosition())
                paintPreviewCursor(ctx, scaleFactor.value, showCursor.value)
            }

        })

        const paintForTheFirstTime = (preview, ctx, scaleFactor, showCursor) => {
            preview.value.width =320*scaleFactor.value
            preview.value.height=202*scaleFactor.value
            if (BitmapStore.isMCM()) {
                preview.value.width = preview.value.width * 1.5
                preview.value.height = preview.value.height * 1.5
            }
            ctx.value.clearRect(0,0, preview.value.width, preview.value.height)
            paintPreviewComplete(ctx, scaleFactor.value)
            paintPreviewCursor(ctx, scaleFactor.value, showCursor.value)
        }

        const zoomIn = () => {
            if (scaleFactor.value == 4) {
                return
            }
            scaleFactor.value = scaleFactor.value + 1
            paintForTheFirstTime(preview, ctx, scaleFactor, showCursor)
        }

        const zoomOut = () => {
            if (scaleFactor.value == 1) {
                return
            }
            scaleFactor.value = scaleFactor.value - 1
            paintForTheFirstTime(preview, ctx, scaleFactor, showCursor)
        }

        const toggleCursor = () => {
            showCursor.value = !showCursor.value
            paintForTheFirstTime(preview, ctx, scaleFactor, showCursor)
        }

        const toggleClickAndPixel = () => {
            clickAndPixel.value = !clickAndPixel.value
            ScreenStore.setClickAndPixel(clickAndPixel.value)
        }

        const toggleTakeOverColor = () => {
            takeOverColor.value = !takeOverColor.value
            ScreenStore.setTakeOverColor(takeOverColor.value)
        }

        onMounted(() => {
            if (ctx.value == null) {
                ctx.value = preview.value.getContext("2d")
                paintForTheFirstTime(preview, ctx, scaleFactor, showCursor)
            }

            if (!BitmapStore.isMCM()) {
                zoomIn()
            }
            BitmapStore.callSubscribers()
        })



        return  {
            preview, scaleFactor, showCursor, clickAndPixel, takeOverColor, zoomIn, zoomOut, toggleCursor, toggleClickAndPixel, toggleTakeOverColor, modeCycle,ctx
        }

    },
    render() {
        //console.log('Preview Render.................... key ', this.modeCycle)
        const content = [
            h( Button.Group, {}, [
                h(Button, { onClick: e => this.zoomIn() }, h(ZoomInOutlined)),
                h(Button, { onClick: e => this.zoomOut() }, h(ZoomOutOutlined)),
            ]),
            h('p', ' '),
            h(Checkbox, { checked: this.showCursor,
                onClick: e => {this.toggleCursor()} }, 'Show cursor in preview'),
            h('p', ' '),
            h(Checkbox, { checked: this.clickAndPixel,
                onClick: e => {this.toggleClickAndPixel()} }, 'Set Pixel on mouse click (double click sets background pixel)' ),
            h('p', ' '),
            h(Checkbox, { checked: this.takeOverColor,
                onClick: e => {this.toggleTakeOverColor()} }, 'Take over colors from last char, if empty' )
        ]
        //console.log('preview render context...', this.ctx)
        return h('div', { class: 'previewContainer', key: this.modeCycle} , [
                          h('canvas', { ref: 'preview', class: 'preview' }),
                          h('div', content)
                        ])

    }

}

function getBit(n, i) {
    return ((n & (1 << i)) != 0)
}

function paintPreviewCursor(ctx, scaleFactor, showCursor) {
    let matrix = generateMatrix()
    let memPos = parseInt(ScreenStore.getMemoryPosition())

    // clear around the around with original bitmap data
    // before setting a new cursor

    let bytesPerChar = 8
    if (BitmapStore.isFCM()) {
        bytesPerChar = 64
    }

    let cleanPreview = []
    cleanPreview.push(memPos - (40*bytesPerChar) - bytesPerChar)
    cleanPreview.push(memPos - (40*bytesPerChar))
    cleanPreview.push(memPos - (40*bytesPerChar) + bytesPerChar)
    cleanPreview.push(memPos - bytesPerChar)
    cleanPreview.push(memPos + bytesPerChar)
    cleanPreview.push(memPos + (40*bytesPerChar) - bytesPerChar)
    cleanPreview.push(memPos + (40*bytesPerChar))
    cleanPreview.push(memPos + (40*bytesPerChar) + bytesPerChar)
    cleanPreview.forEach( m => {
        if (m >= 0) {
            paintPreview(ctx, scaleFactor, matrix, m)
        }

    })
    if (showCursor) {
        paintPreviewWithCursor(ctx, scaleFactor, matrix, memPos)
    } else {
        paintPreview(ctx, scaleFactor, matrix, memPos)
    }

}


function paintPreviewComplete(ctx, scaleFactor) {
    let bytesPerChar = 8
    if (BitmapStore.isFCM()) {
        bytesPerChar = 64
    }
    let matrix = generateMatrix()
   BitmapStore.getBitmap().forEach( (value, index) => {
        if (index%bytesPerChar==0) {
            paintPreview(ctx, scaleFactor, matrix, index)
        }
    })

}

function paintPreviewWithCursor(ctx, scaleFactor, matrix, memoryPosition) {
    return paintPreview(ctx, scaleFactor, matrix, memoryPosition, true)
}

function paintPreviewFCM(ctx, scaleFactor, matrix, memoryPosition, withCursor = false) {
    //console.log('paintPreviewFCM ', {ctx, scaleFactor, matrix, memoryPosition, withCursor})

    let color,r,g,b
    let x = 0
    let y = 0
    let pos = calculatePosition(matrix, memoryPosition)
    pos.x = (memoryPosition - pos.posFrom)/8
    for (let mp = memoryPosition; mp < (memoryPosition+64); mp++) {
        color = BitmapStore.getColorByIndex(BitmapStore.getBitmap()[mp])
        r = color.r
        g = color.g
        b = color.b
        if (withCursor) {
            r = Math.min(255, r*1.5)
            g = Math.min(255, g*1.5)
            b = Math.min(255, b*1.5)

            if (r==0 && g==0 && b==0) {
                r = 50
                g = 50
                b = 50
            }

        }
        setPixel(ctx, scaleFactor, pos.x + x,  pos.y + y, r, g, b)
        x++
        if (x==8) {
            x=0;
            y++;
        }
        if (y==8) {
            y=0;
        }

    }


}

function paintPreviewMCM(ctx, scaleFactor, matrix, memoryPosition, withCursor = false) {
    //console.log('paintPreviewMCM ', { ctx, scaleFactor, matrix, memoryPosition, withCursor } )
    let pos = calculatePosition(matrix, memoryPosition)
    pos.x = memoryPosition - pos.posFrom
    let bg = BitmapStore.getBackgroundColorMCM()
    let fg = BitmapStore.getForegroundColorMCM(memoryPosition)
    let fg2 = BitmapStore.getForegroundColor2MCM(memoryPosition)
    let fg3 = BitmapStore.getForegroundColor2MCM(memoryPosition)
    let x = 0
    let y = 1
    let r,g,b
    for (let mp = memoryPosition; mp < (memoryPosition+8); mp++) {
        if (mp < 7999) {
            let binary = BitmapStore.getBinaryLine(mp).padStart(8,'0')
            let binaryIndex7 = binary.substr(0,2)
            let binaryIndex6 = binary.substr(2,2)
            let binaryIndex5 = binary.substr(4,2)
            let binaryIndex4 = binary.substr(6,2)
            let arr = [binaryIndex7, binaryIndex6, binaryIndex5, binaryIndex4]

            let color = BitmapStore.getBackgroundColorMCM()
            arr.forEach( pixelPattern => {
                switch(pixelPattern) {
                    case "00":
                        color = BitmapStore.getBackgroundColorMCM()
                        break;
                    case "01":
                        color = BitmapStore.getForegroundColorMCM(memoryPosition)
                        break;
                    case "10":
                        color = BitmapStore.getForegroundColor2MCM(memoryPosition)
                        break;
                    case "11":
                        color = BitmapStore.getForegroundColor3MCM(memoryPosition)
                        break;
                }
                r = color.r
                g = color.g
                b = color.b
                if (withCursor) {
                    r = Math.min(255, r*1.5)
                    g = Math.min(255, g*1.5)
                    b = Math.min(255, b*1.5)

                    if (r==0 && g==0 && b==0) {
                        r = 50
                        g = 50
                        b = 50
                    }

                }
                setPixel(ctx, scaleFactor, pos.x + x, pos.y + y, r, g, b)
                x = x + 2
            })
            y = y + 1
            x=0
        }
    }
}

function paintPreview(ctx, scaleFactor, matrix, memoryPosition, withCursor = false) {
    if (BitmapStore.isFCM()) {
        if (memoryPosition > 63999)
            return
        return paintPreviewFCM(ctx, scaleFactor, matrix, memoryPosition, withCursor)
    }

    if (memoryPosition > 7999)
        return
    if (BitmapStore.isMCM()) {
        return paintPreviewMCM(ctx, scaleFactor, matrix, memoryPosition, withCursor)
    }
    let pos = calculatePosition(matrix, memoryPosition)
    pos.x = memoryPosition - pos.posFrom
    let fg = BitmapStore.getForegroundColorHires(memoryPosition)
    let bg = BitmapStore.getBackgroundColorHires(memoryPosition)
    let x = 0
    let y = 1
    let r,g,b
    for (let mp = memoryPosition; mp < (memoryPosition+8); mp++) {
        let bits = BitmapStore.getBitmap()[mp]
        for (let bitNumber = 7; bitNumber > -1; bitNumber--) {

            if (getBit(bits, bitNumber) == true) {
                r = fg.r
                g = fg.g
                b = fg.b
                if (withCursor) {
                    r = Math.min(255, r*1.5)
                    g = Math.min(255, g*1.5)
                    b = Math.min(255, b*1.5)
                }
                setPixel(ctx, scaleFactor, pos.x + x, pos.y + y, r, g, b)
            } else {
                r = bg.r
                g = bg.g
                b = bg.b
                if (withCursor) {
                    r = 255
                    g = 255
                    b = 255
                }
                setPixel(ctx, scaleFactor, pos.x + x, pos.y + y, r, g, b)

            }
            x++
        }
        y++
        x=0
    }
}

function generateMatrix() {
    let matrix = []
    let posCounter = 0
    let yC = 1

    let indiciesPerCharLine = 320    // 8 x 40 Chars
    if (BitmapStore.isFCM()) {
        indiciesPerCharLine = 2560   // 64 x 40 Chars
    }

    for (let y = 0; y < 25; y++) {
        matrix.push( { posFrom: posCounter, posTo: (indiciesPerCharLine-1) + posCounter, y: yC, x: 1 })
        posCounter = indiciesPerCharLine + posCounter
        yC = (yC + 8 )
    }
    return matrix
}

function calculatePosition(matrix, memoryPosition) {
    let context = matrix.filter( m => memoryPosition <= m.posTo && memoryPosition >= m.posFrom  )[0]
    if (context != undefined) {
        context.memoryPosition = memoryPosition
    }
    return context
}

function setPixel(ctx, scaleFactor, x, y, r, g, b) {
    if (ctx.value == null) {
        console.trace();
        console.log(BitmapStore.dumpSubscribers())
    }

    let scaleFactorPlus = 0
    let width = 1

    if (BitmapStore.isMCM()) {
        scaleFactorPlus = 0.5
        width = 2
    }

    ctx.value.fillStyle = 'rgb(' + r +',' + g +',' + b +')'
    ctx.value.fillRect( (x*(scaleFactor+scaleFactorPlus))-1, (y*(scaleFactor+scaleFactorPlus))-1, width*(scaleFactor+scaleFactorPlus), width*(scaleFactor+scaleFactorPlus) )

}

export { Preview }