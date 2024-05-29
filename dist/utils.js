"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSimpleNode = exports.renderNode = exports.IF = void 0;
const React = require("react");
const lodash_1 = require("lodash");
function IF(props) {
    return props.condition ? React.createElement(React.Fragment, null, renderNode(props.children)) : null;
}
exports.IF = IF;
function renderNode(node) {
    return (0, lodash_1.isFunction)(node) ? node() : node;
}
exports.renderNode = renderNode;
function isSimpleNode(node) {
    return (0, lodash_1.isString)(node) || (0, lodash_1.isNumber)(node) || (0, lodash_1.isBoolean)(node) || null || undefined;
}
exports.isSimpleNode = isSimpleNode;
