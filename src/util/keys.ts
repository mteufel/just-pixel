// @ts-nocheck
import {KeyDownBuilder} from "../builders/KeyDownBuilder"
import ScreenStore from "../stores/ScreenStore"
import BitmapStore from "../stores/BitmapStore";
import {CopyContext} from "../stores/CopyContext";

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
    KeyDownBuilder.key('c', () => doCopy())
    KeyDownBuilder.ctrl('v', () => doPaste())


}


function doCopy() {

    let cc = ScreenStore.getCopyContext()
    console.log('c .. ', cc)
    if ( cc.endMemPos > -1) {

        // evt alte visuelle Markierung entfernen
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
    ScreenStore.setCopyContext(cc)
    ScreenStore.refreshChar(cc.startMemPos)
    ScreenStore.refreshChar(cc.endMemPos)

}

function doPaste() {

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

export { defineCursorKeys, definePaintKeys }