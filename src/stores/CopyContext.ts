// @ts-nocheck
import BitmapStore from "./BitmapStore";

const CopyContext = () => {
  console.log('Creating a new CopyContext')
  return {
      startMemPos: -1,
      startCharX: -1,
      startCharY: -1,
      endMemPos: 99999999,
      endCharX: -1,
      endCharY: -1,
      isCopyable: function() {
          if (this.startMemPos == -1 || this.endMemPos == -1) {
              return false
          }
          if (this.startMemPos > -1 && ( this.endMemPos < 99999999)) {
              return true
          }
          return false
      },
      calculateIndexList: function(memPosToStart : number) {
        let result = []
        let x = ( this.endCharX - this.startCharX ) + 1
        let y = ( this.endCharY - this.startCharY ) + 1

        let memPos = memPosToStart
        let cntX = 1
        let cntY = 1

        do {

            do {
                result.push(memPos)
                cntX++
                memPos = memPos + 8
            } while ( cntX <= x)

            cntY++
            console.log('new line=' + cntY +  ' mempos old=' + memPos)
            //memPos = memPos + ((this.startCharY) * ( 8 *40) ) - ( x * 8)
            memPos = memPos + ( (8*40)  - ( x * 8))
            console.log('new line=' + cntY +  ' startCharY=' + this.startCharY  + ' x=' + x + '  mempos new=' + memPos)
            cntX = 1
        }  while ( cntY <= y )
        return result
      },
      getSourceIndexList: function() {
        return this.calculateIndexList(this.startMemPos)
      },
      getDestinationIndexList: function(destMemPos: number) {
        return this.calculateIndexList(destMemPos)
      },
      copyBitmap: function(bitmap : number[], destMemPos: number) {
          let sourceList : number[] = this.getSourceIndexList()
          let destList : number[] = this.getDestinationIndexList(destMemPos)
          sourceList.forEach( function (value, index) {

              bitmap[destList[index]] = bitmap[sourceList[index]]
              bitmap[destList[index]+1] = bitmap[sourceList[index]+1]
              bitmap[destList[index]+2] = bitmap[sourceList[index]+2]
              bitmap[destList[index]+3] = bitmap[sourceList[index]+3]
              bitmap[destList[index]+4] = bitmap[sourceList[index]+4]
              bitmap[destList[index]+5] = bitmap[sourceList[index]+5]
              bitmap[destList[index]+6] = bitmap[sourceList[index]+6]
              bitmap[destList[index]+7] = bitmap[sourceList[index]+7]

          })
          return bitmap
      },
      copyScreenRam: function(screenRam : number[], destMemPos: number) {
          let sourceList : number[] = this.getSourceIndexList()
          let destList : number[] = this.getDestinationIndexList(destMemPos)
          sourceList.forEach( function (value, index) {
              screenRam[destList[index]/8] = screenRam[sourceList[index]/8]
          })
          return screenRam
      },
      copyColorRam: function(colorRam : number[], destMemPos: number) {
          let sourceList : number[] = this.getSourceIndexList()
          let destList : number[] = this.getDestinationIndexList(destMemPos)
          sourceList.forEach( function (value, index) {
              colorRam[destList[index]/8] = colorRam[sourceList[index]/8]
          })
          return colorRam
      },


  }
}


export { CopyContext }