import {message} from 'ant-design-vue'
import {UploadStore} from './UploadStore'

export function useUpload(props) {

    let beforeUpload = (file, fileList) => {
        console.log('beforeUpload ) ', file, fileList)
        return false;
    }

    let transformFile = (file) => {
        console.log('transformFile ', file)
    }

    if (props.type === 'bitmap' || props.type == 'color-ram' ) {

        beforeUpload = (file, fileList) => {
            console.log('beforeUpload [' +  props.type + '] ) ', file, fileList)
            if (endsWith(file.name, ".bin")) {
                return true
            }
            message.error( 'The file is not a .bin file!'  )
            return false
        }

    }

    if (props.type === 'bitmap') {
        transformFile = (file) => {
            return uploadData(file, (result) => UploadStore.bitmap = result )
        }
    }

    if (props.type === 'color-ram') {
        transformFile = (file) => {
            return uploadData(file, (result) => UploadStore.colorRam = result )
        }
    }


    return { beforeUpload, transformFile }

}


function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function uploadData(file, resolver) {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = (e) => {
            let arrayBuffer = e.target.result
            resolver(new Uint8Array(arrayBuffer))
        }
    })
}