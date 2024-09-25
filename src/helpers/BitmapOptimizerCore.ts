import ScreenStore from "../stores/ScreenStore";
import {BoResult } from "../domain/BitmapOptimizer";

function calcOptimization(checkColorRam:boolean, checkScreenRam:boolean,
                          blockX:number, blockY:nummber):BoResult {

    let result: BoResult = {};
    console.log('aa...', result)
    let cc = ScreenStore.getCopyContext()
    result.areaX = (cc.endCharX - cc.startCharX) + 1
    result.areaY = (cc.endCharY-cc.startCharY) + 1
    result.size = result.areaX + "x" + result.areaY
    result.charsTotal = cc.getSourceIndexList('normal').length
    result.sourceMemPos = cc.getSourceIndexList('normal')

    let bytes = result.charsTotal * 8
    if (checkColorRam) {
        console.log('adding colorRam')
        bytes = bytes + result.charsTotal
    }
    if (checkScreenRam) {
        console.log('adding screenRam')
        bytes = bytes + result.charsTotal
    }
    result.bytes = bytes
    return result

}


export { calcOptimization };