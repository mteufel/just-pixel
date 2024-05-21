// @ts-nocheck
import {h, ref } from 'vue'
import {Textarea, Modal, RadioGroup, RadioButton, Space, message} from 'ant-design-vue'
import ScreenStore from "../stores/ScreenStore";
import BitmapStore from "../stores/BitmapStore";
import {KeyDownBuilder} from "../builders/KeyDownBuilder";
import { pad } from "../util/utils.ts";


const createByteDumperStore = () => {
    let visible = ref(false)
    let codeStyle = ref('')
    let code = ref('')
    let title = "Byte Dumper"
    let codeStyles = [ { value: 'acme', label: 'ACME', disabled: false },
                       { value: 'kick-ass', label: 'KickAss', disabled: false },
                       { value: 'basic', label: 'BASIC', disabled: false },
                        { value: 'json', label: 'JSON', disabled: false } ]
    let subscribers = []

    let changeCodeStyle = (style) => {
        codeStyle.value = style
        console.trace()
        console.log('new style: ', codeStyle.value)

        let cc = ScreenStore.getCopyContext()


        if ( codeStyle.value != 'sprite-kick-ass' && ( cc.endMemPos == -1 || (cc.startMemPos == -1 && cc.endMemPos == 99999999) ) ) {
            code.value = '\nThere are no pixels marked!\nThats why Byte Dumper cannot dump out code of the bytes!\n\nPlease set some pixels and mark an area, then Byte Dumper will make you happy!'
        } else {
            let result = {}
            if (codeStyle.value === 'acme') {
                result = ScreenStore.getCopyContext().dump(".by")
            }

            if (codeStyle.value === 'kick-ass') {
                result = ScreenStore.getCopyContext().dump(".byte")

            }

            if (codeStyle.value === 'sprite-kick-ass') {
                let startingPosition = ScreenStore.getMemoryPosition()
                let value1, value2, value3
                let r = []

                // Row 1
                for (let i = 0; i < 8 ; i++) {
                    value1 = BitmapStore.getBitmap()[startingPosition+ i].toString(2)
                    value2 = BitmapStore.getBitmap()[startingPosition+ 8 + i].toString(2)
                    value3 = BitmapStore.getBitmap()[startingPosition+ 16 + i].toString(2)
                    r.push(".byte %" + pad(value1,  8, "0") + ",%" + pad(value2,  8, "0")  + ",%" + pad(value3,  8, "0")  )
                }
                r.push(" ")

                // Row 2
                startingPosition = startingPosition + 320
                for (let i = 0; i < 8 ; i++) {
                    value1 = BitmapStore.getBitmap()[startingPosition+ i].toString(2)
                    value2 = BitmapStore.getBitmap()[startingPosition+ 8 + i].toString(2)
                    value3 = BitmapStore.getBitmap()[startingPosition+ 16 + i].toString(2)
                    r.push(".byte %" + pad(value1,  8, "0") + ",%" + pad(value2,  8, "0")  + ",%" + pad(value3,  8, "0")  )
                }
                r.push(" ")

                // Row 3
                startingPosition = startingPosition + 320
                for (let i = 0; i < 5 ; i++) {
                    value1 = BitmapStore.getBitmap()[startingPosition+ i].toString(2)
                    value2 = BitmapStore.getBitmap()[startingPosition+ 8 + i].toString(2)
                    value3 = BitmapStore.getBitmap()[startingPosition+ 16 + i].toString(2)
                    r.push(".byte %" + pad(value1,  8, "0") + ",%" + pad(value2,  8, "0")  + ",%" + pad(value3,  8, "0")  )
                }

                result = r

            }

            if (codeStyle.value === 'basic') {
                result = ScreenStore.getCopyContext().dump("DATA", 0, 10)
            }


            if (codeStyle.value === 'json') {
                result = ScreenStore.getCopyContext().toJSON()
            }


            let codeText = ''
            result.forEach( c => codeText = codeText + c + '\n' )
            code.value = codeText
        }







    }

    return {
        intoSpriteDumperMode: () => {
            title = "Sprite Dumper"
            codeStyles = [  { value: 'sprite-kick-ass', label: 'Sprite in KickAss-Format', disabled: false } ]
            changeCodeStyle('sprite-kick-ass')
        },
        intoByteDumperMode: () => {
            title = "Byte Dumper"
            codeStyles = [ { value: 'acme', label: 'ACME', disabled: false },
                { value: 'kick-ass', label: 'KickAss', disabled: false },
                { value: 'json', label: 'JSON', disabled: false }
            ]
            changeCodeStyle('kick-ass')
        },
        getTitle: () => title,
        isVisible: () => visible.value,
        toggle: () => {
            visible.value = !visible.value
            if (!visible.value) {
                // Modal wird unsichtbar, also Keybelegung fuer den Editor anschalten
                KeyDownBuilder.useKeys()
            } else {
                // Modal wird sichtbar, also Keybelegung fuer den Editor ausschalten
                KeyDownBuilder.deactivateKeys()
            }
            ScreenStore.setDialogOpen(visible)
            subscribers.forEach( callFunction => callFunction())
        },
        codeStyle: () => codeStyle,
        codeStyles: () => codeStyles,
        setCodeStyle: (style) => changeCodeStyle(style),
        code: () =>  code
    }
}

const ByteDumperStore = createByteDumperStore()


const ByteDumperModal = {

    setup( context, { emit }) {
        const okPressed = () => {
            console.log('okPressed ')
         //   emit('ColorSelectionModal', colorSelection.value)
            ByteDumperStore.toggle()
        }
        return { okPressed }
    },
    data() {
        return {
            selectedColor: null
        }
    },
    render() {
        return h(Modal, {  bodyStyle: 'height: 425px;', width:'1200px', onCancel: () => ByteDumperStore.toggle(),
            visible: ByteDumperStore.isVisible(),
            closable: true,
            destroyOnClose: true,
            onOk: this.okPressed,
            title: ByteDumperStore.getTitle() } , h ( Space, { class: 'width100', direction: 'vertical' },
                                        h(RadioGroup, { value: ByteDumperStore.codeStyle(),
                                                        options: ByteDumperStore.codeStyles(),
                                                        onChange: (e) => ByteDumperStore.setCodeStyle(e.target.value),
                                                        buttonStyle: 'solid', optionType: 'button' } ),
                                        h( Textarea, {  class: 'byteDumperCodeStyle',
                                                        autoSize: { minRows: 15, maxRows: 15}, value: ByteDumperStore.code() } )
            )
        )
    }
}


export { ByteDumperModal, ByteDumperStore }