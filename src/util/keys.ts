// @ts-nocheck
import {KeyDownBuilder} from "../builders/KeyDownBuilder"
import ScreenStore from "../stores/ScreenStore"
import BitmapStore from "../stores/BitmapStore";
import ColorPaletteStore from "../stores/ColorPaletteStore";
import {ByteDumperStore} from "../components/ByteDumperModal";
import {PasteStore} from "../components/PasteModal";
import {ToolContext, ToolMode} from "../stores/ToolContext";
import {CopyContext} from "../stores/CopyContext";
import {TextStore} from "../components/TextModal";
import ReplaceColorsModal from "../components/ReplaceColorsModal.vue";
import {notification} from "ant-design-vue";
import {toBinary, arrayRotate, calculateMempos, calculateXY} from "../util/utils"

enum DIRECTION {
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
}

const defineCursorKeys = () => {
    KeyDownBuilder.key('ArrowDown', () => cursorDown(), KeyDownBuilder.help("Cursor", 0, ["ArrowDown"], "Moves the cursor one pixel down"))
    KeyDownBuilder.key('ArrowUp', () => cursorUp(), KeyDownBuilder.help("Cursor", 0, ["ArrowUp"], "Moves the cursor one pixel up"))
    KeyDownBuilder.key('ArrowLeft', () => cursorLeft(), KeyDownBuilder.help("Cursor", 0, ["ArrowLeft"], "Moves the cursor one pixel to the left"))
    KeyDownBuilder.key('ArrowRight', () => cursorRight(), KeyDownBuilder.help("Cursor", 0, ["ArrowRight"], "Moves the cursor one pixel to the right"))
    KeyDownBuilder.key('g', () => ScreenStore.actionGrid(), KeyDownBuilder.help("Cursor", 0, ["g"], "Toggles the grid lines"))
}

const definePaintKeys = () => {
    KeyDownBuilder.key('1', () => BitmapStore.isFCM() ?  ScreenStore.paint('f') : ScreenStore.paint('b'), KeyDownBuilder.help("Paint", 0, ["1"], "MCM: Paint with background color, FCM: Paint Color 1"))
    KeyDownBuilder.key('2', () => BitmapStore.isFCM() ?  ScreenStore.paint('f2') : ScreenStore.paint('f'), KeyDownBuilder.help("Paint", 0, ["2"], "MCM: Color 1 (lower Screen-Ram), FCM: Paint Color 2"))
    KeyDownBuilder.key('3', () => BitmapStore.isFCM() ?  ScreenStore.paint('f3') : ScreenStore.paint('f2'), KeyDownBuilder.help("Paint", 0, ["3"], "MCM: Color 2 (upper Screen-Ram), FCM: Paint Color 3"))
    KeyDownBuilder.key('4', () => BitmapStore.isFCM() ?  ScreenStore.paint('f4') : ScreenStore.paint('f3'), KeyDownBuilder.help("Paint", 0, ["4"], "MCM: Color 3 (Color-RAM), FCM: Paint Color 4"))
    KeyDownBuilder.key('d', () => dump(), KeyDownBuilder.help("Paint", 0, ["d"], "Dump metadata about marked area on console.log (only for developers)"))
    KeyDownBuilder.key('m', () => markArea(), KeyDownBuilder.help("Paint", 0, ["m"], "Mark an area, press the key twice to define start and end of the area"))
    KeyDownBuilder.key('u', () => unmarkArea(), KeyDownBuilder.help("Paint", 0, ["u"], "Removes marked area"))
    KeyDownBuilder.key('#', () => dumpBytes(), KeyDownBuilder.help("Paint", 0, ["#"], "Dump bytes of the actual char on console.log"))
    KeyDownBuilder.key('s', () => exportSprite(), KeyDownBuilder.help("Paint", 0, ["s"], "Export sprite: move the cursor to the starting point, the exporter will export one full MCM Sprite 12x21 pixels wide"))
    KeyDownBuilder.key('t', () => insertText(), KeyDownBuilder.help("Paint", 0, ["t"], "Text tool (not yet available)"))
    KeyDownBuilder.key('e', () => exportArea(), KeyDownBuilder.help("Paint", 0, ["e"], "Exports marked area to assembler code (byte instructions)"))
    KeyDownBuilder.ctrl('v', () => doCopy(), KeyDownBuilder.help("Paint", 0, ["CTRL","v"], "Copy/Paste marked area"))
    KeyDownBuilder.shift('v', ()  => copyDialog(), KeyDownBuilder.help("Paint", 0, ["SHIFT","v"], "Copy/Pasted marked area with mirror (dialog)"))
    KeyDownBuilder.key('l', () =>  useTool(ToolMode.LINE) , KeyDownBuilder.help("Paint", 0, ["l"], "Paint a line"))
    KeyDownBuilder.key('c', () =>  useTool(ToolMode.CIRCLE) , KeyDownBuilder.help("Paint", 0, ["c"], "Paint a circle or ellipse"))
    KeyDownBuilder.key('Delete', () => deleteKeyPressed(), KeyDownBuilder.help("Paint", 0, ["Del"], "Clear actual char"))
    KeyDownBuilder.key('r', () =>  replaceColors() , KeyDownBuilder.help("Paint", 0, ["r"], "Open a dialog to replace colors in the marked area"))
    KeyDownBuilder.key('Escape', () => escapePressed() )

    KeyDownBuilder.shift('ArrowUp', () => pixelMove(DIRECTION.UP), KeyDownBuilder.help("Paint", 0, ["Shift", "ArrowUp"], "Move pixels in selection 1 pixel up"))
    KeyDownBuilder.shift('ArrowLeft', () => pixelMove(DIRECTION.LEFT), KeyDownBuilder.help("Paint", 0, ["Shift", "ArrowLeft"], "Move pixels in selection 1 pixel to the left"))
    KeyDownBuilder.shift('ArrowRight', () => pixelMove(DIRECTION.RIGHT), KeyDownBuilder.help("Paint", 0, ["Shift", "ArrowRight"], "Move pixels in selection 1 pixel to the right"))


}

