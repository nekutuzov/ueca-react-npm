type AnyName = string;
type InParam = {
    in: any;
};
type OutParam = {
    out: any;
};
type AnyMessage = Record<string, InParam | OutParam | InParam & OutParam | {}>;
type ParamIn<TMsg extends AnyMessage, Msg extends keyof TMsg> = TMsg[Msg] extends InParam ? TMsg[Msg][keyof InParam] : undefined;
type ParamOut<TMsg extends AnyMessage, Msg extends keyof TMsg> = TMsg[Msg] extends OutParam ? TMsg[Msg][keyof OutParam] : undefined;
type GetMethod<TMsg extends AnyMessage> = <Msg extends keyof TMsg>(message: Msg, param: ParamIn<TMsg, Msg>, callback: (param: ParamOut<TMsg, Msg>) => void) => void;
type PostMethod<TMsg extends AnyMessage> = <Msg extends keyof TMsg>(message: Msg, param: ParamIn<TMsg, Msg>, callback?: (param: ParamOut<TMsg, Msg>) => void) => void;
type AsyncMethod<TMsg extends AnyMessage> = <Msg extends keyof TMsg>(message: Msg, param: ParamIn<TMsg, Msg>) => Promise<ParamOut<TMsg, Msg>>;
type TargetGetMethod<TMsg extends AnyMessage, TName extends AnyName> = <Msg extends keyof TMsg>(target: TName, message: Msg, param: ParamIn<TMsg, Msg>, callback: (param: ParamOut<TMsg, Msg>) => void) => void;
type TargetPostMethod<TMsg extends AnyMessage, TName extends AnyName> = <Msg extends keyof TMsg>(target: TName, message: Msg, param: ParamIn<TMsg, Msg>, callback?: (param: ParamOut<TMsg, Msg>) => void) => void;
type TargetAsyncMethod<TMsg extends AnyMessage, TName extends AnyName> = <Msg extends keyof TMsg>(target: TName, message: Msg, param: ParamIn<TMsg, Msg>) => Promise<ParamOut<TMsg, Msg>>;
interface IMessageBus<TMsg extends AnyMessage, TName extends AnyName> {
    readonly name?: TName;
    readonly get: GetMethod<TMsg>;
    readonly post: PostMethod<TMsg>;
    readonly getFrom: TargetGetMethod<TMsg, TName>;
    readonly postTo: TargetPostMethod<TMsg, TName>;
    readonly getAsync: AsyncMethod<TMsg>;
    readonly postAsync: AsyncMethod<TMsg>;
    readonly getFromAsync: TargetAsyncMethod<TMsg, TName>;
    readonly postToAsync: TargetAsyncMethod<TMsg, TName>;
    as<M extends AnyMessage, N extends AnyName = TName>(): IMessageBus<M, N>;
}
type MessageHandler<TMsg extends AnyMessage, Msg extends keyof TMsg> = (param: ParamIn<TMsg, Msg>) => ParamOut<TMsg, Msg> extends undefined ? Promise<void> : Promise<ParamOut<TMsg, Msg>>;
type MessageHandlerNoPar<TMsg extends AnyMessage, Msg extends keyof TMsg> = () => ParamOut<TMsg, Msg> extends undefined ? Promise<void> : Promise<ParamOut<TMsg, Msg>>;
type Messages<TMsg extends AnyMessage> = {
    [Msg in keyof TMsg]?: ParamIn<TMsg, Msg> extends undefined ? MessageHandlerNoPar<TMsg, Msg> : MessageHandler<TMsg, Msg>;
};
declare function useMessaging<TMsg extends AnyMessage, TName extends AnyName>(incoming?: Messages<TMsg>, name?: TName): IMessageBus<TMsg, TName>;
declare function useCustomMessaging<TMsg extends AnyMessage, TName extends AnyName>(bus: IMessageBus<TMsg, TName>, incoming?: Messages<TMsg>, name?: TName): IMessageBus<TMsg, TName>;
declare function createMessageBus<TMsg extends AnyMessage, TName extends AnyName>(name?: string): IMessageBus<TMsg, TName>;
declare const messageBusEventPost = "messagebus.post";
type MessageBusEvent = Event & {
    detail: {
        message: string;
        params?: any;
    };
};
declare const Messaging: import("react").Context<IMessageBus<AnyMessage, any>>;
declare function defaultMessageBus<TMsg extends AnyMessage>(): IMessageBus<TMsg, any>;
export { IMessageBus, Messages, AsyncMethod, AnyMessage, MessageBusEvent, AnyName, Messaging, messageBusEventPost, useMessaging, useCustomMessaging, createMessageBus, defaultMessageBus };
