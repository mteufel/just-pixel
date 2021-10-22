// @ts-nocheck
import {h} from 'vue'
import { PlusOutlined, BorderInnerOutlined, DownloadOutlined, UploadOutlined, QuestionOutlined, BgColorsOutlined } from '@ant-design/icons-vue'
import ScreenStore from '../stores/ScreenStore'
import {Help, HelpStore} from './Help'
import {Download, DownloadStore} from "./Download"
import { FilesUploadModal } from './upload/FilesUploadModal'
import { UploadStore } from './upload/UploadStore'
import {NewModal, NewStore} from './NewModal';
import {PaletteUpDownload, PaletteUpDownloadStore} from "./palette/PaletteUpDownload";


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
        return [
            h('div', { class:'toolbarIcon' } , h(PlusOutlined, { onClick: this.createNew }) ),
            h('div', { class:'toolbarIcon' } , h(BorderInnerOutlined, { onClick: ScreenStore.actionGrid }) ),
            h('div', { class:'toolbarIcon' } , h(DownloadOutlined, { onClick: DownloadStore.toggle }) ),
            h('div', { class:'toolbarIcon' } , h(UploadOutlined, { onClick: UploadStore.toggle }) ),
            h('div', { class:'toolbarIcon' } , h(BgColorsOutlined, { onClick: PaletteUpDownloadStore.toggle }) ),
            h('div', { class:'toolbarIcon' } , h(QuestionOutlined, { onClick: HelpStore.toggle }) ),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            h('div', { class:'toolbarIconOff' } , h(QuestionOutlined)),
            // ab hier die ganzen Dialog-Komponenten die potentiell aufgemacht werden können...
            h('div', { } , [h(Help), h(Download), h(FilesUploadModal), h(NewModal)])

        ]
    }
}

export { Toolbar }