const defineStatusbarKeys = (onColorFn, colorsHolder) => {
    KeyDownBuilder.alt('ArrowRight', () => moveColorSelectorInStatusbar('ArrowRight', onColorFn), KeyDownBuilder.help("StatusBar", 0, ["Alt", "ArrowRight"], "Move color selector in statusbar one to the right"))
    KeyDownBuilder.alt('ArrowLeft', () => moveColorSelectorInStatusbar('ArrowLeft', onColorFn), KeyDownBuilder.help("StatusBar", 0, ["Alt", "ArrowLeft"], "Move color selector in statusbar one to the left"))
    KeyDownBuilder.shift('x', () => rememberColors(colorsHolder), KeyDownBuilder.help("StatusBar", 0, ["Shift","x"], "Remember colors in the actual char"))
    KeyDownBuilder.key('x', () => acceptRememberedColors(colorsHolder), KeyDownBuilder.help("StatusBar", 0, ["x"], "Take over remembered colors to the actual char"))
}

const defineColorPaletteKeys = (context) => {
    KeyDownBuilder.ctrl('ArrowRight', () => selectColorOnCursorKey('ArrowRight', context), KeyDownBuilder.help("ColorPalette", 0, ["CTRL", "ArrowRight"], "Move color selector in color palette one to the right"))
    KeyDownBuilder.ctrl('ArrowLeft', () => selectColorOnCursorKey('ArrowLeft', context), KeyDownBuilder.help("ColorPalette", 0, ["CTRL", "ArrowLeft"], "Move color selector in color palette one to the left"))
    KeyDownBuilder.ctrl('ArrowDown', () => selectColorOnCursorKey('ArrowDown', context), KeyDownBuilder.help("ColorPalette", 0, ["CTRL", "ArrowDown"], "Move color selector in color palette one down"))
    KeyDownBuilder.ctrl('ArrowUp', () => selectColorOnCursorKey('ArrowUp', context), KeyDownBuilder.help("ColorPalette", 0, ["CTRL", "ArrowUp"], "Move color selector in color palette one up"))
}

function cursorUp() {
    ScreenStore.cursorUp()
    if (ToolContext.isActive()) {
        ToolContext.doPreview()
    }
}
function cursorDown() {
    ScreenStore.cursorDown()
    if (ToolContext.isActive()) {
        ToolContext.doPreview()
    }
}
function cursorLeft() {
    ScreenStore.cursorLeft()
    if (ToolContext.isActive()) {
        ToolContext.doPreview()
    }
}
function cursorRight() {
    ScreenStore.cursorRight()
    if (ToolContext.isActive()) {
        ToolContext.doPreview()
    }
}


