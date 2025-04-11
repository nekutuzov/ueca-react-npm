"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageBusEventPost = exports.Messaging = void 0;
exports.useMessaging = useMessaging;
exports.useCustomMessaging = useCustomMessaging;
exports.createMessageBus = createMessageBus;
exports.defaultMessageBus = defaultMessageBus;
const react_1 = require("react");
function useMessaging(incoming, name) {
    return useCustomMessaging((0, react_1.useContext)(Messaging), incoming, name);
}
function useCustomMessaging(bus, incoming, name) {
    (0, react_1.useEffect)(() => {
        if (incoming) {
            const messageRecepient = {
                id: generateId(),
                name: name,
                messages: incoming
            };
            bus.subscribe(messageRecepient);
            return () => bus.unsubscribe(messageRecepient);
        }
    }, [incoming, bus, name]);
    return bus;
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    }
}
function createMessageBus(name) {
    const bus = {
        name: name,
        subscribers: [],
        messageQueue: [],
        as: () => bus,
        get: (messageType, param, callback) => _queueMessage({ message: messageType, param: param, callback: callback }),
        getFrom: (target, messageType, param, callback) => _queueMessage({ target: target, message: messageType, param: param, callback: callback }),
        post: (messageType, param, callback) => _queueMessage({ message: messageType, param: param, callback: callback }),
        postTo: (target, messageType, param, callback) => _queueMessage({ target: target, message: messageType, param: param, callback: callback }),
        getAsync: (messageType, param) => {
            return new Promise((resolve, reject) => bus.get(messageType, param, result => _promiseCallback(result, messageType, resolve, reject)));
        },
        getFromAsync: (target, messageType, param) => {
            return new Promise((resolve, reject) => bus.getFrom(target, messageType, param, result => _promiseCallback(result, messageType, resolve, reject)));
        },
        postAsync: (messageType, param) => {
            return new Promise((resolve, reject) => bus.post(messageType, param, result => _promiseCallback(result, messageType, resolve, reject)));
        },
        postToAsync: (target, messageType, param) => {
            return new Promise((resolve, reject) => bus.postTo(target, messageType, param, result => _promiseCallback(result, messageType, resolve, reject)));
        }
    };
    bus.subscribe = (recipient) => {
        let subscriber = bus.subscribers.find((s) => s.id === recipient.id);
        subscriber ?
            subscriber.messages = recipient.messages :
            bus.subscribers.push(recipient);
    };
    bus.unsubscribe = (recipient) => {
        bus.subscribers = bus.subscribers.filter((s) => s.id !== recipient.id);
    };
    function isValidResult(result) {
        return !(result && (result instanceof Error));
    }
    bus.processMessages = () => {
        const msgCount = bus.messageQueue.length;
        if (msgCount === 0)
            return;
        bus.messageQueue.forEach(message => {
            let dispatched = false;
            let targetFound = false;
            bus.subscribers.forEach(subscriber => {
                const method = subscriber.messages[message.message];
                targetFound = targetFound || (message.target ? message.target === subscriber.name : false);
                if (method !== undefined && (!message.target || message.target === subscriber.name)) {
                    const methodPromise = method(message.param);
                    if (methodPromise) {
                        methodPromise.catch(reason => { var _a; return (_a = message.callback) === null || _a === void 0 ? void 0 : _a.call(message, reason); });
                        methodPromise.then(methodResult => { var _a; return (_a = message.callback) === null || _a === void 0 ? void 0 : _a.call(message, methodResult); }, reason => { var _a; return (_a = message.callback) === null || _a === void 0 ? void 0 : _a.call(message, reason); });
                    }
                    dispatched = true;
                }
            });
            if (!dispatched) {
                if (!message.target) {
                    console.warn(`MessageBus (${bus.name}): no subscribers for message "${String(message.message)}"`);
                }
                else {
                    (targetFound
                        ? console.warn(`MessageBus (${bus.name}): target "${message.target}" has no subscription for message "${String(message.message)}"`)
                        : console.warn(`MessageBus (${bus.name}): target "${message.target}" not found"`));
                }
                if (message.callback) {
                    message.callback(undefined);
                }
            }
        });
        if (bus.messageQueue.length > msgCount) {
            bus.messageQueue = bus.messageQueue.splice(msgCount);
        }
        else {
            bus.messageQueue = [];
        }
    };
    return bus;
    function _queueMessage(msg) {
        bus.messageQueue.push(msg);
        setTimeout(() => {
            try {
                bus.processMessages();
            }
            catch (e) {
                console.error("Message bus crashed", e);
            }
        }, 0);
    }
    function _promiseCallback(result, messageType, resolve, reject) {
        if (isValidResult(result)) {
            resolve(result);
        }
        else {
            reject(result);
        }
    }
}
;
const messageBusEventPost = "messagebus.post";
exports.messageBusEventPost = messageBusEventPost;
function createDefaultMessageBus() {
    const defaultMessageBus = createMessageBus("Default Message Bus");
    window.addEventListener(messageBusEventPost, _onPost);
    return defaultMessageBus;
    function _onPost(event) {
        defaultMessageBus.post(event.detail.message, event.detail.params);
    }
}
const _defaultMessageBus = createDefaultMessageBus();
const Messaging = (0, react_1.createContext)(_defaultMessageBus);
exports.Messaging = Messaging;
function defaultMessageBus() {
    return _defaultMessageBus;
}
