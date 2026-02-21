import * as React_2 from 'react';

export declare const $: unique symbol;

export declare const $name = "$";

export declare type AnyComponentModel = ComponentModel<AnyComponentStruct>;

export declare type AnyComponentParams = ComponentParams<AnyComponentStruct>;

export declare type AnyComponentStruct = ComponentStruct<ComponentStructBase<BusMessages>>;

export declare function bind<T extends NonNullable<unknown>, P extends keyof T>(obj: () => T, prop: P): Bond<T[P]>;

export declare function bind<T>(get: () => T, set: ((value: T) => void) | undefined): Bond<T>;

/**
 * @deprecated Use the `bind` function instead.
 */
export declare function bindProp<T extends NonNullable<unknown>, P extends keyof T>(obj: () => T, prop: P): Bond<T[P]>;

export declare type Bond<T> = [(() => T) | undefined, ((value: T) => void) | undefined];

export declare type BusMessageHandlers<TMsg extends BusMessages> = {
    [Msg in keyof TMsg]?: ParamIn<TMsg, Msg> extends undefined ? MessageHandlerNoPar<TMsg, Msg> : MessageHandler<TMsg, Msg>;
};

export declare type BusMessages = Record<MessageID, InParam | OutParam | InParam & OutParam> | EmptyObject;

export declare function clone<T>(obj: T): T | undefined;

declare type ComponentChildren<TStruct extends GeneralComponentStruct> = NonNullable<TStruct["children"]>;

declare type ComponentEvents<TStruct extends GeneralComponentStruct> = Partial<NonNullable<TStruct["events"]>>;

declare type ComponentMessages<TStruct extends ComponentStructBase<TMsg>, TMsg extends BusMessages> = NonNullable<TStruct["messages"]>;

declare type ComponentMethods<TStruct extends GeneralComponentStruct> = NonNullable<TStruct["methods"]>;

export declare type ComponentModel<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends BusMessages = BusMessages> = ComponentProps<NonNullable<TStruct["__struct"]>> & Readonly<ComponentChildren<NonNullable<TStruct["__struct"]>>> & Readonly<ComponentMethods<NonNullable<TStruct["__struct"]>>> & ComponentStructEvents<ComponentProps<NonNullable<TStruct["__struct"]>>> & ComponentEvents<NonNullable<TStruct["__struct"]>> & {
    readonly $: ComponentPrivateMembers;
    readonly bus: MessageBus<TMsg>;
    readonly View: ComponentView;
    readonly BaseView: ComponentView;
    readonly disableOnChange: () => void;
    readonly enableOnChange: () => void;
    readonly changeNotifyDisabled: () => boolean;
    readonly fullId: () => string;
    readonly htmlId: () => string | undefined;
    readonly birthMark: () => string;
    readonly clearModelCache: () => void;
    readonly getChildrenModels: GetChildrenModels;
    readonly invalidateView: () => void;
};

export declare type ComponentParams<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends BusMessages = BusMessages> = ComponentProps<TStruct> & ComponentEvents<TStruct> & {
    constr?: (model: ComponentModel<TStruct, TMsg>) => void;
    init?: (model: ComponentModel<TStruct, TMsg>) => void;
    deinit?: (model: ComponentModel<TStruct, TMsg>) => void;
    mount?: (model: ComponentModel<TStruct, TMsg>) => void;
    unmount?: (model: ComponentModel<TStruct, TMsg>) => void;
    draw?: (model: ComponentModel<TStruct, TMsg>) => void;
    erase?: (model: ComponentModel<TStruct, TMsg>) => void;
};

declare type ComponentPrivateMembers = {
    __status: {
        initPhase?: "constructing" | "constructed" | "initializing" | "initialized" | "unmount-deinit" | "deinitializing";
        mountPhase?: "init-mount" | "mounting" | "mounted" | "unmounting";
        cached: boolean;
        initCount: number;
        mountCount: number;
        baseResult: unknown;
    };
    __settersInProgress: string[];
    __owner: AnyComponentModel;
    __struct: AnyComponentStruct;
    __params: AnyComponentParams;
    __assignParams: (params: AnyComponentParams) => void;
    __dynamicChildrenIds: string[];
    __staticChildrenCache: AnyComponentModel[];
    __proxy: AnyComponentModel;
    __initializeModel: (params?: AnyComponentParams) => void;
};

declare type ComponentProps<TStruct extends GeneralComponentStruct> = Partial<NonNullable<TStruct["props"]>>;

