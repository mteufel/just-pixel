// @ts-nocheck
import {h} from 'vue'
import { PlusOutlined, BorderInnerOutlined, DownloadOutlined, UploadOutlined, QuestionOutlined, BgColorsOutlined } from '@ant-design/icons-vue'
import ScreenStore from '../stores/ScreenStore'
import Help from '../modals/Help.vue'
import {Download, DownloadStore} from "./Download"
import { FilesUploadModal } from '../modals/upload/FilesUploadModal'
import { UploadStore } from '../modals/upload/UploadStore'
import {NewModal, NewStore} from '../modals/NewModal';
import {PaletteUpDownload, PaletteUpDownloadStore} from "../modals/palette/PaletteUpDownload";
import BitmapStore from "../stores/BitmapStore";
import {ByteDumperModal} from "../modals/ByteDumperModal";
import {PasteModal} from "../modals/PasteModal";
import {TextModal} from "./TextModal";
import ReplaceColorsModal from "../modals/ReplaceColorsModal.vue";
import ImportImageModal from "../modals/ImportImageModal.vue";
import StorageModal from "../modals/StorageModal.vue";



const Toolbar = {
    setup(props, context) {

        const createNew = () => {
            const modeSwitcher = () => {
                context.emit('modeSwitch')
            }
            NewStore.beforeDialogClose(modeSwitcher)
            NewStore.toggle()
        }

        return { createNew }
    },
    render() {
        console.log('Render Toolbar..... ')
        let resultClassic = [
            h('div', { class:'toolbarIcon' } , h(PlusOutlined, { onClick: this.createNew }) ),
            h('div', { class:'toolbarIcon' } , h(BorderInnerOutlined, { onClick: ScreenStore.actionGrid }) ),
            h('div', { class:'toolbarIcon' } , h(DownloadOutlined, { onClick: DownloadStore.toggle }) ),
            h('div', { class:'toolbarIcon' } , h(UploadOutlined, { onClick: UploadStore.toggle }) ),
            h('div', { class:'toolbarIcon' } , h(QuestionOutlined, { onClick: Help.helpStore.toggle }) ),
            // ab hier die ganzen Dialog-Komponenten die potentiell aufgemacht werden können...
            h('div', { } , [h(Help), h(Download), h(FilesUploadModal), h(NewModal), h(ByteDumperModal), h(PasteModal), h(TextModal), h(ReplaceColorsModal),
                            h(ImportImageModal), h(StorageModal)])
        ]

        let resultFCM = [
            h('div', { class:'toolbarIcon' } , h(PlusOutlined, { onClick: this.createNew }) ),
            h('div', { class:'toolbarIcon' } , h(BorderInnerOutlined, { onClick: ScreenStore.actionGrid }) ),
            h('div', { class:'toolbarIcon' } , h(DownloadOutlined, { onClick: DownloadStore.toggle }) ),
            h('div', { class:'toolbarIcon' } , h(UploadOutlined, { onClick: UploadStore.toggle }) ),
            h('div', { class:'toolbarIcon' } , h(BgColorsOutlined, { onClick: PaletteUpDownloadStore.toggle }) ),
            h('div', { class:'toolbarIcon' } , h(QuestionOutlined, { onClick: Help.helpStore.toggle }) ),
            // ab hier die ganzen Dialog-Komponenten die potentiell aufgemacht werden können...
            h('div', { } , [h(Help), h(Download), h(FilesUploadModal), h(NewModal), h(ByteDumperModal), h(PasteModal), h(TextModal)])

        ]
        console.log('Render Toolbar..... End')
        return BitmapStore.isFCM() ? resultFCM : resultClassic
    }
}

export { Toolbar }