// @ts-nocheck
import {h, toRefs} from 'vue'
import {Button, Upload} from 'ant-design-vue'
import {UploadOutlined} from '@ant-design/icons-vue'
import {useUpload} from './UseUpload'

const UploadButton = {
    props: {
        type: String,
        placeholder: String,
    },
    setup(props) {
        const {placeholder} = toRefs(props)
        return {placeholder, ...useUpload(props)}
    },
    render() {
        return h(Upload, { modelValue: this.fileList,
            multiple: false,
            showUploadList: true,
            listType: 'picture',
            transformFile: (file) => this.transformFile(file),
            beforeUpload: (file, fileList) => this.beforeUpload(file, fileList)
        }, h(Button, null, [h(UploadOutlined), this.placeholder] ) )
    }

}

export { UploadButton }
