import { JSX } from 'react/jsx-runtime';
import * as React_2 from 'react';

export declare const $: unique symbol;

export declare const $name = "$";

export declare type AnyComponentModel = ComponentModel<AnyComponentStruct>;

export declare type AnyComponentParams = ComponentParams<AnyComponentStruct>;

export declare type AnyComponentStruct = ComponentStruct<ComponentStructBase<BusMessages>>;

declare type ArgsIn<TMsg extends BusMessages, Msg extends keyof TMsg> = TMsg[Msg] extends InParam ? [param: TMsg[Msg][keyof InParam]] : [];

export declare function bind<T>(get: () => T, set: undefined): Bond<T>;

export declare function bind<T, P extends keyof NonNullable<T>>(obj: () => T, prop: P): Bond<NonNullable<T>[P]>;

export declare function bind<T>(get: () => T, set: ((value: T) => void) | undefined): Bond<T>;

export declare type BindDirection = "in" | "out";

/**
 * @deprecated Use the `bind` function instead.
 */
export declare function bindProp<T, P extends keyof NonNullable<T>>(obj: () => T, prop: P): Bond<NonNullable<T>[P]>;

export declare type Bond<T> = [BondGet<T> | undefined, BondSet<T> | undefined];

declare type BondGet<T> = () => T;

export declare type BondKind = "read-only" | "two-way";

declare type BondSet<T> = {
    bivarianceHack(value: T): void;
}["bivarianceHack"];

export declare type BusDispatch = "broadcast" | "castTo" | "unicast";

export declare type BusMessageHandlers<TMsg extends BusMessages> = {
    [Msg in keyof TMsg]?: ParamIn<TMsg, Msg> extends undefined ? MessageHandlerNoPar<TMsg, Msg> : MessageHandler<TMsg, Msg>;
};

export declare type BusMessages = Record<MessageID, InParam | OutParam | InParam & OutParam> | EmptyObject;

export declare function clone<T>(obj: T): T | undefined;

declare type ComponentChildren<TStruct extends GeneralComponentStruct> = NonNullable<TStruct["children"]>;

declare type ComponentEvents<TStruct extends GeneralComponentStruct> = Partial<NonNullable<TStruct["events"]>>;

declare type ComponentHookName = "constr" | "init" | "deinit" | "mount" | "unmount" | "draw" | "erase";

declare type ComponentHooks<TModel> = {
    constr?: (model: TModel) => MaybePromise;
    init?: (model: TModel) => MaybePromise;
    deinit?: (model: TModel) => MaybePromise;
    mount?: (model: TModel) => MaybePromise;
    unmount?: (model: TModel) => MaybePromise;
    draw?: (model: TModel) => MaybePromise;
    erase?: (model: TModel) => MaybePromise;
};

declare type ComponentMessages<TStruct extends ComponentStructBase<TMsg>, TMsg extends BusMessages> = NonNullable<TStruct["messages"]>;

declare type ComponentMethods<TStruct extends GeneralComponentStruct> = NonNullable<TStruct["methods"]>;

