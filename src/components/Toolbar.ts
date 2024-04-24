// @ts-nocheck
import {h} from 'vue'
import { PlusOutlined, BorderInnerOutlined, DownloadOutlined, UploadOutlined, QuestionOutlined, BgColorsOutlined } from '@ant-design/icons-vue'
import ScreenStore from '../stores/ScreenStore'
import Help from './Help.vue'
import {Download, DownloadStore} from "./Download"
import { FilesUploadModal } from './upload/FilesUploadModal'
import { UploadStore } from './upload/UploadStore'
import {NewModal, NewStore} from './NewModal';
import {PaletteUpDownload, PaletteUpDownloadStore} from "./palette/PaletteUpDownload";
import BitmapStore from "../stores/BitmapStore";
import {ByteDumperModal} from "./ByteDumperModal";
import {PasteModal} from "./PasteModal";
import {TextModal} from "./TextModal";
import ReplaceColorsModal from "./ReplaceColorsModal.vue";
import ImportImageModal from "./ImportImageModal.vue";



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
            h('div', { } , [h(Help), h(Download), h(FilesUploadModal), h(NewModal), h(ByteDumperModal), h(PasteModal), h(TextModal), h(ReplaceColorsModal), h(ImportImageModal)])
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