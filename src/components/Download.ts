// @ts-nocheck
import {h, onMounted, watch, ref } from 'vue'
import {Modal, Input} from 'ant-design-vue'
import {createBasicDialogStore} from '../stores/BasicDialogStore'
import BitmapStore from '../stores/BitmapStore'
import {KeyDownBuilder} from "../builders/KeyDownBuilder";

const DownloadStore = createBasicDialogStore()
DownloadStore.downloadFileName = null


const DownloadFileNameInput = {
    setup(props, context) {
        const inputRef = ref(null)
        const downloadFileName = ref ("")

        onMounted( ()=> {
            inputRef.value.focus()
        } )

        watch( downloadFileName, ( downloadFileName, previousDownloadFileName) => {
            console.log('downloadFileName ', downloadFileName)
            DownloadStore.downloadFileName = downloadFileName
        })

        return { inputRef, downloadFileName }
    },
    render() {
        return h(Input, { onChange: (event) => this.downloadFileName = event.target.value,
                          ref: "inputRef",
                          placeholder: 'Enter download filename',
                          modelValue: this.downloadFileName } )
    }
}

const Download = {
    setup() {
        const dialogVisible = ref(DownloadStore.isVisible())
        DownloadStore.subscribe( () => {
            dialogVisible.value = DownloadStore.isVisible()
        })

        const okPressed = () => {
            BitmapStore.download(DownloadStore.downloadFileName)
            DownloadStore.toggle()
        }



        return { dialogVisible, okPressed }

    },
    render() {
        return h(Modal, { onCancel: () => DownloadStore.toggle(),
            visible: this.dialogVisible,
            closable: true,
            autoFocus: false,
            autoFocusButton: null,
            destroyOnClose: true,
            onOk: this.okPressed,
            title: 'Download Bitmap' } , h(DownloadFileNameInput))
    }
}

export { Download, DownloadStore }