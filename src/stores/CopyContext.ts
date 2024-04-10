// @ts-nocheck
import BitmapStore from "./BitmapStore";
import ScreenStore from "./ScreenStore";
import {flipBitsHorizontally, refreshComplete} from "../util/utils";
import bitmapStore from "./BitmapStore";

const CopyContext = () => {
  console.log('Creating a new CopyContext')
  return {
      startMemPos: -1,
      startCharX: -1,
      startCharY: -1,
      endMemPos: 99999999,
      endCharX: -1,
      endCharY: -1,
      getMarker: function() {
          return {
              startMemPos: this.startMemPos,
              endMemPos: this.endMemPos,
              startCharX: this.startCharX,
              startCharY: this.startCharY,
              endCharX: this.endCharX,
              endCharY: this.endCharY
          }
      },
      hasMarker: function() {
            if (this.startMemPos > -1 ) {
                return true
            }
            if (this.endMemPos > -1 && this.endMemPos != 999999 && this.endMemPos != 99999999 ) {
                return true
            }
            return false
      },
      isCopyable: function() {
          if (this.startMemPos == -1 || this.endMemPos == -1) {
              return false
          }
          if (this.startMemPos > -1 && ( this.endMemPos < 99999999)) {
              return true
          }
          return false
      },
      calculateMemPos: function(memPos: number, x: number, y: number) {
          return memPos + ( (y-1) * (40*8) + (x-1) * 8 )
      },
      calculateIndexList: function(memPosToStart : number, mode: string) {
            let result = []
            let x = ( this.endCharX - this.startCharX ) + 1    // width in chars
            let y = ( this.endCharY - this.startCharY ) + 1    // height in chars
             let cntX = 1
             let cntY = 1

            console.log('calculateIndexList : in=', { mode, memPosToStart, x, y } )

            if (mode === 'normal') {
                do {
                    do {
                        result.push(this.calculateMemPos(memPosToStart, cntX, cntY))
                        cntX++
                    } while ( cntX <= x)
                    cntY++
                    cntX = 1
                    }  while ( cntY <= y )
            }

            if (mode === 'vertically') {
                cntY = y
                cntX = 1
                do {
                    do {
                        result.push(this.calculateMemPos(memPosToStart, cntX, cntY))
                        cntX++
                    } while ( cntX <= x )

                    cntY--
                    cntX = 1
                } while ( cntY > 0 )
            }

          if (mode === 'horizontally') {
              let cntX = x
              let cntY = 1
              do {
                  do {
                      result.push(this.calculateMemPos(memPosToStart, cntX, cntY))
                      cntX--
                  } while ( cntX > 0)
                  cntY++
                  cntX = x
              }  while ( cntY <= y )
          }


          console.log('calculateIndexList : out=', result )
          return result
      },
      getSourceIndexList: function(mode: string) {
        return this.calculateIndexList(this.startMemPos, mode)
      },
      getDestinationIndexList: function(destMemPos: number) {
        return this.calculateIndexList(destMemPos, 'normal')
      },
      copyBitmap: function(bitmap : number[], destMemPos: number, mode: String) {


          let sourceList : number[] = this.getSourceIndexList(mode)

          let destList : number[] = this.getDestinationIndexList(destMemPos)
          console.log('sourceList ', sourceList)
          console.log('destList ', destList)


          sourceList.forEach( function (value, index) {

              if (mode==='normal') {
                  bitmap[destList[index]] =   bitmap[sourceList[index]]
                  bitmap[destList[index]+1] = bitmap[sourceList[index]+1]
                  bitmap[destList[index]+2] = bitmap[sourceList[index]+2]
                  bitmap[destList[index]+3] = bitmap[sourceList[index]+3]
                  bitmap[destList[index]+4] = bitmap[sourceList[index]+4]
                  bitmap[destList[index]+5] = bitmap[sourceList[index]+5]
                  bitmap[destList[index]+6] = bitmap[sourceList[index]+6]
                  bitmap[destList[index]+7] = bitmap[sourceList[index]+7]
              }

              if (mode==='vertically') {
                  bitmap[destList[index]] =   bitmap[sourceList[index]+7]
                  bitmap[destList[index]+1] = bitmap[sourceList[index]+6]
                  bitmap[destList[index]+2] = bitmap[sourceList[index]+5]
                  bitmap[destList[index]+3] = bitmap[sourceList[index]+4]
                  bitmap[destList[index]+4] = bitmap[sourceList[index]+3]
                  bitmap[destList[index]+5] = bitmap[sourceList[index]+2]
                  bitmap[destList[index]+6] = bitmap[sourceList[index]+1]
                  bitmap[destList[index]+7] = bitmap[sourceList[index]]
              }

              if (mode==='horizontally') {
                  bitmap[destList[index]] =   flipBitsHorizontally(bitmap[sourceList[index]])
                  bitmap[destList[index]+1] = flipBitsHorizontally(bitmap[sourceList[index]+1])
                  bitmap[destList[index]+2] = flipBitsHorizontally(bitmap[sourceList[index]+2])
                  bitmap[destList[index]+3] = flipBitsHorizontally(bitmap[sourceList[index]+3])
                  bitmap[destList[index]+4] = flipBitsHorizontally(bitmap[sourceList[index]+4])
                  bitmap[destList[index]+5] = flipBitsHorizontally(bitmap[sourceList[index]+5])
                  bitmap[destList[index]+6] = flipBitsHorizontally(bitmap[sourceList[index]+6])
                  bitmap[destList[index]+7] = flipBitsHorizontally(bitmap[sourceList[index]+7])
              }




          })
          return bitmap
      },
      copyScreenRam: function(screenRam : number[], destMemPos: number, mode: String) {
          let sourceList : number[] = this.getSourceIndexList(mode)
          let destList : number[] = this.getDestinationIndexList(destMemPos)
          sourceList.forEach( function (value, index) {
              screenRam[destList[index]/8] = screenRam[sourceList[index]/8]
          })
          return screenRam
      },
      copyColorRam: function(colorRam : number[], destMemPos: number, mode: String) {
          let sourceList : number[] = this.getSourceIndexList(mode)
          let destList : number[] = this.getDestinationIndexList(destMemPos)
          sourceList.forEach( function (value, index) {
              colorRam[destList[index]/8] = colorRam[sourceList[index]/8]
          })
          return colorRam
      },
      getLineNumber: function(incrementBy) {
          console.log('xxx', this.lineNumberCnt)
          if (incrementBy > 0) {
              this.lineNumberCnt = this.lineNumberCnt +incrementBy
          }
          if (this.lineNumberCnt > 0) {
              return this.lineNumberCnt + ' '
          }
          return ''
      },
      toJSON: function() {
          let result = []
          /*
            {
              name: '?',
              mode: 'mcm',
                  bytes: [
                        {  mempos: 0, bitmap: [ 0,0,1,0,0,0,0,4 ], screen: 154, color: 7 },
                        {  mempos: 8, bitmap: [ 0,0,175,110,170,121,170,105 ], screen: 154, color: 7 },
                        {  mempos: 320, bitmap: [ 1,2,5,1,4,0,0,0 ], screen: 154, color: 7 },
                        {  mempos: 320, bitmap: [ 150,69,17,4,17,0,0,0 ], screen: 154, color: 7 },
                    ]
             }

            {  mempos: BYTE_1, bitmap: [ BYTE_2 ], screen: BYTE_3, color: BYTE_4 },
            {
              name: 'REPLACE_1',
              mode: 'REPLACE_2',
                  bytes: [
                        {  mempos: BYTE_1, bitmap: [ BYTE_2 ], screen: BYTE_3, color: BYTE_4 },
                    ]
             }


          */


          result.push ("// this file is a json representation of the marked pixels")
          result.push ("{")
          result.push ("   name: '???',")
          result.push ("   mode: '" + BitmapStore.getModeAsText() +  "',")
          result.push ("   marker: " + JSON.stringify(this.getMarker()).replace(/"([^"]+)":/g, '$1:') +  ",")
          result.push ("   bytes: [")

          let sourceList = this.getSourceIndexList('normal')
          sourceList.forEach( mempos => {
                let idx = 0
                if (mempos > 0) {
                    idx = mempos/8
                }
                let bytes = BitmapStore.getBitmap().slice(mempos,mempos+8).join(',')
                result.push ( "            {  mempos: " + mempos + ", bitmap: [ " + bytes + " ], screen: " + BitmapStore.getScreenRam()[idx]  + ", color: " + bitmapStore.getColorRam()[idx] +  " },")
          })


          result.push ("   ]")
          result.push ("}")
          return result

      },
      easyDump: function(command) {
        console.log('dump 1')
        this.dump(command, -1, -1)
      },
      dump: function(command, lineNumber, incrementBy) {
          console.log('dump ', { command, lineNumber, incrementBy })

          let lineNumberCnt = lineNumber
          let counterFunction = function () {
              console.log('xxx', lineNumberCnt)
              if (incrementBy > 0) {
                  lineNumberCnt = lineNumberCnt + incrementBy
              }
              if (lineNumberCnt > 0) {
                  return lineNumberCnt + ' '
              }
              return ''
          }

          //BitmapStore.getBitmap(), ScreenStore.getMemoryPosition())
          let bitmap = BitmapStore.getBitmap()

          let sourceList : number[] = this.getSourceIndexList('normal')
          let l = this.getLineNumber
          let result = []
          // Bitmap
          sourceList.forEach( function (value, index) {
              let line = counterFunction() + command + ' ' + BitmapStore.getBitmap().slice(sourceList[index],sourceList[index]+8).join(',')
              result.push(line)
          })
          // Screen
          sourceList.forEach( function (value, index) {
              let line = counterFunction() + command + ' ' + BitmapStore.getScreenRam().slice(sourceList[index]/8,(sourceList[index]+8)/8).join(',')
              result.push(line)
          })
          // Color RAM
          sourceList.forEach( function (value, index) {
              let line = counterFunction() + command + ' ' + BitmapStore.getColorRam().slice(sourceList[index]/8,(sourceList[index]+8)/8).join(',')
              result.push(line)
          })
          return result
      },
      doCopy: function(mode: String) {

          BitmapStore.setBitmap ( ScreenStore.getCopyContext().copyBitmap(BitmapStore.getBitmap(), ScreenStore.getMemoryPosition(), mode) )
          BitmapStore.setScreenRam( ScreenStore.getCopyContext().copyScreenRam(BitmapStore.getScreenRam(), ScreenStore.getMemoryPosition(), mode) )
          if (BitmapStore.isMCM()) {
              BitmapStore.setColorRam( ScreenStore.getCopyContext().copyColorRam(BitmapStore.getColorRam(), ScreenStore.getMemoryPosition(), mode) )
          }
          refreshComplete()

      }
  }
}


export { CopyContext }