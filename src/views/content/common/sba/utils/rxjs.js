
import {Observable} from 'rxjs';


Observable.prototype.doOnSubscribe = function (onSubscribe) {
    let source = this;
    return Observable.defer(() => {
        onSubscribe();
        return source;
    });
};

Observable.prototype.doFirst = function (doFirst) {
    let source = this;
    let triggered = false;
    return Observable.defer(() => {
        triggered = false;
        return source;
    }).do(n => {
        if (!triggered) {
            triggered = true;
            doFirst(n);
        }
    });
};

Observable.prototype.listen = function (callbackFn) {
    let handle = null;
    return this.doOnSubscribe(() => handle = setTimeout(() => callbackFn('executing'), 150))
        .do({
            complete: () => {
                handle && clearTimeout(handle);
                callbackFn('completed');
            },
            error: (error) => {
                console.warn('Operation failed:', error);
                handle && clearTimeout(handle);
                callbackFn('failed');
            }
        });
};

export {
    Observable
};
