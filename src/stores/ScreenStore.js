import { h } from 'vue';
import BitmapStore from './BitmapStore.js';
import { Char } from '../components/Char';
import { createUUID } from '../utils.js'

const createPixelStore = () => {

    let subscribers = []
    let subscribersCharChange = []
    let memoryPosition = 0
    let screen = []
    let lastMemoryPosition = 0
    let cursorX = 0
    let cursorY = 0
    let charX = 1
    let charY = 1
    let sizeX = 0
    let sizeY = 0
    let cutX = 0
    let cutY = 0
    let lastAction

    // 0 = pixels on, char on
    // 1 = pixels on, char off
    // 2 = pixels off, char off
    // 3 = pixels off, char on
    let gridMode = 0
    let showGridInPixels = true
    let showGridInChars = true

    const refreshChar = (memPos, memPos2 = -1) => {
        subscribers.forEach( callFunction => {
            callFunction(memPos)
            if (memPos2 != -1 && memoryPosition % 8 == 0) {
                callFunction(memPos2)
            }
        })
    }

    const charChange = (memoryPosition) => {
        subscribersCharChange.forEach( fn => fn(memoryPosition))
    }

    return {
        clearSubscribers: () => subscribers = [],
        subscribe: (fn) => {
            subscribers.push(fn)
        },
        subscribeCharChange: (fn) => {
            subscribersCharChange.push(fn)
        },
        getMemoryPosition: () => memoryPosition,
        setMemoryPosition: (newMemPos) => memoryPosition = newMemPos,
        getScreen: () => screen,
        getScreenStartMemoryPos:() => {
            return screen[0].props.memoryIndex
        },
        getCursorX: () => cursorX,
        getCursorY: () => cursorY,
        getCharX: () => charX,
        getCharY: () => charY,
        getShowGridInChars: () => showGridInChars,
        getGridMode: () => gridMode,
        getLastAction: () => lastAction,
        setLastAction: (action) => lastAction = action,
        setGridMode: (mode) => {
            // 0 = pixels on, char on
            if (mode==0) {
                showGridInPixels = true
                showGridInChars = true
            }
            // 1 = pixels on, char off
            if (mode==1) {
                showGridInPixels = true
                showGridInChars = false
            }
            // 2 = pixels off, char off
            if (mode==2) {
                showGridInPixels = false
                showGridInChars = false
            }
            // 3 = pixels off, char on
            if (mode==3) {
                showGridInPixels = false
                showGridInChars = true
            }
            gridMode = mode
        },
        dumpBlinkingCursor: () => {
            console.log('x=' + cursorX)
            console.log('y=' + cursorY)
            console.log('charX=' + charX)
            console.log('charY=' + charY)
            console.log('memoryPosition=' + memoryPosition)
        },
        build: (screenSizeX, screenSizeY, x, y) => {
            sizeX = screenSizeX
            sizeY = screenSizeY
            cutX = x
            cutY = y
            screen = []
            let memPos = 0
            let originalY = y
            //console.log('build - sizeX=' + sizeX + ' sizeY=' + sizeY + ' x=' + x + ' y=' + y)

            for (let counter = 0; counter < (sizeX * sizeY); counter++) {
                //console.log('counter=' + counter + '  mod=' + counter%sizeX + ' memoryPosition=' + memoryPosition)
                if (counter%sizeX==0) {
                    memPos = 8 * ( x + 40 * y )
                    //console.log('mod zugeschlagen --> memoryPosition=' + memoryPosition)
                    y++
                }
                screen.push( h(Char, {  memoryIndex: memPos, xxx: 0, key: createUUID() } ))
                memPos = memPos + 8
            }
            memoryPosition = 8 * ( x + 40 * originalY )
        },
        createColorPixelBlock: (r,g,b, css='colorPixelBlock') => {
            return createPixel(r,g,b, false, css)
        },
        createChar: (memoryIndex) => {
            let pixels = []
            let yy = 0;
            for (let y = memoryIndex; y < memoryIndex + 8; y++) {
                for (let x = 0; x < 8; x++) {
                    let doBlink = false
                    if (memoryIndex == memoryPosition && x == cursorX && yy == cursorY) {
                        doBlink = true
                    }
                    let pixelClass = 'pixel'
                    if (showGridInPixels==false) {
                        pixelClass = 'pixelWithoutGrid'
                    }

                    let color = BitmapStore.getColor(memoryIndex)
                    let colorLow = BitmapStore.getNibble(color, 0)
                    let colorHigh = BitmapStore.getNibble(color, 1)
                    let colLow = BitmapStore.getColorByHexNumber(colorLow)
                    let colHi = BitmapStore.getColorByHexNumber(colorHigh)

                    if (BitmapStore.getBinaryLine(y).substr(x,1) === '1' )  {
                        //pixels.push (createPixel(100,100,100, doBlink, pixelClass))
                        pixels.push (createPixel(colHi.r,colHi.g,colHi.b, doBlink, pixelClass))
                    }  else {
                        // Pixel is not set....
                        //pixels.push (createPixel(0,0,0, doBlink, pixelClass))
                        pixels.push (createPixel(colLow.r,colLow.g,colLow.b, doBlink, pixelClass))
                    }

                }
                yy++;
            }

            return pixels
        },
        refreshChar: (memPos = -1, memPos2 = -1) => {
            // if you call this function without parameters,
            // just the actual char will be refreshed - not more
            if (memPos == -1) {
                refreshChar(memoryPosition)
            } else {
                refreshChar(memPos, memPos2)
            }
        },
        refreshAll: () => {
            for (let i = 0; i < 8000; i+=8) {
                refreshChar(i)
            }
        },
        cursorUp: () => {
            cursorY = cursorY - 1
            if (cursorY == -1) {
                memoryPosition = memoryPosition - (40 * 8)
                if ( memoryPosition < ScreenStore.getScreen()[0].props.memoryIndex  ) {
                    memoryPosition = memoryPosition + (40 * 8)
                    cursorY = 0
                } else {
                    charY = charY - 1
                    cursorY = 7
                    charChange(memoryPosition)
                    BitmapStore.callSubscribers() // repaint the preview (show cursor)
                }
            }
            refreshChar(memoryPosition, ( memoryPosition+(40*8) ) )
        },
        cursorDown: () => {
            cursorY = cursorY + 1
            if (cursorY == 8) {
                memoryPosition = memoryPosition + (40* 8)

                if ( memoryPosition >= (  ScreenStore.getScreenStartMemoryPos() + (40*8) * sizeY )) {

                    console.log('sizeY=' + sizeY)
                    console.log('calc=' + (  (40* 8) * sizeY ) )
                    console.log('memoryPosition (verglichen mit calc)=' + memoryPosition)
                    memoryPosition = memoryPosition - (40 * 8)
                    console.log('memoryPosition neu=' + memoryPosition)
                    console.log('cursorY=' + cursorY)
                    cursorY = 7
                    console.log('333')
                } else {
                    cursorY = 0
                    charY = charY + 1
                    charChange(memoryPosition)
                    BitmapStore.callSubscribers() // repaint the preview (show cursor)
                }
            }
            refreshChar(memoryPosition, (memoryPosition-(40*8) ) )
        },
        cursorRight: () => {
            cursorX = cursorX + 1
            if (cursorX == 8) {
                if (charX < sizeX) {
                    memoryPosition = memoryPosition + 8
                    charX = charX + 1
                    cursorX = 0
                    charChange(memoryPosition)
                    BitmapStore.callSubscribers() // repaint the preview (show cursor)
                } else {
                    cursorX = 7
                }
            }
            refreshChar(memoryPosition, (memoryPosition-8) )
        },
        cursorLeft: () => {
            cursorX = cursorX - 1
            if (cursorX == -1 ) {
                if (charX == 1) {
                    cursorX = 0
                } else {
                    memoryPosition = memoryPosition - 8
                    charX = charX - 1
                    cursorX = 7
                    charChange(memoryPosition)
                    BitmapStore.callSubscribers() // repaint the preview (show cursor)
                }
            }
            refreshChar(memoryPosition, (memoryPosition+8) )
        },
        actionNew: () => {
            lastAction = 'new'
            BitmapStore.clearBitmap()
            cursorX = 0
            cursorY = 0
            memoryPosition = 0
            ScreenStore.refreshAll()
            charChange(memoryPosition)
            BitmapStore.callSubscribers() // repaint the preview (show cursor)
        },
        actionGrid: () => {
            let mode = ScreenStore.getGridMode() + 1
            if (mode == 4) {
                mode = 0
            }
            ScreenStore.setGridMode(mode)
            ScreenStore.refreshAll()
        }
    }
}

function createPixel(r, g, b, blink, pixelClass) {
    let divAttributes = { class: pixelClass, style: 'background-color: rgb(' + r + ', ' + g + ', ' + b + ')' }
    if (blink) {
        divAttributes = { class: 'blinkingCursor', style: 'background-color: rgb(' + r + ', ' + g + ', ' + b + ')' }
    }
    return h('div', divAttributes )
}



const ScreenStore = createPixelStore()

export default ScreenStore