function exportArea() {
    ByteDumperStore.intoByteDumperMode()
    ByteDumperStore.toggle()
}

function moveColorSelectorInStatusbar(key, onColorFn) {
    let s = ['b','f','f2','f3','f4','f5', 'f6', 'f7', 'f8', 'f9', 'f0']
    let i = s.findIndex( m => m===ScreenStore.getSelectedColorPart())
    if (i > s.length)
        i=-1

    if (key === 'ArrowRight') {
        if ( ( BitmapStore.isMCM() &&  ScreenStore.getSelectedColorPart() === 'f3' ) ||
            ( BitmapStore.isFCM() &&  ScreenStore.getSelectedColorPart() === 'f6' ) ||
            ( !BitmapStore.isMCM() && !BitmapStore.isFCM() && ScreenStore.getSelectedColorPart() === 'f' ) ) {
            return
        }
        ScreenStore.setSelectedColorPart(s[i+1])
        onColorFn( { target: { id: ScreenStore.getSelectedColorPart() }})
    }

    if (key === 'ArrowLeft') {
        if ( ( BitmapStore.isFCM() &&  ScreenStore.getSelectedColorPart() === 'f' ) ||
            (ScreenStore.getSelectedColorPart() === 'b') ) {
            return
        }
        ScreenStore.setSelectedColorPart(s[i-1])
        onColorFn( { target: { id: ScreenStore.getSelectedColorPart() }})
    }

}


function selectColorOnCursorKey(cursorKey, context) {

    if (cursorKey === 'ArrowRight' ) {
        if (context.selectedColorIndex.value == context.palette.value[context.palette.value.length-1].colorIndex)
            return
        context.selectedColorIndex.value = context.selectedColorIndex.value + 1
    }

    if (cursorKey === 'ArrowLeft') {
        if (context.selectedColorIndex.value == 0)
            return
        context.selectedColorIndex.value = context.selectedColorIndex.value - 1
    }

    if (cursorKey === 'ArrowDown') {
        let newIndex = context.selectedColorIndex.value + 6
        if (newIndex > context.palette.value.length - 1)
            return
        context.selectedColorIndex.value = newIndex
    }

    if (cursorKey === 'ArrowUp') {
        let newIndex = context.selectedColorIndex.value - 6
        if (newIndex < 0)
            return
        context.selectedColorIndex.value = newIndex
    }
}



function  acceptRememberedColors(colorsHolder) {

    console.log('acceptRem ',colorsHolder)
    // x (lowercase x) , takes the remembered colors to achtive char

    if (BitmapStore.isFCM()) {
        console.log('Remembering on FCM not yet implemented')
        return
    }

    if (BitmapStore.isMCM()) {
        BitmapStore.setForegroundColorMCM(ScreenStore.getMemoryPosition(), ColorPaletteStore.getColorByIndex( colorsHolder.colorPicForeground.value.colorIndex ))
        BitmapStore.setForegroundColor2MCM(ScreenStore.getMemoryPosition(), ColorPaletteStore.getColorByIndex( colorsHolder.colorPicForeground2.value.colorIndex ))
        BitmapStore.setForegroundColor3MCM(ScreenStore.getMemoryPosition(), ColorPaletteStore.getColorByIndex( colorsHolder.colorPicForeground3.value.colorIndex ))

    } else {
        console.log('Remembering on Hires not yet implemented')
        //BitmapStore.setBackgroundColorHires(ScreenStore.getMemoryPosition(), cColorPaletteStore.getColorByIndex( colorsHolder.colorPicFBackround.value.colorIndex ))
        //BitmapStore.setForegroundColorHires(ScreenStore.getMemoryPosition(), colorsHolder.colorPicForeground.value.colorIndex)
    }
    ScreenStore.refreshChar()
    ScreenStore.doCharChange(ScreenStore.getMemoryPosition())

}

function rememberColors(colorsHolder) {

    // X (uppercase X) , remembers the colors of the active char

    if (BitmapStore.isFCM()) {
        return
    }
    colorsHolder.colorPicForeground.value = colorsHolder.colorForeground.value
    if (BitmapStore.isMCM()) {
        colorsHolder.colorPicForeground2.value = colorsHolder.colorForeground2.value
        colorsHolder.colorPicForeground3.value = colorsHolder.colorForeground3.value
    }
}


