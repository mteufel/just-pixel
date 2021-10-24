// @ts-nocheck
import {onBeforeUnmount} from "vue";

let useKeyDown = (keyCombo) => {
    let onKeyDown = (event) => {
        let key = keyCombo.find(kc => (kc.key == event.key && kc.altKey==event.altKey && kc.shiftKey==event.shiftKey && kc.ctrlKey==event.ctrlKey) )
        if (key) {
            key.fn()
        }
    }
    window.addEventListener('keydown', onKeyDown)
    onBeforeUnmount( () => window.removeEventListener('keydown', onKeyDown))
}


let keyDownBuilder = () => {
    let keys = []
    let addKey = (key, altKey, shiftKey, ctrlKey, fn) => keys.push( { key: key, altKey: altKey, shiftKey: shiftKey, ctrlKey: ctrlKey, fn: fn  } )
    return {
        clearKeys: () => keys = [],
        key: (key, fn) => addKey(key, false, false ,false, fn),
        alt: (key, fn) => addKey(key, true, false ,false, fn),
        shift: (key, fn) => addKey(key.toUpperCase(), false, true ,false, fn),
        ctrl: (key, fn) => addKey(key, false, false ,true, fn),
        useKeys: () => useKeyDown(keys)
    }
}

const KeyDownBuilder = keyDownBuilder()

export { KeyDownBuilder }