export declare type ComponentStruct<TStruct extends GeneralComponentStruct, TMsg extends BusMessages = BusMessages> = PartialGeneralComponentStruct<ComponentStructBase<TMsg>, TMsg> & Omit<TStruct & ComponentStructBase<TMsg>, "props" | "children" | "methods" | "events" | "messages"> & PartialGeneralComponentStruct<TStruct, TMsg> & {
    __struct?: TStruct;
};

declare type ComponentStructBase<TMsg extends BusMessages> = GeneralComponentStruct & {
    props?: {
        id?: string;
        cacheable?: boolean;
    };
    messages?: BusMessageHandlers<TMsg>;
    View?: ComponentView;
    BaseView?: ComponentView;
    constr?: (model: ComponentModel<ComponentStructBase<TMsg>, TMsg>) => MaybePromise;
    init?: (model: ComponentModel<ComponentStructBase<TMsg>, TMsg>) => MaybePromise;
    deinit?: (model: ComponentModel<ComponentStructBase<TMsg>, TMsg>) => MaybePromise;
    mount?: (model: ComponentModel<ComponentStructBase<TMsg>, TMsg>) => MaybePromise;
    unmount?: (model: ComponentModel<ComponentStructBase<TMsg>, TMsg>) => MaybePromise;
    draw?: (model: ComponentModel<ComponentStructBase<TMsg>, TMsg>) => MaybePromise;
    erase?: (model: ComponentModel<ComponentStructBase<TMsg>, TMsg>) => MaybePromise;
} & {
    __struct?: ComponentStructBase<TMsg>;
};

declare type ComponentStructEvents<TProps> = {
    onPropChanging?: (prop: keyof TProps | string, newValue: unknown, oldValue: unknown) => unknown;
    onPropChange?: (prop: keyof TProps | string, value: unknown, oldValue: unknown) => void;
} & {
    [Evt in keyof TProps as `onChanging${Capitalize<Evt & string>}`]?: (newValue: TProps[Evt], oldValue: TProps[Evt]) => TProps[Evt];
} & {
    [Evt in keyof TProps as `onChange${Capitalize<Evt & string>}`]?: (value: TProps[Evt], oldValue: TProps[Evt]) => void;
};

export declare type ComponentView = (params?: ViewParams) => ReactElement;

export declare function defaultMessageBus<TMsg extends BusMessages>(): MessageBus<TMsg>;

export declare type DynamicChildren = Record<string, AnyComponentModel>;

export declare type EmptyObject = Record<never, never>;

export declare type ErrorHandler = (error: Error) => void;

export declare function errorIf(condition: boolean, errorMessage?: string): void;

export declare function errorIfNot(condition: boolean, errorMessage?: string): void;

export declare type GeneralComponentStruct = {
    props?: EmptyObject;
    children?: EmptyObject;
    methods?: EmptyObject;
    events?: EmptyObject;
};

declare type GetChildrenModels = (childrenTypeFilter?: ModelType) => AnyComponentModel[];

export declare function getFC<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends BusMessages>(modelHook: (params: ComponentParams<TStruct, TMsg>) => ComponentModel<TStruct, TMsg>): (params: ComponentParams<TStruct, TMsg>) => React_2.JSX.Element;

declare type GlobalSettings = {
    traceLog: boolean;
    hashHtmlId: boolean;
    modelCacheMode: "no-cache" | "cache" | "auto-cache";
    errorHandler?: ErrorHandler;
};

export declare const globalSettings: GlobalSettings;

export declare function IF(props: {
    condition: boolean;
    children: React_2.ReactNode;
}): React_2.JSX.Element;

declare type InParam = {
    in: unknown;
};

export declare function intersection(a: unknown[], b: unknown[]): unknown[];

export declare function isArray(value: unknown): value is unknown[];

export declare function isBoolean(value: unknown): value is boolean;

export declare function isComponentModel(obj: unknown): boolean;

export declare function isEqual(a: unknown, b: unknown): boolean;

export declare function isFunction(value: unknown): value is () => unknown;

export declare function isMap(value: unknown): value is Map<unknown, unknown>;

export declare function isNull(value: unknown): value is null;

export declare function isNumber(value: unknown): value is number;

export declare function isObject(value: unknown): value is Record<string, unknown>;

export declare function isString(value: unknown): value is string;

export declare function isSymbol(value: unknown): value is symbol;

