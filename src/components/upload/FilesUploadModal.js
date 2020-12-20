import {h, ref } from "vue"
import {Modal } from "ant-design-vue"
import { UploadStore } from "./UploadStore"
import { UploadButton } from "./UploadButton"
import BitmapStore from "../../stores/BitmapStore"
import ScreenStore from "../../stores/ScreenStore"

const FilesUploadModal = {
    setup() {
        const dialogVisible = ref(UploadStore.isVisible())
        UploadStore.subscribe( () => {
            dialogVisible.value = UploadStore.isVisible()
        })

        const okPressed = () => {
            BitmapStore.setBitmap(UploadStore.bitmap)
            BitmapStore.setColorRam(UploadStore.colorRam)
            ScreenStore.refreshAll()
            ScreenStore.setLastAction("uploaded")
            BitmapStore.callSubscribers()
            UploadStore.toggle()
        }


        return { dialogVisible, okPressed }

    },
    render() {
        return h(Modal, { onCancel: () => UploadStore.toggle(),
            visible: this.dialogVisible,
            closable: true,
            destroyOnClose: true,
            onOk: this.okPressed,
            title: 'Upload Bitmap' } , [ h(UploadButton, {  placeholder: 'Select Bitmap file', type: 'bitmap' }),
                                         h("p"),
                                         h(UploadButton, {  placeholder: 'Select Color file', type: 'color-ram' })])
    }
}

export { FilesUploadModal }