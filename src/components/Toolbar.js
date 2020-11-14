import { h } from 'vue'
import { PlusOutlined, BorderInnerOutlined ,QuestionOutlined } from '@ant-design/icons-vue';
import ScreenStore from "../stores/ScreenStore";
const svg = new URL('../mega65.svg', import.meta.url);

const Toolbar = {

    setup() {

        return () => {
            return [
                h('div', { class:'toolbarIcon' } , h(PlusOutlined, { onClick: () => ScreenStore.actionNew() }) ),
                h('div', { class:'toolbarIcon' } , h(BorderInnerOutlined, { onClick: () => ScreenStore.actionGrid() }) ),
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
                //h('img', { class:'mega65-logo', src: svg.href } )
            ]
        }
    }
}

export { Toolbar }