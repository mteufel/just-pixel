// @ts-nocheck
import {KeyDownBuilder} from "../builders/KeyDownBuilder"
import ScreenStore from "../stores/ScreenStore"
import BitmapStore from "../stores/BitmapStore";

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

}

export { defineCursorKeys, definePaintKeys }