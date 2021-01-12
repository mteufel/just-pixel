import {h, ref } from 'vue'
import {Modal } from 'ant-design-vue'
import { UploadStore } from './UploadStore'
import { UploadButton } from './UploadButton'
import BitmapStore from '../../stores/BitmapStore'
import ScreenStore from '../../stores/ScreenStore'

const FilesUploadModal = {
    setup() {
        const dialogVisible = ref(UploadStore.isVisible())
        UploadStore.subscribe( () => {
            dialogVisible.value = UploadStore.isVisible()
        })

        const okPressed = () => {
            console.log('Loaded ',  UploadStore.bitmap )
            if (UploadStore.bitmap[10001]==1) {
                BitmapStore.activateMulticolorBitmaps()
            }
            BitmapStore.setBitmap(UploadStore.bitmap.slice(0,8000))
            BitmapStore.setScreenRam(UploadStore.bitmap.slice(8000,9000))
            BitmapStore.setColorRam(UploadStore.bitmap.slice(9000,10000))
            BitmapStore.setBackgroundColorMCM(UploadStore.bitmap[10000])
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