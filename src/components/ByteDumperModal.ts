// @ts-nocheck
import {h, ref } from 'vue'
import {Textarea, Modal, RadioGroup, RadioButton, Space, message} from 'ant-design-vue'
import ScreenStore from "../stores/ScreenStore";
import {KeyDownBuilder} from "../builders/KeyDownBuilder";


const createByteDumperStore = () => {
    let visible = ref(false)
    let codeStyle = ref('kick-ass')
    let code = ref('')
    let codeStyles = [ { value: 'acme', label: 'ACME', disabled: false },
                       { value: 'kick-ass', label: 'KickAss', disabled: false },
                       { value: 'basic', label: 'BASIC', disabled: false }]
    let subscribers = []

    let changeCodeStyle = (style) => {
        codeStyle.value = style
        console.log('new style: ', codeStyle.value)

        let cc = ScreenStore.getCopyContext()
        if ( cc.endMemPos == -1 || (cc.startMemPos == -1 && cc.endMemPos == 99999999) ) {
            code.value = '\nThere are no pixels marked!\nThats why Byte Dumper cannot dump out code of the bytes!\n\nPlease set some pixels and mark an area, then Byte Dumper will make you happy!'
        } else {
            let result = {}
            if (codeStyle.value === 'acme') {
                result = ScreenStore.getCopyContext().dump(".by")
            }

            if (codeStyle.value === 'kick-ass') {
                result = ScreenStore.getCopyContext().dump(".byte")

            }

            if (codeStyle.value === 'basic') {
                result = ScreenStore.getCopyContext().dump("DATA", 0, 10)
            }
            let codeText = ''
            result.forEach( c => codeText = codeText + c + '\n' )
            code.value = codeText
        }







    }

    return {
        isVisible: () => visible.value,
        toggle: () => {
            visible.value = !visible.value
            if (!visible.value) {
                // Modal wird unsichtbar, also Keybelegung fuer den Editor anschalten
                KeyDownBuilder.useKeys()
            } else {
                // Modal wird sichtbar, also Keybelegung fuer den Editor ausschalten
                KeyDownBuilder.deactivateKeys()
                changeCodeStyle('kick-ass')
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
        return h(Modal, {  bodyStyle: 'height: 425px;', width:'1000px', onCancel: () => ByteDumperStore.toggle(),
            visible: ByteDumperStore.isVisible(),
            closable: true,
            destroyOnClose: true,
            onOk: this.okPressed,
            title: 'Byte Dumper' } , h ( Space, { class: 'width100', direction: 'vertical' },
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