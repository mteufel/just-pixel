import { h } from 'vue'
import BitmapStore from './BitmapStore.js'
import { Char } from '../components/Char'
import { createUUID } from '../utils.js'

const createPixelStore = () => {

    let subscribers = []
    let subscribersCharChange = []
    let memoryPosition = 0
    let screen = []
    let cursorX = 0
    let cursorY = 0
    let charX = 1
    let charY = 1
    let sizeX = 0
    let sizeY = 0
    let cutX = 0
    let cutY = 0
    let lastAction
    let dialogOpen = false
    let selectedColorPart = 'f'
    let clickAndPixel = false

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
        getMemoryPosition: () => parseInt(memoryPosition),
        setMemoryPosition: (newMemPos) => memoryPosition = parseInt(newMemPos),
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
        setCursorToPosition: () => {
          memoryPosition=238
          charX=2
          charY=2
          cursorX=3
          cursorY=1
            charChange(memoryPosition)
            refreshChar(memoryPosition, -1 )

        },
        setGridMode: (mode: number) => {
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
            console.log('p=' , 7-ScreenStore.getCursorX())
            console.log('x=' , cursorX)
            console.log('y=' , cursorY)
            console.log('charX=' , charX)
            console.log('charY=' , charY)
            console.log('cutX=' , cutX)
            console.log('cutY=' , cutY)
            console.log('memoryPosition=' , memoryPosition)
            console.log(BitmapStore.getScreenRam()[0])
            console.log(BitmapStore.getScreenRam()[0].toString(16))
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
                screen.push( h(Char, {  key: createUUID(), memoryIndex: memPos, charX: (counter%screenSizeX)+1, charY: (Math.floor(counter/screenSizeY))+1 } ))
                memPos = memPos + 8
            }
            memoryPosition = 8 * ( x + 40 * originalY )
        },
        createChar: (memoryIndex) => {
            let numPixels = 8
            if (BitmapStore.isMCM()) {
                numPixels = 4
            }


            let pixels = []
            let yy = 0
            let doBlink = false
            for (let y = memoryIndex; y < memoryIndex + 8; y++) {
                for (let x = 0; x < numPixels; x++) {
                   doBlink = false
                    if (memoryIndex == memoryPosition && x == cursorX && yy == cursorY) {
                        doBlink = true
                    }
                    let pixelClass = 'pixel'
                    if (showGridInPixels==false) {
                        pixelClass = 'pixelWithoutGrid'
                    }

                    if (BitmapStore.isMCM()) {

                        // ----------------------------
                        //   MCM - Multicolor Mode
                        // ----------------------------
                        let color;

                        switch (BitmapStore.getBinaryLine(y).substr(x*2,2)) {
                            case "00":
                                // Color comes from Background $D021
                                color = BitmapStore.getBackgroundColorMCM()
                                break
                            case "01":
                                color = BitmapStore.getForegroundColorMCM(memoryIndex)
                                break
                            case "10":
                                color = BitmapStore.getForegroundColor2MCM(memoryIndex)
                                break
                            case "11":
                                // color comes from Color RAM $D800
                                color = BitmapStore.getForegroundColor3MCM(memoryIndex)
                                break
                        }
                        pixels.push (createPixel( memoryIndex, x, yy, color.r,color.g,color.b, doBlink, pixelClass))

                    } else {

                        // ----------------------------
                        //   HIRES
                        // ----------------------------
                        let color = BitmapStore.getColorFromScreenRam(memoryIndex)
                        let colorLow = BitmapStore.getNibble(color, 0)
                        let colorHigh = BitmapStore.getNibble(color, 1)
                        let colLow = BitmapStore.getColorByHexNumber(colorLow)
                        let colHi = BitmapStore.getColorByHexNumber(colorHigh)

                        if (BitmapStore.getBinaryLine(y).substr(x,1) === '1' )  {
                            pixels.push (createPixel( memoryIndex, x, yy, colHi.r,colHi.g,colHi.b, doBlink, pixelClass))
                        }  else {
                            // Pixel is not set....
                            pixels.push (createPixel( memoryIndex, x, yy, colLow.r,colLow.g,colLow.b, doBlink, pixelClass))
                        }


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
            let numPixels = 8
            if (BitmapStore.isMCM()) {
                numPixels = 4
            }
            cursorX = cursorX + 1
            if (cursorX == numPixels) {
                if (charX < sizeX) {
                    memoryPosition = memoryPosition + 8
                    charX = charX + 1
                    cursorX = 0
                    charChange(memoryPosition)
                    BitmapStore.callSubscribers() // repaint the preview (show cursor)
                } else {
                    cursorX = numPixels-1
                }
            }
            refreshChar(memoryPosition, (memoryPosition-8) )
        },
        cursorLeft: () => {
            let numPixels = 7
            if (BitmapStore.isMCM()) {
                numPixels = 3
            }
            cursorX = cursorX - 1
            if (cursorX == -1 ) {
                if (charX == 1) {
                    cursorX = 0
                } else {
                    memoryPosition = memoryPosition - 8
                    charX = charX - 1
                    cursorX = numPixels
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
            let mode : number = ScreenStore.getGridMode() + 1
            if (mode == 4) {
                mode = 0
            }
            ScreenStore.setGridMode(mode)
            ScreenStore.refreshAll()
        },
        isDialogOpen: () => dialogOpen,
        setDialogOpen: (open) => dialogOpen = open,
        getSelectedColorPart: () => selectedColorPart,
        setSelectedColorPart: (part) => selectedColorPart = part,
        doCharChange: (memoryPosition) => charChange(memoryPosition),
        setCursor: (x,y, cX, cY) => {
            cursorX = parseInt(x)
            cursorY = parseInt(y)
            charX = parseInt(cX)
            charY = parseInt(cY)
        },
        paint: (colorPart) => {
            if (BitmapStore.isMCM()) {
                // ----------------------------------------------------
                //  Paint in MCM
                // ----------------------------------------------------
                let pixelPattern = '00'
                let index = ScreenStore.getMemoryPosition() + ScreenStore.getCursorY()
                let charPosition = 7-ScreenStore.getCursorX()

                let binary = BitmapStore.getBinaryLine(index)
                let binaryIndex7 = binary.substr(0,2)
                let binaryIndex6 = binary.substr(2,2)
                let binaryIndex5 = binary.substr(4,2)
                let binaryIndex4 = binary.substr(6,2)

                switch (colorPart) {
                    case "b":
                        pixelPattern = '00'
                        break;
                    case "f":
                        pixelPattern = '01'
                        break;
                    case "f2":
                        pixelPattern = '10'
                        break;
                    case "f3":
                        pixelPattern = '11'
                }

                switch (charPosition) {
                    case 7:
                        binaryIndex7 = pixelPattern
                        break;
                    case 6:
                        binaryIndex6 = pixelPattern
                        break;
                    case 5:
                        binaryIndex5 = pixelPattern
                        break;
                    case 4:
                        binaryIndex4 = pixelPattern
                        break;
                }
                let binaryNew = ''.concat(binaryIndex7 , binaryIndex6 , binaryIndex5 , binaryIndex4)
                BitmapStore.setBinaryLine(index, binaryNew)


            } else {
                // ----------------------------------------------------
                //  Paint in HIRES-Mode
                // ----------------------------------------------------
                let index = ScreenStore.getMemoryPosition() + ScreenStore.getCursorY()
                if (colorPart === 'b') {
                    BitmapStore.flipBackground(index, 7-ScreenStore.getCursorX())
                }
                if (colorPart === 'f') {
                    BitmapStore.flipForeground(index, 7-ScreenStore.getCursorX())
                }

            }
            ScreenStore.refreshChar();
        },
        setClickAndPixel: (cap) => clickAndPixel = cap,
        isClickAndPixel: () => clickAndPixel,
    }
}

function onClick(e, doubleClick) {
    let oldMemPos = ScreenStore.getMemoryPosition()
    ScreenStore.setMemoryPosition(e.target.dataset.memoryIndex)
    ScreenStore.setCursor(e.target.dataset.x, e.target.dataset.y, e.target.parentElement.dataset.charX, e.target.parentElement.dataset.charY)
    ScreenStore.refreshChar(oldMemPos)
    ScreenStore.refreshChar()
    ScreenStore.doCharChange(ScreenStore.getMemoryPosition())

    if (ScreenStore.isClickAndPixel()) {
        if (doubleClick) {
            ScreenStore.paint('b')
        } else {
            ScreenStore.paint(ScreenStore.getSelectedColorPart())
        }
    }
}

function createPixel(memoryIndex, x, y, r, g, b, blink, pixelClass) {
    let divAttributes = { onClick: (e) => onClick(e, false), onDblClick: (e) => onClick(e, true), 'data-memory-index': memoryIndex, 'data-x': x, 'data-y': y, class: pixelClass, style: 'background-color: rgb(' + r + ', ' + g + ', ' + b + ')' }
    if (blink) {
        divAttributes = { onClick: (e) => onClick(e, false), onDblClick: (e) => onClick(e, true), 'data-memory-index': memoryIndex, 'data-x': x, 'data-y': y, class: 'blinkingCursor', style: 'background-color: rgb(' + r + ', ' + g + ', ' + b + ')' }
    }
    return h('div', divAttributes )
}

const ScreenStore = createPixelStore()

export default ScreenStore