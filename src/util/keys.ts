// @ts-nocheck
import {KeyDownBuilder} from "../builders/KeyDownBuilder"
import ScreenStore from "../stores/ScreenStore"
import BitmapStore from "../stores/BitmapStore";
import {CopyContext} from "../stores/CopyContext";
import ColorPaletteStore from "../stores/ColorPaletteStore";
import {ByteDumperStore} from "../components/ByteDumperModal";
import { pad } from "../util/utils"

const defineCursorKeys = () => {
    KeyDownBuilder.key('ArrowDown', () => ScreenStore.cursorDown())
    KeyDownBuilder.key('ArrowUp', () => ScreenStore.cursorUp())
    KeyDownBuilder.key('ArrowLeft', () => ScreenStore.cursorLeft())
    KeyDownBuilder.key('ArrowRight', () => ScreenStore.cursorRight())
    KeyDownBuilder.key('g', () => ScreenStore.actionGrid())
}

const definePaintKeys = () => {
    KeyDownBuilder.key('1', () => BitmapStore.isFCM() ?  ScreenStore.paint('f') : ScreenStore.paint('b'))
    KeyDownBuilder.key('2', () => BitmapStore.isFCM() ?  ScreenStore.paint('f2') : ScreenStore.paint('f'))
    KeyDownBuilder.key('3', () => BitmapStore.isFCM() ?  ScreenStore.paint('f3') : ScreenStore.paint('f2'))
    KeyDownBuilder.key('4', () => BitmapStore.isFCM() ?  ScreenStore.paint('f4') : ScreenStore.paint('f3'))
    KeyDownBuilder.key('d', () => ScreenStore.dumpBlinkingCursor())
    KeyDownBuilder.key('m', () => markArea())
    KeyDownBuilder.key('#', () => dumpBytes())
    KeyDownBuilder.key('s', () => exportSprite())
    KeyDownBuilder.key('e', () => exportArea())
    KeyDownBuilder.ctrl('v', () => doCopy())
    KeyDownBuilder.key('Delete', () => deleteCurrentChar())
}

const defineStatusbarKeys = (onColorFn, colorsHolder) => {
    KeyDownBuilder.alt('ArrowRight', () => moveColorSelectorInStatusbar('ArrowRight', onColorFn))
    KeyDownBuilder.alt('ArrowLeft', () => moveColorSelectorInStatusbar('ArrowLeft', onColorFn))
    KeyDownBuilder.shift('x', () => rememberColors(colorsHolder))
    KeyDownBuilder.key('x', () => acceptRememberedColors(colorsHolder))
}

const defineColorPaletteKeys = (context) => {
    KeyDownBuilder.ctrl('ArrowRight', () => selectColorOnCursorKey('ArrowRight', context))
    KeyDownBuilder.ctrl('ArrowLeft', () => selectColorOnCursorKey('ArrowLeft', context))
    KeyDownBuilder.ctrl('ArrowDown', () => selectColorOnCursorKey('ArrowDown', context))
    KeyDownBuilder.ctrl('ArrowUp', () => selectColorOnCursorKey('ArrowUp', context))
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


function deleteCurrentChar() {
    console.log('Delete')

}

function markArea() {

    let cc = ScreenStore.getCopyContext()
    if ( cc.endMemPos > -1) {
    // evt alte visuelle Markierung entfernen
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
        if (cc.endMemPos < cc.startMemPos || cc.endCharX < cc.startCharX) {

            let cc = ScreenStore.getCopyContext()
            cc.startMemPos = 999999
            ScreenStore.setCopyContext(cc)


            let x = cc
            x.startMemPos = cc.endMemPos
            x.startCharX = cc.endCharX
            x.startCharY = cc.endCharY
            x.endMemPos = cc.startMemPos
            x.endCharX = cc.startCharX
            x.endCharY = cc.startCharY
            cc = x
            ScreenStore.refreshAll()
        }




    }
    console.log('setCopyContext ', cc)
    ScreenStore.setCopyContext(cc)
    ScreenStore.refreshChar(cc.startMemPos)
    ScreenStore.refreshChar(cc.endMemPos)

}

function doCopy() {

    console.log('jetzt wird eingefügt - copyable = ' , ScreenStore.getCopyContext().isCopyable())

    let sourceIndex = ScreenStore.getCopyContext().getSourceIndexList()
    let destIndex = ScreenStore.getCopyContext().getDestinationIndexList(ScreenStore.getMemoryPosition())
    console.log('--> src ', sourceIndex )
    console.log('--> dest ', destIndex )


    BitmapStore.setBitmap ( ScreenStore.getCopyContext().copyBitmap(BitmapStore.getBitmap(), ScreenStore.getMemoryPosition()) )
    BitmapStore.setScreenRam( ScreenStore.getCopyContext().copyScreenRam(BitmapStore.getScreenRam(), ScreenStore.getMemoryPosition()) )
    if (BitmapStore.isMCM()) {
        BitmapStore.setColorRam( ScreenStore.getCopyContext().copyColorRam(BitmapStore.getColorRam(), ScreenStore.getMemoryPosition()) )
    }
    ScreenStore.refreshAll()
    BitmapStore.callSubscribers()


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

function exportSprite() {
    // Just move the cursor to the starting point, the exporter will export one full MCM Sprite 12+21 pixels wide
    ByteDumperStore.intoSpriteDumperMode();
    ByteDumperStore.toggle()
}



export { defineCursorKeys, definePaintKeys, defineStatusbarKeys, defineColorPaletteKeys }