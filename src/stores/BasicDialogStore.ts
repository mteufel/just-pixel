// @ts-nocheck
import ScreenStore from './ScreenStore'

const createBasicDialogStore = () => {
    let visible = false
    let subscribers = []
    return {
        isVisible: () => visible,
        toggle: () => {
            visible = !visible
            ScreenStore.setDialogOpen(visible)
            subscribers.forEach( callFunction => callFunction())
        },
        subscribe: (f) => subscribers.push(f)
    }
}

export { createBasicDialogStore }