"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.$ = exports.getFC = exports.componentModelDebug = exports.bindProp = exports.bind = exports.blankView = exports.mergeStruct = exports.useComponent = exports.newComponentModelTrapRegistry = exports.useComponentModelTrap = exports.ComponentModelTrap = void 0;
const React = require("react");
const react_1 = require("react");
const lodash_1 = require("lodash");
const mobx_1 = require("mobx");
const mobx_react_1 = require("mobx-react");
const messageBus_1 = require("./messageBus");
const $name = "$";
const $ = Symbol($name);
exports.$ = $;
const blankView = () => null;
exports.blankView = blankView;
function newComponent(struct, params) {
    const fullStruct = mergeStruct(struct, {}, () => model);
    const propBindings = [];
    if (params) {
        for (const p in fullStruct.props) {
            if (Reflect.has(params, p)) {
                if (isBinding(fullStruct.props[p])) {
                    propBindings.push(p);
                }
                else {
                    fullStruct.props[p] = params[p];
                }
            }
        }
    }
    const model = createProxy(fullStruct);
    model[$].__messages = struct.messages;
    model[$].__propBindings = propBindings;
    model[$].__initialize = _initialize;
    model[$].__unmount = _unmount;
    model[$].__updateInitializedModelProperties = _updateInitializedModelProperties;
    model.disableOnChange();
    for (const p in params) {
        if (!Reflect.has(fullStruct.props, p) && (["init", "mount", "unmount"].indexOf(p) == -1)) {
            if (typeof model[p] === "function" && typeof params[p] === "function") {
                const fn = model[p];
                const paramVal = params[p];
                if (p.startsWith("onChanging") && p !== "onChanging") {
                    model[p] = (newValue, oldValue) => paramVal(fn(newValue, oldValue), oldValue);
                }
                else if (p.startsWith("onChange") && p !== "onChange") {
                    model[p] = (value) => { fn(value); paramVal(value); };
                }
                else if (p === "onPropChanging") {
                    model[p] = (prop, newValue, oldValue) => paramVal(prop, fn(prop, newValue, oldValue), oldValue);
                }
                else if (p === "onPropChange") {
                    model[p] = (prop, value) => { fn(prop, value); paramVal(prop, value); };
                }
                else {
                    model[p] = params[p];
                }
            }
            else {
                model[p] = params[p];
            }
        }
    }
    if (params === null || params === void 0 ? void 0 : params.init) {
        const mainInit = fullStruct.init;
        fullStruct.init = () => {
            params.init(model);
            mainInit === null || mainInit === void 0 ? void 0 : mainInit(model);
        };
    }
    if (params === null || params === void 0 ? void 0 : params.mount) {
        const mainMount = fullStruct.mount;
        fullStruct.mount = () => {
            mainMount === null || mainMount === void 0 ? void 0 : mainMount(model);
            params.mount(model);
        };
    }
    if (params === null || params === void 0 ? void 0 : params.unmount) {
        const mainUnmount = fullStruct.unmount;
        fullStruct.unmount = () => {
            mainUnmount === null || mainUnmount === void 0 ? void 0 : mainUnmount(model);
            params.unmount(model);
        };
    }
    model.enableOnChange();
    model[$].View = (props) => {
        var _a, _b;
        (0, react_1.useEffect)(_remount, []);
        if ((_a = props === null || props === void 0 ? void 0 : props.render) !== null && _a !== void 0 ? _a : true) {
            return (_b = fullStruct.View) === null || _b === void 0 ? void 0 : _b.call(fullStruct, props);
        }
        else {
            return null;
        }
    };
    model[$].BaseView = fullStruct.BaseView;
    model[$].init = fullStruct.init;
    model[$].mount = fullStruct.mount;
    model[$].unmount = fullStruct.unmount;
    model[$].__mounted = false;
    model[$].firstTimeRendering = true;
    componentModelDebug(`create model=#${model.birthMark()} path=${model.htmlId()}`);
    return model;
    function _initializeBindings() {
        if (model[$].__autoRunDisposers) {
            _disposeAutoruns();
        }
        else {
            model[$].__autoRunDisposers = [];
        }
        for (const p in params) {
            if (isBinding(params[p])) {
                model[$].__autoRunDisposers.push((0, mobx_1.autorun)(() => {
                    try {
                        model[p] = params[p][0]();
                    }
                    catch (e) {
                        model[p] = undefined;
                        componentModelDebug(e.message);
                    }
                }));
            }
        }
        for (const p of model[$].__propBindings) {
            if (isBinding(params[p])) {
                if (isReadWriteBinding(params[p])) {
                    model[$].__autoRunDisposers.push((0, mobx_1.autorun)(() => { params[p][1](model[p]); }));
                }
            }
            else {
                model[p] = params[p];
            }
        }
    }
    function _disposeAutoruns() {
        if (model[$].__autoRunDisposers) {
            model[$].__autoRunDisposers.map((d) => d());
            model[$].__autoRunDisposers = [];
        }
    }
    function _updateInitializedModelProperties(params) {
        for (const p in params) {
            if (Reflect.has(model, p)) {
                if (!isBinding(params[p]) && typeof model[p] !== "function") {
                    model[p] = params[p];
                }
            }
        }
    }
    function _initialize() {
        var _a, _b, _c, _d;
        if (!model[$].firstTimeRendering)
            return;
        componentModelDebug(`init model=#${model.birthMark()} path=${model.htmlId()}`);
        _initializeBindings();
        (_b = (_a = model[$]).init) === null || _b === void 0 ? void 0 : _b.call(_a, model);
        componentModelDebug(`mount model=#${model.birthMark()} path=${model.htmlId()}`);
        model[$].__mounted = true;
        (_d = (_c = model[$]).mount) === null || _d === void 0 ? void 0 : _d.call(_c, model);
        model[$].firstTimeRendering = false;
    }
    function _unmount() {
        var _a, _b;
        if (!model[$].__mounted)
            return;
        componentModelDebug(`unmount model=#${model.birthMark()} path=${model.htmlId()}`);
        model[$].__mounted = false;
        _disposeAutoruns();
        (_b = (_a = model[$]).unmount) === null || _b === void 0 ? void 0 : _b.call(_a, model);
    }
    function _remount() {
        var _a, _b;
        if (!model[$].firstTimeRendering && !model[$].__mounted) {
            _updateInitializedModelProperties(params);
            componentModelDebug(`remount model=#${model.birthMark()} path=${model.htmlId()}`);
            _initializeBindings();
            (_b = (_a = model[$]).mount) === null || _b === void 0 ? void 0 : _b.call(_a, model);
            model[$].__mounted = true;
            return _unmount;
        }
    }
}
function useComponent(struct, params) {
    if (params) {
        let calledFormJSX = !Object.isExtensible(params);
        if (calledFormJSX) {
            params = Object.assign({}, params);
        }
        for (const p in struct.props) {
            if (Reflect.has(params, p)) {
                if (typeof params[p] === "function") {
                    const fn = params[p];
                    params[p] = bind(fn, undefined);
                }
            }
        }
    }
    const model = useComponentModel(() => newComponent(struct, params), params);
    return model;
}
exports.useComponent = useComponent;
function useComponentModel(modelConstructor, params) {
    const ownerScopeContext = useComponentModelTrap();
    const paramOwner = params === null || params === void 0 ? void 0 : params.owner;
    const paramOwnerChildModel = paramOwner && params.id && paramOwner[params.id];
    let isNewModel = false;
    const [modelR, setModelR] = (0, react_1.useState)(() => {
        if (paramOwnerChildModel)
            return paramOwnerChildModel;
        if (!paramOwner && (ownerScopeContext === null || ownerScopeContext === void 0 ? void 0 : ownerScopeContext.cached)) {
            const ch = ownerScopeContext === null || ownerScopeContext === void 0 ? void 0 : ownerScopeContext.nextCachedModel();
            if (ch)
                return ch;
        }
        const m = _createModel(paramOwner);
        if (!paramOwner && ownerScopeContext) {
            ownerScopeContext.cacheModel(m);
        }
        isNewModel = true;
        return m;
    });
    let model = modelR;
    if (!isNewModel && paramOwner && !paramOwnerChildModel) {
        const newModel = _createModel(paramOwner);
        isNewModel = true;
        setModelR(newModel);
        componentModelDebug(`reset owned newModel=#${newModel.birthMark()} oldModel=#${model.birthMark()} path=${newModel.fullId()}`);
        model = newModel;
    }
    else if (!model[$].firstTimeRendering && !isNewModel && ownerScopeContext && !ownerScopeContext.cached) {
        const newModel = _createModel(undefined);
        isNewModel = true;
        setModelR(newModel);
        ownerScopeContext.cacheModel(newModel);
        componentModelDebug(`reset newModel=#${newModel.birthMark()} oldModel=#${model.birthMark()} path=${newModel.fullId()}`);
        model = newModel;
    }
    else if (isNewModel) {
        componentModelDebug(`set${paramOwner ? " owned" : ""} model=#${model.birthMark()} path=${model.htmlId()}`);
    }
    model[$].bus = (0, messageBus_1.useMessaging)(model[$].__messages);
    (0, react_1.useEffect)(() => {
        if (model[$].firstTimeRendering) {
            model[$].__initialize();
            return () => model[$].__unmount();
        }
    }, [modelR]);
    if (!model[$].firstTimeRendering) {
        componentModelDebug(`update props model=#${model.birthMark()} path=${model.htmlId()}`);
        model[$].__updateInitializedModelProperties(params);
    }
    return model;
    function _createModel(owner) {
        let newModel;
        if ((0, lodash_1.isFunction)(modelConstructor)) {
            newModel = modelConstructor();
        }
        else {
            newModel = modelConstructor;
        }
        if (owner) {
            if (isComponentModel(owner)) {
                newModel[$].__owner = owner;
            }
            if (params.id) {
                owner[params.id] = newModel;
            }
        }
        else {
            if (!newModel.fullId()) {
                componentModelDebug("Warning: Specify a default id in the struct of the component model hook");
            }
        }
        return newModel;
    }
}
function mergeStruct(struct, extStruct, model) {
    var _a;
    if (!extStruct) {
        extStruct = {};
    }
    const mergedStruct = {
        props: Object.assign(Object.assign({}, struct.props), extStruct.props),
        children: Object.assign(Object.assign({}, struct.children), extStruct.children),
        methods: Object.assign(Object.assign({}, struct.methods), extStruct.methods),
        events: Object.assign(Object.assign({}, struct.events), extStruct.events),
        messages: Object.assign(Object.assign({}, struct.messages), extStruct.messages),
        View: (extStruct.View && extStruct.View !== blankView) ? extStruct.View : struct.View ? struct.View : blankView,
        BaseView: (_a = struct.View) !== null && _a !== void 0 ? _a : blankView
    };
    if (extStruct === null || extStruct === void 0 ? void 0 : extStruct.init) {
        mergedStruct.init = () => {
            var _a;
            (_a = struct.init) === null || _a === void 0 ? void 0 : _a.call(struct, model());
            extStruct.init(model());
        };
    }
    else {
        mergedStruct.init = struct.init;
    }
    if (extStruct === null || extStruct === void 0 ? void 0 : extStruct.mount) {
        mergedStruct.mount = () => {
            var _a;
            extStruct.mount(model());
            (_a = struct.mount) === null || _a === void 0 ? void 0 : _a.call(struct, model());
        };
    }
    else {
        mergedStruct.mount = struct.mount;
    }
    if (extStruct === null || extStruct === void 0 ? void 0 : extStruct.unmount) {
        mergedStruct.unmount = () => {
            var _a;
            extStruct.unmount(model());
            (_a = struct.unmount) === null || _a === void 0 ? void 0 : _a.call(struct, model());
        };
    }
    else {
        mergedStruct.unmount = struct.unmount;
    }
    for (const p in mergedStruct.props) {
        if (typeof mergedStruct.props[p] === "function") {
            const fn = mergedStruct.props[p];
            mergedStruct.props[p] = bind(fn, undefined);
        }
    }
    const invalidProps = (0, lodash_1.intersection)(Object.keys(mergedStruct.props), Object.keys(mergedStruct.children));
    invalidProps.concat((0, lodash_1.intersection)(Object.keys(mergedStruct.props), Object.keys(mergedStruct.methods)));
    invalidProps.concat((0, lodash_1.intersection)(Object.keys(mergedStruct.props), Object.keys(mergedStruct.events)));
    invalidProps.concat((0, lodash_1.intersection)(Object.keys(mergedStruct.children), Object.keys(mergedStruct.methods)));
    invalidProps.concat((0, lodash_1.intersection)(Object.keys(mergedStruct.children), Object.keys(mergedStruct.events)));
    invalidProps.concat((0, lodash_1.intersection)(Object.keys(mergedStruct.methods), Object.keys(mergedStruct.events)));
    if (invalidProps.length > 0) {
        throw new Error(`The component structure contains not unique members: ${invalidProps}`);
    }
    return mergedStruct;
}
exports.mergeStruct = mergeStruct;
function createProxy(struct) {
    const mobxState = {};
    let disableOnChangeCount = 0;
    const changeDisabled = () => disableOnChangeCount > 0;
    const settersInProgress = [];
    const propHandler = {
        get: (target, prop) => {
            if ((0, lodash_1.isSymbol)(prop) && prop === $ || prop === $name) {
                return target[$name];
            }
            if (Reflect.has(target[$name], prop)) {
                return prepareReturnValue(target[$name], prop);
            }
            if (Reflect.has(mobxState, prop)) {
                if (_isView(target[prop])) {
                    throw Error("Observable View is not allowed");
                }
                let newVal = mobxState[prop].value;
                let oldVal = mobxState[prop].value;
                if (isBinding(target[prop])) {
                    try {
                        newVal = target[prop][0]();
                    }
                    catch (e) {
                        newVal = undefined;
                        componentModelDebug(e.message);
                    }
                }
                else {
                    const onGetProp = proxy[`onGet${capitalizeFirstLetter(prop)}`];
                    if (onGetProp) {
                        newVal = onGetProp();
                    }
                }
                if (!_isEqual(newVal, oldVal)) {
                    _assignObservableProperty(prop, newVal);
                    if (!changeDisabled()) {
                        if (!settersInProgress.find(x => x === prop)) {
                            proxy.onPropChange && proxy.onPropChange(prop);
                            const onChangeProp = proxy[`onChange${capitalizeFirstLetter(prop)}`];
                            onChangeProp && onChangeProp(newVal);
                        }
                    }
                }
                return mobxState[prop].value;
            }
            return prepareReturnValue(target, prop);
        },
        set: (target, prop, value) => {
            if ((0, lodash_1.isSymbol)(prop) && prop === $ || prop === $name) {
                return false;
            }
            if (Reflect.has(target[$name], prop)) {
                return false;
            }
            if (isBinding(value)) {
                target[prop] = value;
                mobxState[prop] = { value: undefined };
                return true;
            }
            let oldValue = target[prop];
            if (Reflect.has(mobxState, prop)) {
                oldValue = mobxState[prop].value;
            }
            if (_isEqual(value, oldValue)) {
                return true;
            }
            settersInProgress.push(prop);
            try {
                if (!changeDisabled()) {
                    if (proxy.onPropChanging) {
                        const res = proxy.onPropChanging(prop, value, oldValue);
                        if (_isEqual(res, oldValue)) {
                            return true;
                        }
                        value = res;
                    }
                    const onChangingProp = proxy[`onChanging${capitalizeFirstLetter(prop)}`];
                    if (onChangingProp) {
                        const res = onChangingProp(value, oldValue);
                        if (_isEqual(res, oldValue)) {
                            return true;
                        }
                        value = res;
                    }
                }
                if (Reflect.has(mobxState, prop)) {
                    if (_isView(target[prop])) {
                        throw Error("Observable View is not allowed");
                    }
                    if (isReadWriteBinding(target[prop])) {
                        target[prop][1](value);
                    }
                    if (!isReadBinding(target[prop])) {
                        _assignObservableProperty(prop, value);
                    }
                }
                else {
                    target[prop] = value;
                }
                if (!changeDisabled()) {
                    proxy.onPropChange && proxy.onPropChange(prop);
                    const onChangeProp = proxy[`onChange${capitalizeFirstLetter(prop)}`];
                    onChangeProp && onChangeProp(value);
                }
            }
            finally {
                settersInProgress.pop();
            }
            return true;
        }
    };
    disableOnChangeCount++;
    const target = _createProxyTarget(struct);
    const proxy = new Proxy(target, propHandler);
    const privateMembers = target[$name];
    privateMembers.__deleteMember = (name) => {
        let deleted = false;
        if (Reflect.has(target, name)) {
            delete target[name];
            deleted = true;
        }
        if (Reflect.has(mobxState, name)) {
            delete mobxState[name];
            deleted = true;
        }
        return deleted;
    };
    privateMembers.disableOnChange = () => disableOnChangeCount++;
    privateMembers.enableOnChange = () => {
        if (disableOnChangeCount === 0) {
            throw new Error("enableOnChange() requires disableOnChange() pair");
        }
        --disableOnChangeCount;
    };
    privateMembers.changeNotifyDisabled = changeDisabled;
    const birthMark = Math.round(Math.random() * 1000000).toString();
    privateMembers.birthMark = () => birthMark;
    privateMembers.fullId = () => {
        var _a;
        let s = "";
        if (privateMembers.__owner) {
            s = privateMembers.__owner.fullId() + ".";
        }
        return s + ((_a = proxy.id) !== null && _a !== void 0 ? _a : "<empty>");
    };
    privateMembers.htmlId = () => {
        const id = privateMembers.fullId();
        return (id === "<empty>") ? undefined : window.componentModelHashHtmlId ? _getHashCode(id) : id;
    };
    privateMembers.calledFromJSX = () => !!privateMembers.__calledFromJSX;
    for (const p in struct.children) {
        proxy[p][$].__owner = proxy;
    }
    disableOnChangeCount--;
    return proxy;
    function _createProxyTarget(struct) {
        let targetExt = Object.assign(Object.assign(Object.assign(Object.assign({}, struct.props), struct.children), struct.events), struct.methods);
        for (const p in struct.children) {
            targetExt[p].disableOnChange();
            targetExt[p].id = p;
            targetExt[p].enableOnChange();
        }
        for (const p in struct.props) {
            let propVal = struct.props[p];
            if (isBinding(propVal)) {
                mobxState[p] = { value: undefined };
            }
            else {
                mobxState[p] = undefined;
                _assignObservableProperty(p, propVal);
                targetExt[p] = undefined;
            }
        }
        targetExt[$name] = {
            __owner: undefined,
            __deleteMember: undefined,
            __calledFromJSX: undefined,
            __messages: undefined,
            __propBindings: undefined,
            __mounted: undefined,
            __initialize: undefined,
            __unmount: undefined,
            __updateInitializedModelProperties: undefined,
            __autoRunDisposers: undefined,
            bus: undefined,
            View: undefined,
            BaseView: undefined,
            firstTimeRendering: undefined,
            disableOnChange: undefined,
            enableOnChange: undefined,
            changeNotifyDisabled: undefined,
            fullId: undefined,
            htmlId: undefined,
            birthMark: undefined,
            calledFromJSX: undefined,
            init: undefined,
            mount: undefined,
            unmount: undefined
        };
        return targetExt;
    }
    function _isView(value) {
        return value &&
            typeof value === "object" && Object.keys(value).length === 1 && typeof value.__viewObserver === "function";
    }
    function prepareReturnValue(obj, prop) {
        if (_isView(obj[prop])) {
            return obj[prop].__viewObserver;
        }
        if (typeof obj[prop] === "function" && prop.endsWith("View")) {
            const Obs = (0, mobx_react_1.observer)(obj[prop]);
            obj[prop] = {
                __viewObserver: (props => React.createElement(Obs, Object.assign({}, props, { key: proxy.birthMark() })))
            };
            return obj[prop].__viewObserver;
        }
        return obj[prop];
    }
    function _getHashCode(s) {
        const charCodes = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
        let result = "";
        const hash = [...s].reduce((hash, c) => (Math.imul(31, hash) + c.charCodeAt(0)) | 0, 0);
        for (let i = 0; i < 32; i += 6) {
            result += charCodes.charAt((hash >>> i) & 0x3F);
        }
        return result;
    }
    function _isReactElement(value) {
        return (0, lodash_1.isSymbol)(value === null || value === void 0 ? void 0 : value.$$typeof) && value.$$typeof.description === "react.element";
    }
    function _isEqual(value, other) {
        if (_isReactElement(value) || _isReactElement(other)) {
            return value === other;
        }
        else {
            return (0, lodash_1.isEqual)(value, other);
        }
    }
    function _assignObservableProperty(prop, value) {
        (0, mobx_1.runInAction)(() => {
            const initialization = !mobxState[prop];
            if (isComponentModel(value) && !(0, mobx_1.isObservable)(value)) {
                if (initialization) {
                    mobxState[prop] = { value: undefined };
                    mobx_1.observable.ref(mobxState[prop], "value");
                }
                mobxState[prop].value = value;
            }
            else {
                if ((0, lodash_1.isArray)(value)) {
                    if (initialization) {
                        mobxState[prop] = (0, mobx_1.observable)({ value: undefined });
                    }
                    mobxState[prop].value = mobx_1.observable.array(value, { deep: false });
                }
                else {
                    const isView = prop.endsWith("View") || prop === "children";
                    if (isView || _isReactElement(value)) {
                        if (!isView && !initialization && !_isReactElement(mobxState[prop].value) && (0, mobx_1.isObservable)(mobxState[prop])) {
                            componentModelDebug("Warning! A react element replaces a value. There may be issues with rendering.\r\n" +
                                `Option #1(recommended): Rename property "${prop}" to "${prop}View".\r\n` +
                                `Option #2: Initialize property "${prop}" with some JSX`);
                        }
                        if (initialization) {
                            mobxState[prop] = { value: undefined };
                            mobx_1.observable.ref(mobxState[prop], "value");
                        }
                        mobxState[prop].value = value;
                    }
                    else {
                        if (initialization) {
                            mobxState[prop] = (0, mobx_1.observable)({ value: undefined });
                        }
                        mobxState[prop].value = value;
                    }
                }
            }
        });
    }
}
function isComponentModel(obj) {
    return obj && typeof obj === "object" && Reflect.has(obj, $name);
}
function isBinding(value) {
    return value && typeof value === "object" && Object.keys(value).length === 2
        && typeof value[0] === "function" && (typeof value[1] === "function" || typeof value[1] === "undefined");
}
function isReadBinding(value) {
    return isBinding(value) && typeof value[1] === "undefined";
}
function isReadWriteBinding(value) {
    return isBinding(value) && typeof value[1] === "function";
}
function capitalizeFirstLetter(name) {
    return name.replace(/^./, name[0].toUpperCase());
}
function bind(get, set) {
    const bond = [get, set];
    return bond;
}
exports.bind = bind;
function bindProp(obj, prop) {
    const bond = bind(() => {
        let o;
        try {
            o = obj();
        }
        catch (e) {
            componentModelDebug(e.message);
        }
        if (!o) {
            componentModelDebug(`Attempt to get bound property "${prop.toString()}" of undefined`);
        }
        return o ? o[prop] : undefined;
    }, (value) => {
        let o;
        try {
            o = obj();
        }
        catch (e) {
            componentModelDebug(e);
        }
        if (o) {
            o[prop] = value;
        }
        else {
            componentModelDebug(`Attempt to set bound property "${prop.toString()}" of undefined`);
        }
    });
    return bond;
}
exports.bindProp = bindProp;
function newComponentModelTrapRegistry(cache) {
    const trap = {
        _hookCallsCount: -1,
        _newModels: [],
        models: cache !== null && cache !== void 0 ? cache : [],
        cached: !!cache,
        cacheModel: (model) => trap._newModels.push(model),
        nextCachedModel: () => {
            if (trap.cached) {
                if (trap._hookCallsCount === trap.models.length - 1) {
                    componentModelDebug("ComponentModelTrap cache pointer reached the top");
                    return;
                }
                trap._hookCallsCount++;
                return trap.models[trap._hookCallsCount];
            }
            componentModelDebug("Attempt to read uncached ComponentModelTrap");
        },
        updateCache: (model) => {
            if (!trap._newModels.length)
                return;
            let cnt = 0;
            trap._newModels.forEach((x) => {
                if (x.id && (!x[$].__owner || x[$].__owner === model)) {
                    if (!x[$].__owner) {
                        x[$].__owner = model;
                    }
                    if (model[x.id]) {
                        componentModelDebug(`The child "${x.id}" already exists in model=#${model.birthMark()} path=${model.htmlId()}. This model won't be available by name.`);
                    }
                    else {
                        model[x.id] = x;
                        cnt++;
                    }
                }
            });
            cnt && componentModelDebug(`link ${cnt} children by name to model=#${model.birthMark()} path=${model.htmlId()}`);
            if (trap._newModels.length) {
                trap.models = [...trap.models, ...trap._newModels];
                componentModelDebug(`cache new ${trap._newModels.length} children models in model=#${model.birthMark()} path=${model.htmlId()}`);
                trap._newModels = [];
            }
        }
    };
    return trap;
}
exports.newComponentModelTrapRegistry = newComponentModelTrapRegistry;
const ComponentModelTrap = (0, react_1.createContext)(undefined);
exports.ComponentModelTrap = ComponentModelTrap;
function useComponentModelTrap() {
    return (0, react_1.useContext)(ComponentModelTrap);
}
exports.useComponentModelTrap = useComponentModelTrap;
function getFC(modelHook) {
    return (params) => {
        const hookName = modelHook.name;
        if (!(params === null || params === void 0 ? void 0 : params.id)) {
            params = Object.assign(Object.assign({}, params), { id: hookName.startsWith("use") ? hookName.substring(3) : hookName });
        }
        const model = modelHook(params);
        model[$].__calledFromJSX = true;
        return model.View();
    };
}
exports.getFC = getFC;
window.componentModelDebug = false;
window.componentModelHashHtmlId = false;
function componentModelDebug(text) {
    window.componentModelDebug && console.debug(text);
}
exports.componentModelDebug = componentModelDebug;
