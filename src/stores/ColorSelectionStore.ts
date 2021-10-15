// @ts-nocheck
import ScreenStore from './ScreenStore'
import {rgbToHex} from "../utils";

const createColorSelectionStore = () => {
    let visible = false
    let subscribers = []
    let color = { color: 'white', colorIndex: 0, r: 0, g: 0, b: 0 }
    return {
        isVisible: () => visible,
        toggle: () => {
            visible = !visible
            ScreenStore.setDialogOpen(visible)
            subscribers.forEach( callFunction => callFunction())
        },
        subscribe: (f) => subscribers.push(f),
        color: () => color,
        colorHex: () => rgbToHex(color.r, color.g, color.b),
        setColor: (c) => color = c

    }
}

export default createColorSelectionStore()