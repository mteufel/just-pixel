import { h, ref, onMounted } from 'vue'
import BitmapStore from '../stores/BitmapStore'
import ScreenStore from '../stores/ScreenStore'
import { Button, Checkbox } from 'ant-design-vue'
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons-vue'

const Preview = {
    setup() {

        const scaleFactor = ref(2)
        const showCursor = ref(true)
        const showArea = ref(false)
        const preview = ref(null)
        const ctx = ref(null)

        BitmapStore.subscribe( () => {

            if (ScreenStore.getLastAction()==='new') {
                paintForTheFirstTime(preview, ctx, scaleFactor, showCursor)
                ScreenStore.setLastAction('')
            } else {
                let matrix = generateMatrix()
                paintPreview(ctx, scaleFactor.value, matrix, ScreenStore.getMemoryPosition())
                paintPreviewCursor(ctx, scaleFactor.value, showCursor.value)
            }

        })

        const paintForTheFirstTime = (preview, ctx, scaleFactor, showCursor) => {
            ctx.value = preview.value.getContext("2d")
            preview.value.width =320*scaleFactor.value
            preview.value.height=200*scaleFactor.value
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

        return  {
            preview, scaleFactor, showCursor, showArea, zoomIn, zoomOut, toggleCursor
        }

    },
    render() {
        return h('div', [ h('canvas', { ref: 'preview', class: 'preview' }),
                          h('div', [
                              h(Button.Group, {}, [
                                  h(Button, { onClick: $event => this.zoomIn() }, h(ZoomInOutlined)),
                                  h(Button, { onClick: $event => this.zoomOut() }, h(ZoomOutOutlined)),
                              ]),
                              h('p', ' '),
                              h(Checkbox, { checked: this.showCursor,
                                            onClick: $event => this.toggleCursor() }, 'Show cursor')
                          ])])
    }

}

function getBit(n, i) {
    return ((n & (1 << i)) != 0)
}

function paintPreviewCursor(ctx, scaleFactor, showCursor) {
    let matrix = generateMatrix()
    let memPos = ScreenStore.getMemoryPosition()

    // clear around the around with original bitmap data
    // before setting a new cursor

    let cleanPreview = []
    cleanPreview.push(memPos - (40*8) - 8)
    cleanPreview.push(memPos - (40*8))
    cleanPreview.push(memPos - (40*8) + 8)
    cleanPreview.push(memPos - 8)
    cleanPreview.push(memPos + 8)
    cleanPreview.push(memPos + (40*8) - 8)
    cleanPreview.push(memPos + (40*8))
    cleanPreview.push(memPos + (40*8) + 8)
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
    let matrix = generateMatrix()
    BitmapStore.getBitmap().forEach( (value, index) => {
        if (index%8==0) {
            paintPreview(ctx, scaleFactor, matrix, index)
        }
    })
}

function paintPreviewWithCursor(ctx, scaleFactor, matrix, memoryPosition) {
    return paintPreview(ctx, scaleFactor, matrix, memoryPosition, true)
}

function paintPreview(ctx, scaleFactor, matrix, memoryPosition, withCursor = false) {
    let pos = calculatePosition(matrix, memoryPosition)
    pos.x = memoryPosition - pos.posFrom
    let fg = BitmapStore.getForegroundColor(memoryPosition)
    let bg = BitmapStore.getBackgroundColor(memoryPosition)
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
    for (let y = 0; y < 25; y++) {
        matrix.push( { posFrom: posCounter, posTo: 319 + posCounter, y: yC, x: 1 })
        posCounter = 320 + posCounter
        yC = (yC + 8 )
    }
    return matrix
}

function calculatePosition(matrix, memoryPosition) {
    let context = matrix.filter( m => memoryPosition <= m.posTo && memoryPosition >= m.posFrom  )[0]
    context.memoryPosition = memoryPosition
    return context
}

function setPixel(ctx, scaleFactor, x, y, r, g, b) {
    ctx.value.fillStyle = 'rgb(' + r +',' + g +',' + b +')'
    ctx.value.fillRect( (x*scaleFactor)-1, (y*scaleFactor)-1, 1*scaleFactor, 1*scaleFactor )
}

export { Preview }