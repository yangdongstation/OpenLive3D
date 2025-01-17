// Face Point of Interests
// left right top down center

const MARKCOLOR = {
    "head" : "#f00", // red
    "righteye" : "#7ff", // cyan
    "lefteye" : "#7ff", // cyan
    "mouth" : "#ff7", // yellow
    "rightbrow": "#f7f", // purple
    "leftbrow": "#f7f" // purple
};

const FPoI = {
    "head": [127, 356, 10, 152],
    "righteye": [33, 133, 159, 145, 468],
    "lefteye": [362, 263, 386, 374, 473],
    "mouth": [78, 308, 13, 14],
    "rightbrow": [105, 107],
    "leftbrow": [336, 334]
};

function distance3d(p1, p2){
    const horiz = p2[0] - p1[0];
    const vert = p2[1] - p1[1];
    const depth = p2[2] - p1[2];
    return Math.sqrt((horiz * horiz) + (vert * vert) + (depth * depth));
}

function slope(xIdx, yIdx, p1, p2){
  return (p2[yIdx]-p1[yIdx]) / (p2[xIdx]-p1[xIdx]);
}

function getOpenRatio(obj){
    const width = distance3d(obj[0], obj[1]);
    const height = distance3d(obj[2], obj[3]);
    return height / width;
}

function getPosRatio(obj){
    const dleft = distance3d(obj[0], obj[4]);
    const dright = distance3d(obj[1], obj[4]);
    // const dtop = distance3d(obj[2], obj[4]);
    // const ddown = distance3d(obj[3], obj[4]);
    return dleft / (dleft + dright);
}

function getHeadRotation(head){
    const rollSlope = slope(0, 1, head[1], head[0]);
    const roll = Math.atan(rollSlope);
    const yawSlope = slope(0, 2, head[1], head[0]);
    const yaw = Math.atan(yawSlope);
    const pitchSlope = slope(2, 1, head[2], head[3]);
    let pitch = Math.atan(pitchSlope);
    if(pitch > 0){
        pitch -= Math.PI;
    }
    return [roll, pitch + Math.PI / 2, yaw];
}

function getDefaultInfo(){
    return {
        "roll": 0, "pitch": 0, "yaw": 0,
        "lefteyeopen": 0, "righteyeopen": 0,
        "irispos": 0,
        "mouth": 0
    };
}

function getKeyType(key){
    if(["roll", "pitch", "yaw"].includes(key)){
        return "body";
    }else if(["lefteyeopen", "righteyeopen", "irispos"].includes(key)){
        return "eye";
    }else if(["mouth"].includes(key)){
        return "mouth";
    }else{
        return "body";
    }
}

function face2Info(face){
    let keyInfo = {};
    let headRotate = getHeadRotation(face["head"]);
    keyInfo["roll"] = headRotate[0];
    keyInfo["pitch"] = headRotate[1];
    keyInfo["yaw"] = headRotate[2];
    keyInfo["lefteyeopen"] = getOpenRatio(face["lefteye"]);
    keyInfo["righteyeopen"] = getOpenRatio(face["righteye"]);
    keyInfo["irispos"] = getPosRatio(face["lefteye"]) + getPosRatio(face["righteye"]) - 1;
    keyInfo["mouth"] = getOpenRatio(face["mouth"]);
    return keyInfo;
}

// reduce vertices to the desired set, and compress data as well
function packFace(_face){
    let fsm = _face.scaledMesh;
    let ret = {};
    Object.keys(FPoI).forEach(function (key) {
        ret[key] = [];
        for (let i = 0; i < FPoI[key].length; i++){
            ret[key][i] = fsm[FPoI[key][i]];
        }
    });
    return ret;
}