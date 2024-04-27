// @ts-nocheck
import {h, ref } from 'vue'
import {Radio, Modal, message} from 'ant-design-vue'
import { ColorPicker } from 'vue-color-kit'
import ColorSelectionStore  from "../../stores/ColorSelectionStore.ts"


const ColorSelectionModal = {

    setup( context, { emit }) {
        const newVisible = ref(ColorSelectionStore.isVisible())
        const colorSelection = ref(0)
        ColorSelectionStore.subscribe( () => newVisible.value = ColorSelectionStore.isVisible())

        const okPressed = () => {
            console.log('okPressed ')
            emit('ColorSelectionModal', colorSelection.value)
            ColorSelectionStore.toggle()
        }
        return { newVisible, okPressed, colorSelection  }
    },
    data() {
        return {
            selectedColor: null
        }
    },
    render() {
        return h(Modal, { onCancel: () => ColorSelectionStore.toggle(),
            visible: this.newVisible,
            closable: true,
            destroyOnClose: true,
            onOk: this.okPressed,
            title: 'Select Color' } , h( ColorPicker, { onChangeColor: (color) =>  this.colorSelection = color,
                                                        colorsDefault: [],
                                                        color: ColorSelectionStore.colorHex() })
        )
    }
}

//colorsDefault: ['#000000','#101040','#202050','#303060','#404070',
//    '#505080','#505090','#6060a0','#7070a0','#8080b0',
//    '#9090c0','#a0a0d0','#b0b0d0','#d0d0e0'



export { ColorSelectionModal, ColorSelectionStore }