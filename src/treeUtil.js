function transformToArrayFormat(treeObj, childKey){
    childKey = childKey || 'children';
    if (!treeObj) return [];
    let  r = [];
    if (Object.prototype.toString.apply(treeObj) === '[object Array]') {
        for (let i=0, l=treeObj.length; i<l; i++) {
            r.push(treeObj[i]);
            if (treeObj[i][childKey])
                r = r.concat(transformToArrayFormat(treeObj[i][childKey]));
        }
    } else {
        r.push(treeObj);
        if (treeObj[childKey])
            r = r.concat(transformToArrayFormat(treeObj[childKey]));
    }
    return r;
}

function transformToTreeFormat(array, config){
    config = Object.assign({}, config);
    let i,l,
        key = config.key || 'id',
        parentKey = config.parentId || 'parentId',
        childKey = config.childKey || 'children';

    if (array instanceof Array) {
        let r = [];
        let tmpMap = {};
        for (i=0, l=array.length; i<l; i++) {
            if (array[i]) {
                tmpMap[array[i][key]] = array[i];
            }
        }
        for (i=0, l=array.length; i<l; i++) {
            if (array[i] && tmpMap[array[i][parentKey]] && array[i][key] !== array[i][parentKey]) {
                if (!tmpMap[array[i][parentKey]][childKey])
                    tmpMap[array[i][parentKey]][childKey] = [];
                tmpMap[array[i][parentKey]][childKey].push(array[i]);
            } else {
                r.push(array[i]);
            }
        }
        return r;
    } else {
        return [array];
    }
}

export default {transformToArrayFormat, transformToTreeFormat};