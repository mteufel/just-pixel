// @ts-nocheck
import ScreenStore from './ScreenStore'
import {KeyDownBuilder} from "../builders/KeyDownBuilder";

const createBasicDialogStore = () => {
    let visible = false
    let subscribers = []
    return {
        isVisible: () => visible,
        toggle: () => {
            console.log('toggle called ', visible)
            visible = !visible
            if (!visible) {
                // Modal wird unsichtbar, also Keybelegung fuer den Editor anschalten
                KeyDownBuilder.useKeys()
            } else {
                // Modal wird sichtbar, also Keybelegung fuer den Editor ausschalten
                KeyDownBuilder.deactivateKeys()
            }

            ScreenStore.setDialogOpen(visible)
            subscribers.forEach( callFunction => callFunction())
        },
        subscribe: (f) => subscribers.push(f)
    }
}

export { createBasicDialogStore }