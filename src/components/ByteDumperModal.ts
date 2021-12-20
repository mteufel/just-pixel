// @ts-nocheck
import {h, ref } from 'vue'
import {Textarea, Modal, RadioGroup, RadioButton, Space, message} from 'ant-design-vue'
import ScreenStore from "../stores/ScreenStore";
import {KeyDownBuilder} from "../builders/KeyDownBuilder";


const createByteDumperStore = () => {
    let visible = ref(false)
    let codeStyle = ref('acme-hex')
    let code = ref('')
    let codeStyles = [ { value: 'acme-dez', label: 'Assembler (ACME in dez)', disabled: false },
                       { value: 'acme-hex', label: 'Assembler (ACME  in hex)' },
                       { value: 'basic', label: 'BASIC', disabled: false }]
    let subscribers = []

    let changeCodeStyle = (style) => {
        codeStyle.value = style
        console.log('new style: ', codeStyle.value)

        let cc = ScreenStore.getCopyContext()
        if ( cc.endMemPos == -1 || (cc.startMemPos == -1 && cc.endMemPos == 99999999) ) {
            code.value = '\nThere are no pixels marked!\nThats why Byte Dumper cannot dump out code of the bytes!\n\nPlease set some pixels and mark an area, then Byte Dumper will make you happy!'
        } else {
            if (codeStyle.value === 'acme-dez') {
                code.value = '.by 255,255,3,2\n ok ok ok'
            }

            if (codeStyle.value === 'acme-hex') {
                code.value = 'todo'
                console.log('acme-hex dump ', cc)
                console.log('acme-hex dump 2 ', cc.getSourceIndexList())
            }

            if (codeStyle.value === 'basic') {
                code.value = '10 DATA 255,255,3,2\nMarc Teufel'
            }
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
                changeCodeStyle('acme-hex')
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