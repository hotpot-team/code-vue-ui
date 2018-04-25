function transformToArrayFormat(menus){
    if (!menus) return [];
    let  r = [];
    if (Object.prototype.toString.apply(menus) === '[object Array]') {
        for (let i=0, l=menus.length; i<l; i++) {
            r.push(menus[i]);
            if (menus[i].children)
                r = r.concat(transformToArrayFormat(menus[i].children));
        }
    } else {
        r.push(menus);
        if (menus.children)
            r = r.concat(transformToArrayFormat(menus.children));
    }
    return r;
}

function transformToTreeFormat(array){
    let i,l,
        key = 'id',
        parentKey = 'parentId',
        childKey = 'children';

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