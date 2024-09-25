// @ts-nocheck
import BitmapStore from "./BitmapStore";
import ScreenStore from "./ScreenStore";
import {
    calculateMempos,
    createUUID,
    flipBitsHorizontally,
    refreshComplete,
    removeLastChar,
    unmarkArea
} from "../util/utils";
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
      svgFromStore: null,

      getMarker: function() {
          return {
              startMemPos: this.startMemPos,
              endMemPos: this.endMemPos,
              startCharX: this.startCharX,
              startCharY: this.startCharY,
              endCharX: this.endCharX,
              endCharY: this.endCharY,
              svgFromStore: this.svgFromStore
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
      calculateIndexList: function(memPosToStart : number, mode: string) {
            let result = []
            let x = ( this.endCharX - this.startCharX ) + 1    // width in chars
            let y = ( this.endCharY - this.startCharY ) + 1    // height in chars
             let cntX = 1
             let cntY = 1

            //console.log('calculateIndexList : in=', { mode, memPosToStart, x, y } )

            if (mode === 'normal') {
                do {
                    do {
                        result.push( memPosToStart + calculateMempos(cntX, cntY))
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
                        result.push( memPosToStart + calculateMempos(cntX, cntY))
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
                      result.push( memPosToStart + calculateMempos(cntX, cntY))
                      cntX--
                  } while ( cntX > 0)
                  cntY++
                  cntX = x
              }  while ( cntY <= y )
          }


          //console.log('calculateIndexList : out=', result )
          return result
      },
      getSourceIndexList: function(mode: string) {
        return this.calculateIndexList(this.startMemPos, mode)
      },
      getDestinationIndexList: function(destMemPos: number) {
        return this.calculateIndexList(destMemPos, 'normal')
      },
      copyBitmap: function(destBitmap : number[], destMemPos: number, mode: String) {
          return this.copyBitmap_(destBitmap, destBitmap, destMemPos, mode)
      },
      copyScreenRam: function(destScreenRam : number[], destMemPos: number, mode: String) {
          return this.copyScreenRam_(destScreenRam, destScreenRam, destMemPos, mode)
      },
      copyColorRam: function(destColorRam : number[], destMemPos: number, mode: String) {
          return this.copyColorRam_(destColorRam, destColorRam,destMemPos, mode)
      },
      copyBitmapFromStorage(pixels:any, destBitmap : number[], destMemPos: number, mode: String) {
          console.log('copyFromStorage')
          let clearAreas = BitmapStore.clearBitmap_()
          let sourceBitmap = clearAreas.bitmap
          console.log('clearAreas......', clearAreas)
          pixels.bytes.forEach(memArea => {
              memArea.bitmap.forEach((bitmap, index) => {
                  sourceBitmap[memArea.mempos+index] = bitmap
              })
          })
         console.log('bitmap.....', sourceBitmap)
         return this.copyBitmap_(sourceBitmap, destBitmap, destMemPos, mode)
      },
      copyColorRamFromStorage(pixels:any, destColorRam : number[], destMemPos: number, mode: String) {
          let clearAreas = BitmapStore.clearBitmap_()
          let sourceColorRam = clearAreas.colorRam
          pixels.bytes.forEach(memArea => {
              sourceColorRam[memArea.mempos/8] = memArea.color
          })
          return this.copyColorRam_(sourceColorRam, destColorRam, destMemPos, mode)
      },
      copyScreenRamFromStorage(pixels:any, destScreenRam : number[], destMemPos: number, mode: String) {
          let clearAreas = BitmapStore.clearBitmap_()
          let sourceScreenRam = clearAreas.screenRam
          pixels.bytes.forEach(memArea => {
              sourceScreenRam[memArea.mempos/8] = memArea.screen
          })
          return this.copyScreenRam_(sourceScreenRam, destScreenRam, destMemPos, mode)
      },
      copyBitmap_: function(sourceBitmap: number[], destBitmap : number[], destMemPos: number, mode: String) {
          console.log('doCopy')

          let sourceList : number[] = this.getSourceIndexList(mode)

          let destList : number[] = this.getDestinationIndexList(destMemPos)
          console.log('sourceList ', sourceList)
          console.log('destList ', destList)


          sourceList.forEach( function (value, index) {

              if (mode==='normal') {
                  destBitmap[destList[index]] =   sourceBitmap[sourceList[index]]
                  destBitmap[destList[index]+1] = sourceBitmap[sourceList[index]+1]
                  destBitmap[destList[index]+2] = sourceBitmap[sourceList[index]+2]
                  destBitmap[destList[index]+3] = sourceBitmap[sourceList[index]+3]
                  destBitmap[destList[index]+4] = sourceBitmap[sourceList[index]+4]
                  destBitmap[destList[index]+5] = sourceBitmap[sourceList[index]+5]
                  destBitmap[destList[index]+6] = sourceBitmap[sourceList[index]+6]
                  destBitmap[destList[index]+7] = sourceBitmap[sourceList[index]+7]
              }

              if (mode==='vertically') {
                  destBitmap[destList[index]] =   sourceBitmap[sourceList[index]+7]
                  destBitmap[destList[index]+1] = sourceBitmap[sourceList[index]+6]
                  destBitmap[destList[index]+2] = sourceBitmap[sourceList[index]+5]
                  destBitmap[destList[index]+3] = sourceBitmap[sourceList[index]+4]
                  destBitmap[destList[index]+4] = sourceBitmap[sourceList[index]+3]
                  destBitmap[destList[index]+5] = sourceBitmap[sourceList[index]+2]
                  destBitmap[destList[index]+6] = sourceBitmap[sourceList[index]+1]
                  destBitmap[destList[index]+7] = sourceBitmap[sourceList[index]]
              }

              if (mode==='horizontally') {
                  destBitmap[destList[index]] =   flipBitsHorizontally(sourceBitmap[sourceList[index]])
                  destBitmap[destList[index]+1] = flipBitsHorizontally(sourceBitmap[sourceList[index]+1])
                  destBitmap[destList[index]+2] = flipBitsHorizontally(sourceBitmap[sourceList[index]+2])
                  destBitmap[destList[index]+3] = flipBitsHorizontally(sourceBitmap[sourceList[index]+3])
                  destBitmap[destList[index]+4] = flipBitsHorizontally(sourceBitmap[sourceList[index]+4])
                  destBitmap[destList[index]+5] = flipBitsHorizontally(sourceBitmap[sourceList[index]+5])
                  destBitmap[destList[index]+6] = flipBitsHorizontally(sourceBitmap[sourceList[index]+6])
                  destBitmap[destList[index]+7] = flipBitsHorizontally(sourceBitmap[sourceList[index]+7])
              }




          })
          return destBitmap
      },
      copyScreenRam_: function(sourceScreenRam: number[], destScreenRam : number[], destMemPos: number, mode: String) {
          let sourceList : number[] = this.getSourceIndexList(mode)
          let destList : number[] = this.getDestinationIndexList(destMemPos)
          sourceList.forEach( function (value, index) {
              destScreenRam[destList[index]/8] = sourceScreenRam[sourceList[index]/8]
          })
          return destScreenRam
      },
      copyColorRam_: function(sourceColorRam : number[], destColorRam : number[], destMemPos: number, mode: String) {
          let sourceList : number[] = this.getSourceIndexList(mode)
          let destList : number[] = this.getDestinationIndexList(destMemPos)
          sourceList.forEach( function (value, index) {
              destColorRam[destList[index]/8] = sourceColorRam[sourceList[index]/8]
          })
          return destColorRam
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
      asObject: function() {
          let result = {
                  name: createUUID(),
                  marker: { startMemPos: this.getMarker().startMemPos, endMemPos: this.getMarker().endMemPos,
                              startCharX: this.getMarker().startCharX, startCharY: this.getMarker().startCharY,
                              endCharX: this.getMarker().endCharX, endCharY: this.getMarker().endCharY },
                  mode: 'mcm',
                  bytes: []
              }

          let sourceList = this.getSourceIndexList('normal')
          sourceList.forEach( mempos => {
              let idx = 0
              if (mempos > 0) {
                  idx = mempos/8
              }


              let array = Array.from(BitmapStore.getBitmap().slice(mempos,mempos+8))
              let bytes = {
                  mempos: mempos,
                  bitmap: array,
                  screen: BitmapStore.getScreenRam()[idx],
                  color: BitmapStore.getColorRam()[idx]
              }
              result.bytes.push(bytes)

          })

          return result
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
          result.push ("   name: '" + createUUID() + "',")
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
                result.push ( "            {  mempos: " + mempos + ", bitmap: [ " + bytes + " ], screen: " + BitmapStore.getScreenRam()[idx]  + ", color: " + BitmapStore.getColorRam()[idx] +  " },")
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

          let screenAndColorRamLineSize = 40
          let lineSizeCounter = 0
          let line = ''
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
          result.push ("############## BITMAP ####################")
          sourceList.forEach( function (value, index) {
              let line = counterFunction() + command + ' ' + BitmapStore.getBitmap().slice(sourceList[index],sourceList[index]+8).join(',')
              result.push(line)
          })
          // Screen
          result.push ("############## SCREEN RAM ####################")
          lineSizeCounter = screenAndColorRamLineSize
          sourceList.forEach( function (value, index) {
              if (lineSizeCounter == screenAndColorRamLineSize) {
                  result.push(removeLastChar(line))
                  lineSizeCounter = 0
                  line = counterFunction() + command + ' '
              }
              line = line + BitmapStore.getScreenRam().slice(sourceList[index]/8,(sourceList[index]+8)/8).join(',') + ","
              lineSizeCounter++
          })
          result.push(removeLastChar(line))
          // Color RAM
          result.push ("############## COLOR RAM ####################")
          /*
          sourceList.forEach( function (value, index) {
              let line = counterFunction() + command + ' ' + BitmapStore.getColorRam().slice(sourceList[index]/8,(sourceList[index]+8)/8).join(',')
              result.push(line)
          })
           */
          line = ''
          lineSizeCounter = screenAndColorRamLineSize
          sourceList.forEach( function (value, index) {
              if (lineSizeCounter == screenAndColorRamLineSize) {
                  result.push(removeLastChar(line))
                  lineSizeCounter = 0
                  line = counterFunction() + command + ' '
              }
              line = line + BitmapStore.getColorRam().slice(sourceList[index]/8,(sourceList[index]+8)/8).join(',') + ","
              lineSizeCounter++
          })
          result.push(removeLastChar(line))


          return result
      },
      doCopy: function(mode: String) {
          if (this.svgFromStore != null ) {
              let pixels = JSON.parse(localStorage.getItem(ScreenStore.getCopyContext().svgFromStore))
              console.log('svgFromStore...', this.svgFromStore)
              console.log('pixels.........', pixels)
              ScreenStore.getCopyContext().startMemPos = pixels.marker.startMemPos
              ScreenStore.getCopyContext().endMemPos = pixels.marker.endMemPos
              ScreenStore.getCopyContext().startCharX = pixels.marker.startCharX
              ScreenStore.getCopyContext().startCharY = pixels.marker.startCharY
              ScreenStore.getCopyContext().endCharX = pixels.marker.endCharX
              ScreenStore.getCopyContext().endCharY = pixels.marker.endCharY
              BitmapStore.setBitmap ( ScreenStore.getCopyContext().copyBitmapFromStorage(pixels, BitmapStore.getBitmap(), ScreenStore.getMemoryPosition(), mode) )
              BitmapStore.setScreenRam( ScreenStore.getCopyContext().copyScreenRamFromStorage(pixels, BitmapStore.getScreenRam(), ScreenStore.getMemoryPosition(), mode) )
              if (BitmapStore.isMCM()) {
                  BitmapStore.setColorRam( ScreenStore.getCopyContext().copyColorRamFromStorage(pixels, BitmapStore.getColorRam(), ScreenStore.getMemoryPosition(), mode) )
              }
              unmarkArea()
              console.log('svgFromStore DONE')
          } else {
              BitmapStore.setBitmap ( ScreenStore.getCopyContext().copyBitmap(BitmapStore.getBitmap(), ScreenStore.getMemoryPosition(), mode) )
              BitmapStore.setScreenRam( ScreenStore.getCopyContext().copyScreenRam(BitmapStore.getScreenRam(), ScreenStore.getMemoryPosition(), mode) )
              if (BitmapStore.isMCM()) {
                  BitmapStore.setColorRam( ScreenStore.getCopyContext().copyColorRam(BitmapStore.getColorRam(), ScreenStore.getMemoryPosition(), mode) )
              }
          }
          refreshComplete()
      }
  }
}


export { CopyContext }