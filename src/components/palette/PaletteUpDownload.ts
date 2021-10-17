// @ts-nocheck
import {h, onMounted, watch, ref, toRefs} from 'vue'
import {Modal, Input, TabPane, Tabs, Upload, Button, InputNumber} from 'ant-design-vue'
import {createBasicDialogStore} from '../../stores/BasicDialogStore'
import {QuestionOutlined, UploadOutlined} from "@ant-design/icons-vue";
import ColorSelectionStore from "../../stores/ColorSelectionStore";
import {uploadData, uploadDataLineByLine} from "../../utils";
import {UploadStore} from "../upload/UploadStore";
import ColorPaletteStore from "../../stores/ColorPaletteStore";

const PaletteUpDownloadStore = createBasicDialogStore()

const DownloadFileNameInput = {
    setup(props, context) {
        const inputRef = ref(null)
        const downloadFileName = ref ("")

        onMounted( ()=> {
            inputRef.value.focus()
        } )

        watch( downloadFileName, ( downloadFileName, previousDownloadFileName) => {
            PaletteUpDownloadStore.downloadFileName = downloadFileName
        })

        return { inputRef, downloadFileName }
    },
    render() {
        return h(Input, { ref: "inputRef",
            placeholder: 'Enter download filename',
            modelValue: this.downloadFileName,
            onKeyUp: event => this.downloadFileName = event.target.value } )
    }
}

const UploadButton = {
    props: {
        type: String,
        placeholder: String,
    },
    setup(props) {
        const {placeholder} = toRefs(props)
        const fileList = ref(null)

        const transformFile = (file) => {
            console.log('transforming file ', file)
            uploadDataLineByLine(file, (result =>{
                let final = []

                result.forEach( line => {
                    // first replace all multiple space with only one space
                    line = line.replace(/\s+/g, " ")
                    // split by space or tab
                    let tabs = line.trim().split(/\s{1,}|\t/)
                    if (tabs.length >= 3)
                        final.push(tabs)
                })
                console.log(final)

                final.forEach( (col, index) => {
                    if (ColorSelectionStore.color().colorIndex + index <= 254) {
                        ColorPaletteStore.setColor( ColorSelectionStore.color().colorIndex + index, col[0],col[1], col[2] )
                    }
                })

            }))
        }

        return {placeholder, fileList, transformFile}
    },
    render() {
        return h(Upload, { fileList: this.fileList,
            multiple: false,
            accept: '.gpl',
            showUploadList: true,
            listType: 'text',
            onChange: (event) => {

                console.log('event ', event)


                if (event.file.status === "removed") {
                    this.fileList = []
                } else {
                    console.log('else .... ')
                    this.fileList = [ event.file ]
                }


            },
            transformFile: (file) => this.transformFile(file)

        }, h(Button, null, [h(UploadOutlined), this.placeholder] ) )
    }

}

const UploadPalette = {
    setup() {
        const index = ref(ColorSelectionStore.color().colorIndex)
        return { index }
    },
    render() {
        return [h('div', ['Start at index: ', h(InputNumber, { id: 'startAt', value: this.index, min: 0, max:254, onChange: newValue => this.index = newValue })]),
                h('br'),
                h(UploadButton, { placeholder: 'Select Gimp palette (.gpl) file', type: 'gpl' })]
    }
}

const DownloadPalette = {
    setup() {

    },
    render() {
        return [h(DownloadFileNameInput),
            h(DownloadFileNameInput),
            h(DownloadFileNameInput)]
    }
}

PaletteUpDownloadStore.activeKey

const Tabby = {
    setup() {
      const activeKey = ref('1')
      return { activeKey }
    },
    render() {
        return h(Tabs, { tabPosition: 'left', activeKey: this.activeKey, onChange: newActiveKey => this.activeKey = newActiveKey },
            [ h(TabPane, { key:'1', tab: 'Import'  }, h(UploadPalette)),
              h(TabPane, { key:'2', tab: 'Export'  }, h(DownloadPalette))])
    }
}


const PaletteUpDownload = {
    setup(context, { emit }) {
        const dialogVisible = ref(PaletteUpDownloadStore.isVisible())
        PaletteUpDownloadStore.subscribe( () => {
            dialogVisible.value = PaletteUpDownloadStore.isVisible()
        })

        const okPressed = () => {
            emit('ReRender')
            console.log('ok has been pressed')
            PaletteUpDownloadStore.toggle()
        }


        return { dialogVisible, okPressed }

    },
    render() {
        return h(Modal, {  bodyStyle: 'height: 200px', onCancel: () => PaletteUpDownloadStore.toggle(),
            visible: this.dialogVisible,
            closable: true,
            autoFocus: false,
            autoFocusButton: null,
            destroyOnClose: true,
            onOk: this.okPressed,
            title: 'Palette' } , h(Tabby))
    }
}

export { PaletteUpDownload, PaletteUpDownloadStore }