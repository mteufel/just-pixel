// @ts-nocheck
import {h, ref } from 'vue'
import {Radio, Modal, Tex, Textarea} from 'ant-design-vue'
import {createBasicDialogStore} from '../stores/BasicDialogStore'
import {ByteDumperStore} from "../modals/ByteDumperModal";
import TestInput from "./TestInput.vue";



const TextStore = createBasicDialogStore()

TextStore.beforeDialogClose = (fn) => {
    TextStore.beforeDialogCloseFunction = fn
}


const TextModal = {
    setup() {
        console.log('TextModal setup')
        const newVisible = ref(TextStore.isVisible())

        TextStore.subscribe( () => newVisible.value = TextStore.isVisible())

        const okPressed = () => {
            TextStore.toggle()
        }

       const createDialogContent = () => {
            return h( TestInput, null)
            //return h( Textarea, {  class: 'byteDumperCodeStyle',
            //    autoSize: { minRows: 15, maxRows: 15}, value: "aabfbdgdfgdsfga" } )

       }



        return { okPressed, newVisible, createDialogContent }
    },
    render() {
        console.log('TextModal render')
        return h(Modal, { onCancel: () => TextStore.toggle(),
            visible: this.newVisible,
            closable: true,
            destroyOnClose: true,
            onOk: this.okPressed,
            title: 'Insert Text' }, this.createDialogContent())
    }
}



export { TextModal, TextStore }