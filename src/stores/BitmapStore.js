const createBitmapStore = () => {

    let bitmap = []          // 8 x 8 bits per char (8 Bytes), 40 chars per line (320 Bytes), 25 lines (8000 Bytes)

    let colors = []          // 1 Byte per char, 40 chars per line, 25 line   = 1000 Bytes
                             // Color for one char e.g. 176
                             //     => $b0 => Highbyte : grey ($b)
                             //               LowByte  : black ($0)



    // Colors (c) by Deekay/Crest
    let colorPalette = [
        { color: 'black',       colorIndex: 0,  colorIndexHex: 0x0, colorCodeHex: 0x0a0a0a, r: 10, g: 10, b: 10 },
        { color: 'white',       colorIndex: 1,  colorIndexHex: 0x1, colorCodeHex: 0xfff8ff, r: 255, g: 248, b: 255 },
        { color: 'red',         colorIndex: 2,  colorIndexHex: 0x2, colorCodeHex: 0x851f02, r: 133, g: 31, b: 2 },
        { color: 'cyan',        colorIndex: 3,  colorIndexHex: 0x3, colorCodeHex: 0x65cda8, r: 101, g: 205, b: 169 },
        { color: 'purple',      colorIndex: 4,  colorIndexHex: 0x4, colorCodeHex: 0xa73b9f, r: 167, g: 59, b: 159 },
        { color: 'green',       colorIndex: 5,  colorIndexHex: 0x5, colorCodeHex: 0x4dab19, r: 77, g: 171, b: 25 },
        { color: 'blue',        colorIndex: 6,  colorIndexHex: 0x6, colorCodeHex: 0x1a0c92, r: 26, g: 12, b: 146 },
        { color: 'yellow',      colorIndex: 7,  colorIndexHex: 0x7, colorCodeHex: 0xebe353, r: 235, g: 227, b: 83 },
        { color: 'orange',      colorIndex: 8,  colorIndexHex: 0x8, colorCodeHex: 0xa94b02, r: 169, g: 74, b: 2 },
        { color: 'brown',       colorIndex: 9,  colorIndexHex: 0x9, colorCodeHex: 0x441e00, r: 68, g: 30, b: 0 },
        { color: 'light red',   colorIndex: 10, colorIndexHex: 0xa, colorCodeHex: 0xd28074, r: 210, g: 128, b: 116 },
        { color: 'dark grey',   colorIndex: 11, colorIndexHex: 0xb, colorCodeHex: 0x464646, r: 70, g: 70, b: 70 },
        { color: 'grey',        colorIndex: 12, colorIndexHex: 0xc, colorCodeHex: 0x8b8b8b, r: 139, g: 139, b: 139 },
        { color: 'light green', colorIndex: 13, colorIndexHex: 0xd, colorCodeHex: 0x8ef68e, r: 142, g: 246, b: 142 },
        { color: 'light blue',  colorIndex: 14, colorIndexHex: 0xe, colorCodeHex: 0x4d91d1, r: 77, g: 145, b: 209 },
        { color: 'light grey',  colorIndex: 15, colorIndexHex: 0xf, colorCodeHex: 0xbababa, r: 186, g: 186, b: 186 },
    ]

    let subscribers = []

    const callSubscribers = () => {
        subscribers.forEach( callFunction => callFunction())
    }

    const createBlock = (char) => {
        bitmap[char+0] = 255
        bitmap[char+1] = 255
        bitmap[char+2] = 255
        bitmap[char+3] = 255
        bitmap[char+4] = 255
        bitmap[char+5] = 255
        bitmap[char+6] = 255
        bitmap[char+7] = 255
    }

    const createBlock2 = (char) => {
        bitmap[char+0] = 100
        bitmap[char+1] = 100
        bitmap[char+2] = 100
        bitmap[char+3] = 100
        bitmap[char+4] = 100
        bitmap[char+5] = 100
        bitmap[char+6] = 100
        bitmap[char+7] = 100
    }

    const createTestBitmap = (char, other = false) => {
        if (other) {
            bitmap[char+0] = 1
            bitmap[char+1] = 2
            bitmap[char+2] = 4
            bitmap[char+3] = 8
            bitmap[char+4] = 16
            bitmap[char+5] = 32
            bitmap[char+6] = 64
            bitmap[char+7] = 128
        } else {
            bitmap[char+0] = 128
            bitmap[char+1] = 64
            bitmap[char+2] = 32
            bitmap[char+3] = 16
            bitmap[char+4] = 8
            bitmap[char+5] = 4
            bitmap[char+6] = 2
            bitmap[char+7] = 1
        }
    }

    return {
        getNibble: (number, nth) => (number >> 4*nth) & 0xF,
        clearBitmap: () => {
            bitmap = []
            colors = []
            for (let i = 0; i < 8000; i++) {
                bitmap.push(0)
            }
            for (let i = 0; i < 1000; i++) {
                colors.push(176)
            }

            /*
            const zeile = 40*8

            for (let i = 0; i < (25*zeile); i = i + 8) {
                let zufall = (Math.random() * (20 - 1)) + 1;
                if (zufall < 10) {
                    createTestBitmap(i)
                } else {
                    createTestBitmap(i, true)
                }
            }

            for (let i = 0; i < (25*zeile); i = i + 8) {
                let zufall = (Math.random() * (50 - 1)) + 1;
                if (zufall < 10) {
                    createBlock(i)
                }

            }

            //createBlock2(1960)
            //createBlock2(1968)
            */


        },
        setBitmap: (data) => bitmap = data,
        setColorRam: (data) => colors = data,
        dumpBitmap: () => {
          console.log(bitmap)
        },
        getBinaryLine: (idx) => {
            let value = bitmap[idx]
            let s = value.toString(2);
            while (s.length < (8 || 2)) {
                  s = "0" + s
            }
            return s;
        },
        flipBit: (index,pos) => {
            bitmap[index] = bitmap[index]^(1<<pos)  // XOR
            callSubscribers()
        },
        callSubscribers: () => {
            callSubscribers()
        },
        getColorByIndex: (idx) => colorPalette.find( color => color.colorIndex===idx),
        getColorByHexNumber: (hex) => colorPalette.find( color => color.colorIndexHex===hex),
        getColorByName: (name) => colorPalette.find( color => color.color===name),
        getColor: (memoryPosition) => colors[memoryPosition/8],
        getBackgroundColor: (memoryPosition) => {
            let color = BitmapStore.getColor(memoryPosition)
            // returns the LowByte == Background
            return BitmapStore.getColorByHexNumber(BitmapStore.getNibble(color, 0))
        },
        getForegroundColor: (memoryPosition) => {
            let color = BitmapStore.getColor(memoryPosition)
            // returns the HighByte == Foreground
            return BitmapStore.getColorByHexNumber(BitmapStore.getNibble(color, 1))
        },
        setBackgroundColor: (memoryPosition, bg) => {
            let color = BitmapStore.getColor(memoryPosition)  // hi und low byte
            let fg = BitmapStore.getNibble(color, 1)
            colors[memoryPosition/8] =  (fg << 4) | bg
        },
        setForegroundColor: (memoryPosition, fg) => {
            let color = BitmapStore.getColor(memoryPosition)  // hi und low byte
            let bg = BitmapStore.getNibble(color, 0)
            colors[memoryPosition/8] =  (fg << 4) | bg
        },

        download: (fileName) => {
            //Upload https://stackoverflow.com/questions/55238215/ant-design-upload-get-file-content
            // --Bitmap--
            let bytes = new Uint8Array(BitmapStore.getBitmap().length)
            BitmapStore.getBitmap().forEach( ((value, index) => bytes[index] = value))
            let blob = new Blob([bytes], { type: 'application/octet-stream' })
            let link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = fileName + '-bitmap.bin'
            link.click()
            // --Colors--
            bytes = new Uint8Array(BitmapStore.getColorRam().length)
            BitmapStore.getColorRam().forEach( ((value, index) => bytes[index] = value))
            blob = new Blob([bytes], { type: 'application/octet-stream' })
            link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = fileName + '-colors.bin'
            link.click()
        },

        getBitmap: () => bitmap,
        getColorRam: () => colors,
        subscribe: (fn) => {
            subscribers.push(fn)
        }

    }
}

const BitmapStore = createBitmapStore()

export default BitmapStore