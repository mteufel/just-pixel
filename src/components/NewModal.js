import {h, ref } from "vue"
import {Radio, Modal, message} from "ant-design-vue"
import {createBasicDialogStore} from "../stores/BasicDialogStore"
import ScreenStore from "../stores/ScreenStore"



const NewStore = createBasicDialogStore()

const NewModal = {
    emits: ['update:modelValue'],
    setup() {
        console.log('te')
        const newVisible = ref(NewStore.isVisible())
        const selectedValue = ref (1)
        NewStore.subscribe( () => newVisible.value = NewStore.isVisible())

        const okPressed = () => {
            if (selectedValue.value === 1) {
               ScreenStore.actionNew()
            } else {
               message.error('This option is not yet implemented')
            }
            NewStore.toggle()
        }


        return { newVisible, selectedValue, okPressed }
    },
    render() {
        return h(Modal, { onCancel: () => NewStore.toggle(),
            visible: this.newVisible,
            closable: true,
            destroyOnClose: true,
            onOk: this.okPressed,
            title: 'New' } , h( Radio.Group, { defaultValue: this.selectedValue,
                                               onChange: (event) => this.selectedValue = event.target.value },
                                                [ h(Radio, { value: 1 }, 'Classic C64 Hires Bitmap'),
                                                  h("br"),
                                                  h(Radio, { value: 2 }, 'Classic C64 Multicolor Bitmap') ] )
        )
    }
}




export { NewModal, NewStore }