export declare function isUndefined(value: unknown): value is undefined;

export declare type MaybePromise = void | Promise<void>;

export declare type MessageBus<TMsg extends BusMessages> = {
    readonly name?: string;
    subscribe(subscriber: Subscriber<TMsg>): void;
    unsubscribe(subscriber: Subscriber<TMsg>): void;
    broadcast<Msg extends keyof TMsg>(modelId: string | RegExp | null, message: Msg, param: ParamIn<TMsg, Msg>): Promise<ParamOut<TMsg, Msg>[]>;
    castTo<Msg extends keyof TMsg>(modelId: string, message: Msg, param: ParamIn<TMsg, Msg>): Promise<ParamOut<TMsg, Msg>>;
    unicast<Msg extends keyof TMsg>(message: Msg, param: ParamIn<TMsg, Msg>): Promise<ParamOut<TMsg, Msg>>;
    /**
     * @deprecated Use the `unicast` function instead.
     */
    getAsync<Msg extends keyof TMsg>(message: Msg, param: ParamIn<TMsg, Msg>): Promise<ParamOut<TMsg, Msg>>;
    /**
     * @deprecated Use the `unicast` function instead.
     */
    postAsync<Msg extends keyof TMsg>(message: Msg, param: ParamIn<TMsg, Msg>): Promise<ParamOut<TMsg, Msg>>;
};

declare type MessageHandler<TMsg extends BusMessages, Msg extends keyof TMsg> = (param: ParamIn<TMsg, Msg>) => Promise<ParamOut<TMsg, Msg> extends undefined ? void : ParamOut<TMsg, Msg>>;

declare type MessageHandlerNoPar<TMsg extends BusMessages, Msg extends keyof TMsg> = () => Promise<ParamOut<TMsg, Msg> extends undefined ? void : ParamOut<TMsg, Msg>>;

declare type MessageID = string;

declare type ModelType = "static" | "dynamic";

export declare function observe<T extends object>(value: T): T;

declare type OutParam = {
    out: unknown;
};

declare type ParamIn<TMsg extends BusMessages, Msg extends keyof TMsg> = TMsg[Msg] extends InParam ? TMsg[Msg][keyof InParam] : undefined;

declare type ParamOut<TMsg extends BusMessages, Msg extends keyof TMsg> = TMsg[Msg] extends OutParam ? TMsg[Msg][keyof OutParam] : void;

declare type PartialGeneralComponentStruct<TStruct extends GeneralComponentStruct, TMsg extends BusMessages> = {
    props?: Partial<StructProps<ComponentProps<TStruct>>>;
    children?: Partial<ComponentChildren<TStruct>>;
    methods?: Partial<ComponentMethods<TStruct>>;
    events?: Partial<ComponentStructEvents<ComponentProps<TStruct>>> & Partial<ComponentEvents<TStruct>>;
    messages?: Partial<ComponentMessages<TStruct, TMsg>>;
};

export declare type ReactCSS = React_2.CSSProperties;

export declare type ReactElement = React_2.JSX.Element;

export declare const RenderNode: (props: {
    node: React_2.ReactNode | React_2.ComponentType;
    render?: boolean;
}) => React_2.JSX.Element;

export declare function renderNode(node: React_2.ReactNode | React_2.ComponentType): React_2.ReactNode;

export declare function sleep(ms: number): Promise<void>;

declare type StructProp<T> = T | (() => T) | Bond<T>;

declare type StructProps<TProps extends object> = {
    [Prop in keyof TProps]: StructProp<TProps[Prop]>;
};

declare type Subscriber<TMsg extends BusMessages> = ComponentModel<ComponentStructBase<TMsg>, TMsg>;

export declare function useComponent<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends BusMessages>(struct: TStruct, params?: ComponentParams<TStruct, TMsg>): ComponentModel<TStruct, TMsg>;

export declare function useExtendedComponent<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends BusMessages>(struct: ComponentStruct<ComponentStructBase<TMsg>, TMsg>, extStruct: TStruct, params?: ComponentParams<TStruct, TMsg>, modelHook?: (struct: TStruct, params?: ComponentParams<TStruct, TMsg>) => ComponentModel<TStruct, TMsg>): ComponentModel<TStruct, TMsg>;

export declare function useMessaging<TMsg extends BusMessages>(model: Subscriber<TMsg>): MessageBus<TMsg>;

declare type ViewParams = {
    render?: boolean;
    children?: React_2.ReactNode;
};

export { }
