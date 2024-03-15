// @ts-nocheck
import {onBeforeUnmount} from "vue";

let keyDownBuilder = () => {
    let keys = []
    let addKey = (key, altKey, shiftKey, ctrlKey, fn, help) => keys.push( { key: key, altKey: altKey, shiftKey: shiftKey, ctrlKey: ctrlKey, fn: fn, help: help  } )

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

    let getHelp = () => {
        let help = []
        keys.forEach( key => {
            if (key.help !== undefined) {
                help.push(key.help)
            }
        })
        return help
    }

    return {
        clearKeys: () => keys = [],
        key: (key, fn, help) => addKey(key, false, false ,false, fn, help),
        alt: (key, fn, help) => addKey(key, true, false ,false, fn, help),
        shift: (key, fn, help) => {
            if (key === "ArrowUp") {
                addKey(key, false, true ,false, fn, help)
            } else {
                addKey(key.toUpperCase(), false, true ,false, fn, help)
            }

        },

        ctrl: (key, fn, help) => addKey(key, false, false ,true, fn, help),
        useKeys: () => activate(),
        deactivateKeys: () => deactivate(),
        help: (group, pos, keys, action) => ( { group: group, pos: pos, keys: keys, action: action } ),
        getHelp: () => getHelp(),
        keys: () => keys
    }
}

const KeyDownBuilder = keyDownBuilder()

export { KeyDownBuilder }

