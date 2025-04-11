"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicContent = void 0;
exports.useDynamicContent = useDynamicContent;
const react_1 = __importDefault(require("react"));
const lodash_1 = require("lodash");
const componentModel_1 = require("./componentModel");
const utils_1 = require("./utils");
function useDynamicContent(params) {
    var _a;
    const struct = {
        props: {
            id: useDynamicContent.name,
            children: undefined,
            _baseProps: [],
            _staticChildrenModels: [],
            _childrenFromJSX: false,
            _forceUpdate: false
        },
        methods: {
            forceUpdate: (children) => {
                model._forceUpdate = true;
                try {
                    model.children = undefined;
                    model.destroyModels();
                    model._childrenFromJSX = false;
                    model.children = children;
                }
                finally {
                    model._forceUpdate = false;
                }
            },
            getModels: () => {
                var _a;
                let res = [];
                if ((_a = model._baseProps) === null || _a === void 0 ? void 0 : _a.length) {
                    const childrenNames = model.getChildrenNames();
                    res = childrenNames.map(name => model[name]);
                }
                return res;
            },
            getChildrenNames: () => {
                return Reflect.ownKeys(model).filter(c => (0, lodash_1.isString)(c) && !model._baseProps.find(p => p === c));
            },
            destroyModels: () => {
                var _a;
                const childrenNames = model.getChildrenNames();
                const didDestroy = !!(childrenNames.length || ((_a = model._staticChildrenModels) === null || _a === void 0 ? void 0 : _a.length));
                childrenNames.forEach(name => model[componentModel_1.$].__deleteMember(name));
                model._staticChildrenModels = undefined;
                didDestroy && (0, componentModel_1.componentModelDebug)(`DynamicContent: clear cache in model=#${model.birthMark()} path=${model.htmlId()}`);
            },
        },
        events: {
            onChangeChildren: () => !model._forceUpdate && !model.calledFromJSX() && !model._childrenFromJSX && model.destroyModels(),
        },
        View: (props) => {
            if (model._childrenFromJSX !== !!(props === null || props === void 0 ? void 0 : props.children)) {
                model.destroyModels();
            }
            model._childrenFromJSX = !!(props === null || props === void 0 ? void 0 : props.children);
            react_1.default.useEffect(() => {
                trap.updateCache(model);
                model._staticChildrenModels = trap.models;
            });
            const trap = (0, componentModel_1.newComponentModelTrapRegistry)(model._staticChildrenModels);
            return (react_1.default.createElement(componentModel_1.ComponentModelTrap.Provider, { value: trap }, (0, utils_1.renderNode)(model._childrenFromJSX ? props.children : model.children)));
        }
    };
    const model = (0, componentModel_1.useComponent)(struct, params);
    if (!((_a = model._baseProps) === null || _a === void 0 ? void 0 : _a.length)) {
        model._baseProps = Reflect.ownKeys(model).filter(x => (0, lodash_1.isString)(x));
    }
    return model;
}
const DynamicContent = (0, componentModel_1.getFC)(useDynamicContent);
exports.DynamicContent = DynamicContent;