function deleteKeyPressed() {

    // Logic on delete key:
    // If there is a Marker for a potentially CopyContext  --> remove the marker
    // If there is no marker just remove the pixels in the current char
    // otherwise remove all pixels in the char

    if (ScreenStore.getCopyContext().hasMarker())  {
        unmarkArea()
        console.log('Delete key pressed ... unmarked existing copy context')
    } else  {

        BitmapStore.getBitmap()[ScreenStore.getMemoryPosition()] = 0
        BitmapStore.getBitmap()[ScreenStore.getMemoryPosition() + 1] = 0
        BitmapStore.getBitmap()[ScreenStore.getMemoryPosition() + 2] = 0
        BitmapStore.getBitmap()[ScreenStore.getMemoryPosition() + 3] = 0
        BitmapStore.getBitmap()[ScreenStore.getMemoryPosition() + 4] = 0
        BitmapStore.getBitmap()[ScreenStore.getMemoryPosition() + 5] = 0
        BitmapStore.getBitmap()[ScreenStore.getMemoryPosition() + 6] = 0
        BitmapStore.getBitmap()[ScreenStore.getMemoryPosition() + 7] = 0
        ScreenStore.refreshChar(ScreenStore.getMemoryPosition())
        console.log('Delete key pressed ... removed current char')

    }

}

function unmarkArea() {
    let cc = ScreenStore.getCopyContext()
    let a = cc.startMemPos
    let e = cc.endMemPos
    ScreenStore.setCopyContext(CopyContext())
    ScreenStore.refreshChar(a)
    ScreenStore.refreshChar(e)

    cc.startMemPos = -1

    cc.startCharX = -1
    cc.startCharY = -1
    cc.endMemPos = 999999
    cc.endCharX = -1
    cc.endCharY = -1
    ScreenStore.setCopyContext(cc)
    ScreenStore.refreshChar(cc.startMemPos)
    ScreenStore.refreshChar(cc.endMemPos)


}


function markArea() {

    let cc = ScreenStore.getCopyContext()

    if ( cc.endMemPos > -1) {

        let cc = ScreenStore.getCopyContext()
        let a = cc.startMemPos
        let e = cc.endMemPos
        ScreenStore.setCopyContext(CopyContext())
        ScreenStore.refreshChar(a)
        ScreenStore.refreshChar(e)

        cc.startMemPos = ScreenStore.getMemoryPosition()
        cc.startCharX = ScreenStore.getCharX()
        cc.startCharY = ScreenStore.getCharY()
        cc.endMemPos = -1
        cc.endCharX = -1
        cc.endCharY = -1
        ScreenStore.setCopyContext(cc)
        ScreenStore.refreshChar(cc.startMemPos)
        ScreenStore.refreshChar(cc.endMemPos)



    } else {
        cc.endMemPos = ScreenStore.getMemoryPosition()
        cc.endCharX = ScreenStore.getCharX()
        cc.endCharY = ScreenStore.getCharY()
        console.log('else .... ', cc)
        if (cc.endMemPos < cc.startMemPos ) {

            let sx = cc.startCharX
            let sy = cc.startCharY
            let smp = cc.startMemPos
            let ex = cc.endCharX
            let ey = cc.endCharY
            let emp = cc.endMemPos

            if (cc.endCharX < cc.startCharX) {
                cc.startCharX = ex
                cc.startCharY = ey
                cc.startMemPos = emp
                cc.endCharX = sx
                cc.endCharY = sy
                cc.endMemPos = smp
            } else {
                unmarkArea()
                cc.startCharX = sx
                cc.startCharY = ey
                cc.endCharX = ex
                cc.endCharY = sy
                cc.startMemPos = ScreenStore.calcMemoryPosition(cc.startCharX, cc.startCharY)
                cc.endMemPos = ScreenStore.calcMemoryPosition(cc.endCharX, cc.endCharY)
            }
        }

    }

    ScreenStore.setCopyContext(cc)
    ScreenStore.refreshChar(cc.startMemPos)
    ScreenStore.refreshChar(cc.endMemPos)

}

