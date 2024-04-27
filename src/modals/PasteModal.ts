// @ts-nocheck
import {createBasicDialogStore} from "../stores/BasicDialogStore";
import {h, ref} from "vue";
import {Modal, Radio} from "ant-design-vue";
import ScreenStore from "../stores/ScreenStore";

const PasteStore = createBasicDialogStore()

PasteStore.beforeDialogClose = (fn) => {
    PasteStore.beforeDialogCloseFunction = fn
}


const PasteModal = {

    setup() {
        console.log('setup paste modal')
        const newVisible = ref(PasteStore.isVisible())
        const selectedValue = ref ('normal')
        PasteStore.subscribe( () => newVisible.value = PasteStore.isVisible())

        const okPressed = () => {
            console.log('you selected' , selectedValue.value)
            ScreenStore.getCopyContext().doCopy(selectedValue.value)
            selectedValue.value = 'normal'

            PasteStore.toggle()
        }

        const onChange = (event) => {
            selectedValue.value = event.target.value
        }
        
        return { newVisible, selectedValue, okPressed, onChange }
    },
    render() {
        return h(Modal, { onCancel: () => PasteStore.toggle(),
            visible: this.newVisible,
            closable: true,
            destroyOnClose: true,
            onOk: this.okPressed,
            title: 'Please select paste mode...' } , h( Radio.Group, { defaultValue: this.selectedValue, value: this.selectedValue,
                onChange: this.onChange
                },
            [ h(Radio, { value: 'normal' }, 'normal'),
                h("br"),
                h(Radio, { value: 'horizontally' }, 'horizontally'),
                h("br"),
                h(Radio, { value: 'vertically' }, 'vertically') ] )
        )
    }
}




export { PasteModal, PasteStore }