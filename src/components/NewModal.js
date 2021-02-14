import {h, ref } from 'vue'
import {Radio, Modal, message} from 'ant-design-vue'
import {createBasicDialogStore} from '../stores/BasicDialogStore'
import ScreenStore from '../stores/ScreenStore'
import BitmapStore from '../stores/BitmapStore'

const NewStore = createBasicDialogStore()

NewStore.beforeDialogClose = (fn) => {
    NewStore.beforeDialogCloseFunction = fn
}

const NewModal = {
    setup() {
        const newVisible = ref(NewStore.isVisible())
        const selectedValue = ref (0)
        NewStore.subscribe( () => newVisible.value = NewStore.isVisible())

        const okPressed = () => {

            if (selectedValue.value === 0) {

                NewStore.beforeDialogCloseFunction()
                BitmapStore.activateHiresBitmaps()
                ScreenStore.actionNew()

            } else if (selectedValue.value === 1) {

                NewStore.beforeDialogCloseFunction()
                BitmapStore.activateMulticolorBitmaps()
                ScreenStore.actionNew()



            } else if (selectedValue.value === 2) {

                NewStore.beforeDialogCloseFunction()
                BitmapStore.activateFullColorMode()
                ScreenStore.actionNew()

            } else {
                message.info("This feature is in work, stay tuned!")
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
                                                [ h(Radio, { value: 0 }, 'Classic C64 Hires Bitmap'),
                                                  h("br"),
                                                  h(Radio, { value: 1 }, 'Classic C64 Multicolor Bitmap'),
                                                  h("br"),
                                                  h(Radio, { value: 2 }, 'Full Color Mode H320 (320x200, MEGA65)') ] )
        )
    }
}




export { NewModal, NewStore }