// @ts-nocheck
import { h } from 'vue'
import BitmapStore from './BitmapStore'
import { Char } from '../components/Char'
import {createBinaryLine, createUUID} from '../util/utils'
import { CopyContext } from './CopyContext'
import {Screen} from "../components/Screen";
import {ToolContext} from "./ToolContext";

const createPixelStore = () => {

    let subscribers = []
    let subscribersCharChange = []
    let memoryPosition = 0
    let memoryPositionBefore = 0
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
    let takeOverColor = true

    // 0 = pixels on, char on
    // 1 = pixels on, char off
    // 2 = pixels off, char off
    // 3 = pixels off, char on
    let gridMode = 0
    let showGridInPixels = true
    let showGridInChars = true
    let copyContext = CopyContext()


    const refreshChar = (memPos, memPos2 = -1) => {
       // console.log('refreshChar...', memPos, memPos2)
        subscribers.forEach( callFunction => {
            callFunction(memPos)
            if (memPos2 != -1 && memoryPosition % ScreenStore.getOffset() == 0) {
                callFunction(memPos2)
            }
        })

    }

    const charChange = (memoryPosition) => {
        subscribersCharChange.forEach( fn => fn(memoryPosition))
    }

    subscribersCharChange.push( (memoryPosition) => {

        // When checkbox "Take over control" is activated, make sure to take over the
        // colors to next char, if the next char has not yet set any colors
        if (ScreenStore.isTakeOverColor()) {
            if (BitmapStore.isMCM()) {

                if (BitmapStore.getForegroundColorMCM(memoryPosition).colorIndex==0  && BitmapStore.getForegroundColorMCM(ScreenStore.getMemoryPositionBefore()) != undefined &&
                    BitmapStore.getForegroundColor2MCM(memoryPosition).colorIndex==0 && BitmapStore.getForegroundColor2MCM(ScreenStore.getMemoryPositionBefore()) != undefined &&
                    BitmapStore.getForegroundColor3MCM(memoryPosition).colorIndex==0 && BitmapStore.getForegroundColor3MCM(ScreenStore.getMemoryPositionBefore()) != undefined  ) {

                    BitmapStore.setForegroundColorMCM(memoryPosition, BitmapStore.getForegroundColorMCM(ScreenStore.getMemoryPositionBefore()))
                    BitmapStore.setForegroundColor2MCM(memoryPosition, BitmapStore.getForegroundColor2MCM(ScreenStore.getMemoryPositionBefore()))
                    BitmapStore.setForegroundColor3MCM(memoryPosition, BitmapStore.getForegroundColor3MCM(ScreenStore.getMemoryPositionBefore()))
                }
            } else {

                if (BitmapStore.getForegroundColorHires(memoryPosition).colorIndex==0  && BitmapStore.getForegroundColorHires(ScreenStore.getMemoryPositionBefore()) != undefined ) {

                    BitmapStore.setBackgroundColorHires(memoryPosition, BitmapStore.getBackgroundColorHires(ScreenStore.getMemoryPositionBefore()).colorIndex)
                    BitmapStore.setForegroundColorHires(memoryPosition, BitmapStore.getForegroundColorHires(ScreenStore.getMemoryPositionBefore()).colorIndex)

                }


            }

        }
    } )

    return {
        clearSubscribers: () => subscribers = [],
        subscribe: (fn) => {
            subscribers.push(fn)
        },
        subscribeCharChange: (fn) => {
            subscribersCharChange.push(fn)
        },
        getOffset: () => {
            if (BitmapStore.isFCM())
                return 64;
            return 8;
        },
        calcMemoryPosition: (x: number, y: number ) => {
            //console.log('calcMemoryPosition: x=' + x + ' y=' + y)
            x = (x - 1) * 8
            y = (y - 1) * 320
            //console.log('calcMemoryPosition: result=', (x+y))
            return x + y
        },
        getMemoryPosition: () => parseInt(memoryPosition),
        setMemoryPosition: (newMemPos) => memoryPosition = parseInt(newMemPos),
        getMemoryPositionBefore: () => parseInt(memoryPositionBefore),
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
        getCopyContext: () => copyContext,
        setCopyContext: (cc) => copyContext = cc,
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
        calculateCoordinates(x: number, y: number) {
            // this helper functions calculates the same object as 'getCoordinates' does but takes the given x and y coordinates as source

            // memoryposition
            // charX
            // charY
            // pixelX
            // pixelY

            let myMemPos = -1
            let myCharX = -1
            let myCharY = -1
            let myPixelX = -1
            let myPixelY = -1

            if (BitmapStore.isMCM()) {
                myCharX =  parseInt(x / 4)
                if ((x/4) % 1 == 0) {
                    myPixelX = ( parseInt(x / 4) * 4 ) / myCharX
                } else {
                    myPixelX = ( x - ( parseInt(x / 4) * 4 ) )
                    if (myPixelX > 0) {
                        myCharX = parseInt(x / 4) + 1
                    }
                }

                myCharY = parseInt(y / 8)
                if ((y/8) % 1 == 0) {
                    myPixelY = ( parseInt(y / 8) * 8 ) / myCharY
                } else {
                    myPixelY = ( y - ( parseInt(y / 8) * 8 ) )
                    if (myPixelY > 0) {
                        myCharY = parseInt(y / 8) + 1
                    }
                }

                myMemPos = this.calcMemoryPosition(myCharX, myCharY)


            }
            return  { memPos: myMemPos, charX: myCharX, charY: myCharY, pixelX: myPixelX, pixelY: myPixelY, coordX: x, coordY: y }


        },
        getCoordinates: () => {
            let coordX = -1
            let coordY = -1
            if (BitmapStore.isMCM()) {
                coordX = ( ( charX-1 ) * 4 ) + (cursorX + 1)
                coordY = ( ( charY-1 ) * 8 ) + (cursorY + 1)
            }
            return { memPos: memoryPosition, charX: charX, charY: charY, pixelX: cursorX + 1, pixelY: cursorY + 1, coordX: coordX, coordY: coordY  }
        },
        build: (offset : number, screenSizeX : number, screenSizeY : number, x : number, y : number) => {
            sizeX = screenSizeX
            sizeY = screenSizeY
            cutX = x
            cutY = y
            screen = []
            let memPos = 0
            let originalY = y
            console.log('build - sizeX=' + sizeX + ' sizeY=' + sizeY + ' x=' + x + ' y=' + y)

            for (let counter = 0; counter < (sizeX * sizeY); counter++) {
                //console.log('counter=' + counter + '  mod=' + counter%sizeX + ' memoryPosition=' + memoryPosition)
                if (counter%sizeX==0) {
                    memPos = offset * ( x + 40 * y )
                    //console.log('mod zugeschlagen --> memoryPosition=' + memoryPosition)
                    y++
                }
                screen.push( h(Char, {  key: createUUID(), memoryIndex: memPos, charX: (counter%screenSizeX)+1, charY: (Math.floor(counter/screenSizeX))+1 } ))
                memPos = memPos + offset
            }
            memoryPosition = offset * ( x + 40 * originalY )
            console.log('build end ', screen.length)
        },
        createCharFCM: (charIndex: number) => {
            let pixels = []
            let color
            let bitmapDataIndex = 0
            if (charIndex > 0) {
                bitmapDataIndex = charIndex
            }

            let x=0
            let y=0
            let doBlink = false

            for (let idx = bitmapDataIndex; idx < bitmapDataIndex + 64; idx++) {

                doBlink = false

                if (bitmapDataIndex == memoryPosition && x == cursorX && y == cursorY) {

                    doBlink = true
                }
                let pixelClass = 'pixel'
                if (showGridInPixels==false) {
                    pixelClass = 'pixelWithoutGrid'
                }


                color = BitmapStore.getColorByIndex(BitmapStore.getBitmap()[idx])
                pixels.push (createPixel( charIndex, x, y, color.r,color.g,color.b, doBlink, pixelClass))
                x++
                if (x==8) {
                    x=0;
                    y++;
                }
                if (y==8) {
                    y=0;
                }


            }
            return pixels
        },
        createChar: (memoryIndex: number) => {
            if (BitmapStore.isFCM()) {
                return ScreenStore.createCharFCM(memoryIndex);  // memoryIndex acts as charIndex
            }

            // ================================================
            // Classic C64 Modes (Hires, Multicolor)
            // ================================================
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
                    if (copyContext.endMemPos > -1) {
                        if (y == copyContext.endMemPos+7 && x == numPixels-1) {
                            pixelClass = 'blinkingCursorEnd'
                        }
                    }
                    if (copyContext.startMemPos > -1) {
                        if (y == copyContext.startMemPos && x == 0) {
                            pixelClass = 'blinkingCursorStart'
                        }
                    }


                    if (BitmapStore.isMCM()) {

                        // ----------------------------
                        //   MCM - Multicolor Mode
                        // ----------------------------
                        let color;

                        //switch (BitmapStore.getBinaryLine(y).substr(x*2,2)) {
                        switch (createBinaryLine(BitmapStore.getBitmap()[y]).binary.substr(x*2,2)) {
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
        refreshAll2: () => {
            let complete=8000
            let step=8
            if (BitmapStore.isFCM()) {
                complete=64000
                step=64
            }
            for (let i = 0; i < complete; i+=step) {
                if (bitmap[i]+bitmap[i+1]+bitmap[i+2]+bitmap[i+3]+bitmap[i+4]+bitmap[i+5]+bitmap[i+6]+bitmap[i+7] > 0) {
                    refreshChar(i)
                }

            }
        },
        refreshAll: () => {
            let complete=8000
            let step=8
            if (BitmapStore.isFCM()) {
                complete=64000
                step=64
            }
            for (let i = 0; i < complete; i+=step) {
                refreshChar(i)
            }

        },
        cursorUp: (screenOneCharUp) => {
            let secondMemoryPos = -1
            cursorY = cursorY - 1
            if (cursorY == -1) {
                memoryPositionBefore = memoryPosition
                memoryPosition = memoryPosition - (40 * ScreenStore.getOffset())
                if ( memoryPosition < ScreenStore.getScreen()[0].props.memoryIndex  ) {
                    memoryPosition = memoryPosition + (40 * ScreenStore.getOffset())
                    cursorY = 0
                    //screenOneCharUp()
                } else {
                    charY = charY - 1
                    cursorY = 7
                    secondMemoryPos=memoryPosition+(40*ScreenStore.getOffset())
                    charChange(memoryPosition)
                    BitmapStore.callSubscribers() // repaint the preview (show cursor)
                }
            }
            refreshChar(memoryPosition,secondMemoryPos )
            BitmapStore.callSubscribersCursorMove()
        },
        cursorDown: (screenOneCharDown) => {
            let secondMemoryPos = -1
            cursorY = cursorY + 1
            if (cursorY == 8) {
                memoryPositionBefore = memoryPosition
                memoryPosition = memoryPosition + (40* ScreenStore.getOffset())
                if ( memoryPosition >= (1000*ScreenStore.getOffset()) || memoryPosition >= (  ScreenStore.getScreenStartMemoryPos() + (40*ScreenStore.getOffset()) * sizeY )) {
                    //console.log('sizeY=' + sizeY)
                    //console.log('calc=' + (  (40* ScreenStore.getOffset()) * sizeY ) )
                    //console.log('memoryPosition (verglichen mit calc)=' + memoryPosition)
                    memoryPosition = memoryPosition - (40 * ScreenStore.getOffset())
                    //console.log('memoryPosition neu=' + memoryPosition)
                    //console.log('cursorY=' + cursorY)
                    cursorY = 7
                    //console.log('333')
                    //screenOneCharDown()
                } else {
//                    console.log('eins weiter')
                    cursorY = 0
                    charY = charY + 1
                    charChange(memoryPosition)
                    BitmapStore.callSubscribers() // repaint the preview (show cursor)
                    secondMemoryPos=memoryPosition-(40*ScreenStore.getOffset())
                }
            }
            refreshChar(memoryPosition,secondMemoryPos )
            BitmapStore.callSubscribersCursorMove()
        },
        cursorRight: (screenOneCharRight) => {
            let secondMemoryPos = -1
            let numPixels = 8
            memoryPositionBefore = memoryPosition
            if (BitmapStore.isMCM()) {
                numPixels = 4
            }
            cursorX = cursorX + 1
            if (cursorX == numPixels) {
                if (charX < sizeX) {
                    memoryPosition = memoryPosition + ScreenStore.getOffset()
                    charX = charX + 1
                    cursorX = 0
                    secondMemoryPos=memoryPosition-ScreenStore.getOffset()
                    charChange(memoryPosition)
                    BitmapStore.callSubscribers() // repaint the preview (show cursor)
                } else {
                    cursorX = numPixels-1
                    //screenOneCharRight()
                    return
                }
            }
            refreshChar(memoryPosition,secondMemoryPos )
            BitmapStore.callSubscribersCursorMove()
        },
        cursorLeft: (screenOneCharLeft) => {
            let secondMemoryPos = -1
            let numPixels = 7
            memoryPositionBefore = memoryPosition
            if (BitmapStore.isMCM()) {
                numPixels = 3
            }
            cursorX = cursorX - 1
            if (cursorX == -1 ) {
                if (charX == 1) {
                    cursorX = 0
                    //screenOneCharLeft()
                } else {
                    memoryPosition = memoryPosition - ScreenStore.getOffset()
                    charX = charX - 1
                    cursorX = numPixels
                    secondMemoryPos=memoryPosition+ScreenStore.getOffset()
                    charChange(memoryPosition)
                    BitmapStore.callSubscribers() // repaint the preview (show cursor)
                }
            }
            refreshChar(memoryPosition, secondMemoryPos )
            BitmapStore.callSubscribersCursorMove()
        },
        actionNew: () => {
            console.log('action new')
            lastAction = 'new'
            BitmapStore.clearBitmap()
            cursorX = 0
            cursorY = 0
            memoryPosition = 0
            BitmapStore.callSubscribers() // repaint the preview (show cursor)   // Fuer den FCM Modus im Moment noch abgeschalten
            ScreenStore.refreshAll()



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
        paint: (colorPart : string) => {
            if (BitmapStore.isFCM()) {
                // calculate the correct index to flip the color in the bitmap array
                let index =   ScreenStore.getMemoryPosition() +  ( ScreenStore.getCursorY() * 8 ) + ScreenStore.getCursorX()
                switch (colorPart) {
                    case "f":
                        BitmapStore.setBitmapAt(index, BitmapStore.getForegroundColor1FCM().colorIndex)
                        break
                    case "f2":
                        BitmapStore.setBitmapAt(index, BitmapStore.getForegroundColor2FCM().colorIndex)
                        break
                    case "f3":
                        BitmapStore.setBitmapAt(index, BitmapStore.getForegroundColor3FCM().colorIndex)
                        break
                    case "f4":
                        BitmapStore.setBitmapAt(index, BitmapStore.getForegroundColor4FCM().colorIndex)
                        break
                    case "f5":
                        BitmapStore.setBitmapAt(index, BitmapStore.getForegroundColor5FCM().colorIndex)
                        break
                    case "f6":
                        BitmapStore.setBitmapAt(index, BitmapStore.getForegroundColor6FCM().colorIndex)
                        break
                    case "f7":
                        BitmapStore.setBitmapAt(index, BitmapStore.getForegroundColor7FCM().colorIndex)
                        break
                    case "f8":
                        BitmapStore.setBitmapAt(index, BitmapStore.getForegroundColor8FCM().colorIndex)
                        break
                    case "f9":
                        BitmapStore.setBitmapAt(index, BitmapStore.getForegroundColor9FCM().colorIndex)
                        break
                    case "f0":
                        BitmapStore.setBitmapAt(index, BitmapStore.getForegroundColor0FCM().colorIndex)
                }


            } else if (BitmapStore.isMCM()) {

                // ----------------------------------------------------
                //  Paint in MCM
                // ----------------------------------------------------
                let pixelPattern = '00'
                let index = ScreenStore.getMemoryPosition() + ScreenStore.getCursorY()
                let charPosition = 7-ScreenStore.getCursorX()

                let binary = createBinaryLine(BitmapStore.getBitmap()[index])

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
                        binary.fragments[0] = pixelPattern
                        break;
                    case 6:
                        binary.fragments[1] = pixelPattern
                        break;
                    case 5:
                        binary.fragments[2] = pixelPattern
                        break;
                    case 4:
                        binary.fragments[3] = pixelPattern
                        break;
                }
                let binaryNew = ''.concat(binary.fragments[0] , binary.fragments[1] , binary.fragments[2] , binary.fragments[3])
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
        checkMemoryPositions: () => false,
        /*
        checkMemoryPositions: () => {
            let offset: number = 8
            let maxCheckPos: number = 7579
            if (BitmapStore.isFCM()) {
                offset = 64
                maxCheckPos = 61340
            }
            let flag: boolean = true
            for (let i: number = 0; i < sizeY; i++) {
                let checkPos: number = ScreenStore.getScreenStartMemoryPos() + i *  (40* offset)
                if (checkPos > maxCheckPos) {
                    flag = false
                }
            }
            return flag
        },

         */
        setClickAndPixel: (cap) => clickAndPixel = cap,
        isClickAndPixel: () => clickAndPixel,
        setTakeOverColor: (toc) => takeOverColor = toc,
        isTakeOverColor: () => takeOverColor
    }
}

function onClick(e, doubleClick) {
    let oldMemPos = ScreenStore.getMemoryPosition()
    console.log('click ', e)
    console.log('click ', doubleClick)
    console.log('click ', e.target)
    console.log('click ', e.target.parentElement)


    ScreenStore.setMemoryPosition(e.target.dataset.memoryIndex)
    ScreenStore.setCursor(e.target.dataset.x, e.target.dataset.y, e.target.parentElement.dataset.charX, e.target.parentElement.dataset.charY)
    ScreenStore.refreshChar(oldMemPos)
    ScreenStore.refreshChar()


    if (ToolContext.isActive() ) {
        if (doubleClick) {
            ToolContext.finish()
        } else {
            ToolContext.doPreview()
        }

    } else {
        BitmapStore.callSubscribersCursorMove()

        if (ScreenStore.isClickAndPixel()) {
            if (doubleClick) {
                ScreenStore.paint('b')
            } else {
                ScreenStore.paint(ScreenStore.getSelectedColorPart())
            }
        }
    }


}

function createPixel(memoryIndex, x, y, r, g, b, blink, pixelClass) {
    let divAttributes = { ondblclick: (e) => onClick(e, true), onClick: (e) => onClick(e, false), 'data-memory-index': memoryIndex, 'data-x': x, 'data-y': y, class: pixelClass, style: 'background-color: rgb(' + r + ', ' + g + ', ' + b + ')' }
    if (blink) {
        divAttributes = { ondblclick: (e) => onClick(e, true), onClick: (e) => onClick(e, false), 'data-memory-index': memoryIndex, 'data-x': x, 'data-y': y, class: 'blinkingCursor', style: 'background-color: rgb(' + r + ', ' + g + ', ' + b + ')' }
    }
    return h('div', divAttributes )
}

const ScreenStore = createPixelStore()

export default ScreenStore