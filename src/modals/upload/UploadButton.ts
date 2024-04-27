// @ts-nocheck
import {h, toRefs} from 'vue'
import {Button, Upload} from 'ant-design-vue'
import {UploadOutlined} from '@ant-design/icons-vue'
import {useUpload} from './UseUpload'

const UploadButton = {
    props: {
        type: String,
        accept: String,
        placeholder: String,
    },
    setup(props) {
        const {placeholder} = toRefs(props)
        const {accept} = toRefs(props)
        return {placeholder, accept, ...useUpload(props)}
    },
    render() {
        return h(Upload, { modelValue: this.fileList,
            multiple: false,
            showUploadList: false,
            accept: this.accept,
            listType: 'picture',
            transformFile: (file) => this.transformFile(file),
            beforeUpload: (file, fileList) => this.beforeUpload(file, fileList)
        }, h(Button, null, [h(UploadOutlined), this.placeholder] ) )
    }

}

export { UploadButton }
