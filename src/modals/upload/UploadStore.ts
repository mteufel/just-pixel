// @ts-nocheck
import { createBasicDialogStore } from '../../stores/BasicDialogStore'

const UploadStore = createBasicDialogStore()

UploadStore.bitmap = []
UploadStore.colorRam = []
UploadStore.png = null

export { UploadStore }