export declare type ComponentModel<TStruct extends StructWithUserType, TMsg extends BusMessages = BusMessages> = ComponentProps<NonNullable<TStruct["__struct"]>> & Readonly<ComponentChildren<NonNullable<TStruct["__struct"]>>> & Readonly<ComponentMethods<NonNullable<TStruct["__struct"]>>> & ComponentStructEvents<ComponentProps<NonNullable<TStruct["__struct"]>>> & ComponentEvents<NonNullable<TStruct["__struct"]>> & {
    readonly $: ComponentPrivateMembers;
    readonly bus: MessageBus<TMsg>;
    readonly View: ComponentView;
    readonly BaseView: ComponentView;
    readonly BaseViews: readonly ComponentView[];
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

export declare type ComponentParams<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends BusMessages = BusMessages> = ComponentProps<TStruct> & ComponentEvents<TStruct> & ComponentHooks<ComponentModel<TStruct, TMsg>>;

declare type ComponentPrivateMembers = {
    __status: {
        initPhase?: "constructing" | "constructed" | "initializing" | "initialized" | "unmount-deinit" | "deinitializing";
        mountPhase?: "init-mount" | "mounting" | "mounted" | "unmounting";
        cached: boolean;
        calledFromJSX: boolean;
        paramsSeeded: boolean;
        initCount: number;
        mountCount: number;
        baseResult: unknown;
    };
    __settersInProgress: {
        prop: string;
        value: unknown;
    }[];
    __owner: AnyComponentModel;
    __struct: AnyComponentStruct;
    __params: AnyComponentParams;
    __assignParams: (params: AnyComponentParams) => void;
    __dynamicChildrenIds: string[];
    __dynamicIdClaims: Map<string, object>;
    __staticChildrenCache: AnyComponentModel[];
    __proxy: AnyComponentModel;
    __initializeModel: (params?: AnyComponentParams) => void;
};

declare type ComponentProps<TStruct extends GeneralComponentStruct> = Partial<NonNullable<TStruct["props"]>>;

export declare type ComponentStruct<TStruct extends GeneralComponentStruct, TMsg extends BusMessages = BusMessages> = {
    props?: ReservedProps;
    events?: Partial<ComponentStructEvents<EmptyObject>>;
    messages?: Partial<BusMessageHandlers<TMsg>>;
} & Omit<TStruct & ComponentStructBase<TMsg>, "props" | "children" | "methods" | "events" | "messages" | ComponentHookName> & PartialGeneralComponentStruct<TStruct, TMsg> & StructHooks<TMsg> & {
    __struct?: TStruct;
};

declare type ComponentStructBase<TMsg extends BusMessages> = GeneralComponentStruct & {
    props?: ReservedProps;
    messages?: BusMessageHandlers<TMsg>;
    View?: ComponentView;
    BaseViews?: ComponentView[];
} & StructHooks<TMsg> & {
    __struct?: ComponentStructBase<TMsg>;
};

declare type ComponentStructEvents<TProps> = {
    onPropChanging?: (prop: keyof TProps | string, newValue: unknown, oldValue: unknown) => unknown;
    onPropChange?: (prop: keyof TProps | string, value: unknown, oldValue: unknown) => void;
} & {
    [Evt in Exclude<keyof TProps, PlainProp> as `onChanging${Capitalize<Evt & string>}`]?: (newValue: TProps[Evt], oldValue: TProps[Evt]) => TProps[Evt];
} & {
    [Evt in Exclude<keyof TProps, PlainProp> as `onChange${Capitalize<Evt & string>}`]?: (value: TProps[Evt], oldValue: TProps[Evt]) => void;
};

export declare type ComponentView = (params?: ViewParams) => ReactElement;

export declare function defaultMessageBus<TMsg extends BusMessages>(): MessageBus<TMsg>;

export declare type DynamicChildren = Record<string, AnyComponentModel>;

export declare type EmptyObject = Record<never, never>;

export declare type ErrorHandler = (error: Error) => void;

export declare function errorIf(condition: boolean, errorMessage?: string): void;

export declare function errorIfNot(condition: unknown, errorMessage?: string): asserts condition;

export declare type GeneralComponentStruct = {
    props?: EmptyObject;
    children?: EmptyObject;
    methods?: EmptyObject;
    events?: EmptyObject;
};

declare type GetChildrenModels = (childrenTypeFilter?: ModelType) => AnyComponentModel[];

export declare function getFC<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends BusMessages>(modelHook: (params: ComponentParams<TStruct, TMsg>) => ComponentModel<TStruct, TMsg>): (params: ComponentParams<TStruct, TMsg>) => ReactElement;

declare type GlobalSettings = {
    traceLog: boolean;
    hashHtmlId: boolean;
    modelCacheMode: "no-cache" | "cache" | "auto-cache";
    renderRetries?: number;
    bindingRetries?: number;
    tracing?: TraceOptions;
    readonly trace: TraceApi;
    errorHandler?: ErrorHandler;
};

export declare const globalSettings: GlobalSettings;

export declare function IF(props: {
    condition: boolean;
    children: React_2.ReactNode;
}): ReactElement;

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
    broadcast<Msg extends keyof TMsg>(modelId: string | RegExp | null, message: Msg, ...param: ArgsIn<TMsg, Msg>): Promise<ParamOut<TMsg, Msg>[]>;
    castTo<Msg extends keyof TMsg>(modelId: string, message: Msg, ...param: ArgsIn<TMsg, Msg>): Promise<ParamOut<TMsg, Msg>>;
    unicast<Msg extends keyof TMsg>(message: Msg, ...param: ArgsIn<TMsg, Msg>): Promise<ParamOut<TMsg, Msg>>;
    /**
     * @deprecated Use the `unicast` function instead.
     */
    getAsync<Msg extends keyof TMsg>(message: Msg, ...param: ArgsIn<TMsg, Msg>): Promise<ParamOut<TMsg, Msg>>;
    /**
     * @deprecated Use the `unicast` function instead.
     */
    postAsync<Msg extends keyof TMsg>(message: Msg, ...param: ArgsIn<TMsg, Msg>): Promise<ParamOut<TMsg, Msg>>;
};

declare type MessageHandler<TMsg extends BusMessages, Msg extends keyof TMsg> = (param: ParamIn<TMsg, Msg>) => Promise<ParamOut<TMsg, Msg> extends undefined ? void : ParamOut<TMsg, Msg>>;

declare type MessageHandlerNoPar<TMsg extends BusMessages, Msg extends keyof TMsg> = () => Promise<ParamOut<TMsg, Msg> extends undefined ? void : ParamOut<TMsg, Msg>>;

