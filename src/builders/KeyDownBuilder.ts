// @ts-nocheck
import {onBeforeUnmount} from "vue";

let keyDownBuilder = () => {
    let keys = []
    let addKey = (key, altKey, shiftKey, ctrlKey, fn) => keys.push( { key: key, altKey: altKey, shiftKey: shiftKey, ctrlKey: ctrlKey, fn: fn  } )


    let onKeyDown = (event) => {
        let key = keys.find(kc => (kc.key == event.key && kc.altKey==event.altKey && kc.shiftKey==event.shiftKey && kc.ctrlKey==event.ctrlKey) )
        if (key) {
            event.preventDefault()
            key.fn()
        }
    }

    let activate = () => {
        window.addEventListener('keydown', onKeyDown)
        onBeforeUnmount( () => window.removeEventListener('keydown', onKeyDown))
    }

    let deactivate = () => {
        window.removeEventListener('keydown', onKeyDown)
        onBeforeUnmount( null )
    }

    return {
        clearKeys: () => keys = [],
        key: (key, fn) => addKey(key, false, false ,false, fn),
        alt: (key, fn) => addKey(key, true, false ,false, fn),
        shift: (key, fn) => addKey(key.toUpperCase(), false, true ,false, fn),
        ctrl: (key, fn) => addKey(key, false, false ,true, fn),
        useKeys: () => activate(),
        deactivateKeys: () => deactivate()
    }
}

const KeyDownBuilder = keyDownBuilder()

export { KeyDownBuilder }