function doCopy() {
    ScreenStore.getCopyContext().doCopy('normal')
}

function dumpBytes() {

    if (BitmapStore.isMCM()) {
        console.log('------------------------------------')
        console.log('Byte Dumper               Mode: MCM')
        console.log('------------------------------------')
        console.log('MemoryPosition: ', ScreenStore.getMemoryPosition())
        console.log('Bitmap: ', BitmapStore.getBitmap().slice(ScreenStore.getMemoryPosition(),ScreenStore.getMemoryPosition()+8).join(','))
        console.log('Screen-RAM: ', BitmapStore.getScreenRam().slice(ScreenStore.getMemoryPosition()/8,(ScreenStore.getMemoryPosition()+8)/8).join(','))
        console.log('Color-RAM: ', BitmapStore.getColorRam().slice(ScreenStore.getMemoryPosition()/8,(ScreenStore.getMemoryPosition()+8)/8).join(','))

    }

}

function dump() {
    console.log(' ==== Individual dump as debugging help ====')
    console.log(BitmapStore.getScreenRam()[0])
}

function exportSprite() {
    // Just move the cursor to the starting point, the exporter will export one full MCM Sprite 12+21 pixels wide
    ByteDumperStore.intoSpriteDumperMode();
    ByteDumperStore.toggle()
}

function copyDialog() {
    // All the rest happens in PasteModal
    PasteStore.toggle()
}

function useTool(mode: ToolMode) {
    if (ToolContext.isActive() == false) {
        ToolContext.setMode(mode)
    } else {
        ToolContext.finish()
    }
}

function escapePressed() {
    console.log('Escape pressed')
    if (ToolContext.isActive()) {
        ToolContext.setMode(ToolMode.OFF)
        ToolContext.finish()
    }
}

function insertText() {
    console.log('Jetzt Text')
    TextStore.toggle()
}

function replaceColors() {
    if (ScreenStore.getCopyContext().isCopyable()) {
        ReplaceColorsModal.replaceColorStore.toggle()
    } else {
        notification.error({
            message: 'No Area marked',
            description:
                'In order to open the replace color dialog, please mark an area.',
            duration: 3,
        })

    }

}

function pixelMove(direction) {

    if (ScreenStore.getCopyContext().isCopyable()) {
        console.log('=================== pixel-move ======= START')
        console.log('direction.........', direction)

        let doRight = false
        if (direction == DIRECTION.RIGHT) {
            doRight = true
        }

        let cc = ScreenStore.getCopyContext()
        console.log('copy-context......', cc)

        let memPosCache = []
        // get mempos per axis to move
        for (let x = 1; x < cc.endCharX+1; x++) {
            memPosCache.push( calculateMempos(x, 1) )
        }

        // create a byte array for all pixels in this axis (line by line)
        let bits = []
        memPosCache.forEach( memPos => {
           bits = bits.concat( toBinary( BitmapStore.getBitmap()[memPos]).split("") )
        } )
        console.log(bits)
        // move the line 1 pixel
       arrayRotate( bits, 2, doRight )
        console.log(bits)
        // get the bytes out of the line and return them back into the bitmap
        memPosCache.forEach( memPos => {
            let calc = calculateXY(memPos)
            console.log(calc)
            for (let x = 0; x < 7; x++) {
                BitmapStore.getBitmap()[memPos] = bits[calc.z + x]
            }
            ScreenStore.setLastAction("uploaded")
            BitmapStore.callSubscribers()
            ScreenStore.refreshChar()
            ScreenStore.doCharChange(memPos)  // Memory Position 0
        })

        /*


            for (let i = 0; i < 8; i++) {
                let arr = toBinary( BitmapStore.getBitmap()[memPos+i]).split("")
                arrayRotate( arr, 2, doRight )
                let newValue = parseInt ( arr.join(""), 2)
                BitmapStore.getBitmap()[memPos+i] = newValue
            }

        let memPos = 0

        //ScreenStore.refreshAll()
        ScreenStore.setLastAction("uploaded")
        BitmapStore.callSubscribers()
        ScreenStore.refreshChar()
        ScreenStore.doCharChange(memPos)  // Memory Position 0

         */

        console.log('=================== pixel-move ======= END')


    }

}



export { defineCursorKeys, definePaintKeys, defineStatusbarKeys, defineColorPaletteKeys }