declare type MessageID = string;

declare type ModelOfStruct<TStruct, TMsg extends BusMessages> = TStruct extends StructWithUserType ? ComponentModel<TStruct, TMsg> : never;

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

declare type PlainProp = ReservedProp | PrivateProp;

declare type PrivateProp = `__${string}`;

export declare type ReactCSS = React_2.CSSProperties;

export declare type ReactElement = React_2.JSX.Element | null;

export declare const RenderNode: (props: {
    node: React_2.ReactNode | React_2.ComponentType;
    render?: boolean;
}) => ReactElement;

export declare function renderNode(node: React_2.ReactNode | React_2.ComponentType): React_2.ReactNode;

declare type ReservedProp = "id" | "cacheable";

declare type ReservedProps = {
    id?: string;
    cacheable?: boolean;
};

export declare function sleep(ms: number): Promise<void>;

declare interface StructHooks<TMsg extends BusMessages> {
    constr?(model: ModelOfStruct<this, TMsg>): MaybePromise;
    init?(model: ModelOfStruct<this, TMsg>): MaybePromise;
    deinit?(model: ModelOfStruct<this, TMsg>): MaybePromise;
    mount?(model: ModelOfStruct<this, TMsg>): MaybePromise;
    unmount?(model: ModelOfStruct<this, TMsg>): MaybePromise;
    draw?(model: ModelOfStruct<this, TMsg>): MaybePromise;
    erase?(model: ModelOfStruct<this, TMsg>): MaybePromise;
}

declare type StructProp<T> = T | (() => T) | Bond<T>;

declare type StructProps<TProps extends object> = {
    [Prop in keyof TProps]: Prop extends PrivateProp ? TProps[Prop] : StructProp<TProps[Prop]>;
};

declare type StructWithUserType = {
    __struct?: GeneralComponentStruct;
};

declare type Subscriber<TMsg extends BusMessages> = ComponentModel<ComponentStructBase<TMsg>, TMsg>;

export declare const trace: TraceApi;

export declare type TraceApi = {
    readonly records: () => TraceRecord[];
    readonly clear: () => void;
    readonly toJSON: () => string;
    readonly toMermaid: () => string;
    readonly save: (fileName?: string) => void;
    readonly subscribe: (listener: (record: TraceRecord) => void) => () => void;
};

export declare type TraceKind = "create" | "constr" | "init" | "draw" | "mount" | "unmount" | "erase" | "deinit" | "render" | "fc-begin" | "fc-end" | "prop" | "bind" | "cache" | "bus" | "diag";

export declare type TraceLevel = "info" | "warn" | "error";

export declare type TraceOptions = {
    capture?: number;
    sink?: (record: TraceRecord) => void;
};

export declare type TraceRecord = {
    seq: number;
    t: number;
    kind: TraceKind;
    level: TraceLevel;
    text: string;
    model?: string;
    path?: string;
    cache?: string;
    hook?: string;
    prop?: string;
    from?: string;
    to?: string;
    source?: string;
    dir?: BindDirection;
    bond?: BondKind;
    owner?: string;
    ownerPath?: string;
    bus?: string;
    msg?: string;
    address?: string;
    via?: BusDispatch;
    cast?: number;
    count?: number;
};

export declare type TraceTheme = "light" | "dark" | "auto";

export declare function TraceViewer({ capture, throttle, height, theme, className, style }: TraceViewerProps): JSX.Element;

export declare function TraceViewerButton({ target, placement, capture, throttle, label, size, theme, className, style }: TraceViewerButtonProps): JSX.Element;

export declare type TraceViewerButtonProps = {
    target?: "overlay" | "tab";
    placement?: TraceViewerPlacement;
    capture?: number;
    throttle?: number;
    label?: string;
    size?: number;
    theme?: TraceTheme;
    className?: string;
    style?: ReactCSS;
};

export declare type TraceViewerPlacement = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "inline";

export declare type TraceViewerProps = {
    capture?: number;
    throttle?: number;
    height?: number | string;
    theme?: TraceTheme;
    className?: string;
    style?: ReactCSS;
};

export declare function useComponent<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends BusMessages>(struct: TStruct, params?: ComponentParams<TStruct, TMsg>): ComponentModel<TStruct, TMsg>;

export declare function useExtendedComponent<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends BusMessages>(struct: ComponentStruct<ComponentStructBase<TMsg>, TMsg>, extStruct: TStruct, params?: ComponentParams<TStruct, TMsg>, modelHook?: (struct: TStruct, params?: ComponentParams<TStruct, TMsg>) => ComponentModel<TStruct, TMsg>): ComponentModel<TStruct, TMsg>;

export declare function useMessaging<TMsg extends BusMessages>(model: Subscriber<TMsg>): MessageBus<TMsg>;

declare type ViewParams = {
    render?: boolean;
    children?: React_2.ReactNode;
};

export { }
