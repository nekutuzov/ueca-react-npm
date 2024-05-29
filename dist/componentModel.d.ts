import * as React from 'react';
import { IReactionDisposer } from "mobx";
import { AnyMessage, AnyName, IMessageBus, Messages } from "./messageBus";
type ComponentTemplate = {
    props?: {};
    children?: {};
    methods?: {};
    events?: {};
};
type ComponentProps<TStruct extends ComponentTemplate> = TStruct["props"];
type ComponentChildren<TStruct extends ComponentTemplate> = TStruct["children"];
type ComponentMethods<TStruct extends ComponentTemplate> = TStruct["methods"];
type ComponentEvents<TStruct extends ComponentTemplate> = TStruct["events"];
type ComponentMessages<TStruct extends ComponentStructBase<TMsg>, TMsg extends AnyMessage> = TStruct["messages"];
type ComponentStructEvents<TProps> = {
    onPropChanging?: (prop: keyof TProps, newValue: any, oldValue: any) => any;
    onPropChange?: (prop: keyof TProps, value: any) => void;
} & {
    [Evt in keyof TProps as `onGet${Capitalize<Evt & string>}`]?: () => TProps[Evt];
} & {
    [Evt in keyof TProps as `onChanging${Capitalize<Evt & string>}`]?: (newValue: TProps[Evt], oldValue: TProps[Evt]) => TProps[Evt];
} & {
    [Evt in keyof TProps as `onChange${Capitalize<Evt & string>}`]?: (value: TProps[Evt]) => void;
};
type ComponentViewProps = {
    render?: boolean;
    children?: React.ReactNode;
};
type ComponentView = (params?: ComponentViewProps) => JSX.Element;
type Bond<T> = [() => T, (value: T) => void];
type StructProp<T> = T | (() => T) | Bond<T>;
type StructProps<TProps> = {
    [Prop in keyof TProps]: StructProp<TProps[Prop]>;
};
type ComponentStructBase<TMsg extends AnyMessage> = ComponentTemplate & {
    props?: {
        id?: string;
    };
    messages?: Messages<TMsg>;
    View?: ComponentView;
    BaseView?: ComponentView;
    init?: (model: ComponentModel<ComponentStructBase<TMsg>, TMsg>) => void;
    mount?: (model: ComponentModel<ComponentStructBase<TMsg>, TMsg>) => void;
    unmount?: (model: ComponentModel<ComponentStructBase<TMsg>, TMsg>) => void;
    __struct?: ComponentStructBase<TMsg>;
};
type PartialComponentTemplate<TStruct extends ComponentTemplate, TMsg extends AnyMessage> = {
    props?: Partial<StructProps<ComponentProps<TStruct>>>;
    children?: Partial<ComponentChildren<TStruct>>;
    methods?: Partial<ComponentMethods<TStruct>>;
    events?: Partial<ComponentStructEvents<ComponentProps<TStruct>>> & Partial<ComponentEvents<TStruct>>;
    messages?: Partial<ComponentMessages<TStruct, TMsg>>;
};
type ComponentStruct<TStruct extends ComponentTemplate, TMsg extends AnyMessage = AnyMessage> = PartialComponentTemplate<ComponentStructBase<TMsg>, TMsg> & Omit<TStruct & ComponentStructBase<TMsg>, "props" | "children" | "methods" | "events" | "messages"> & PartialComponentTemplate<TStruct, TMsg> & {
    __struct?: TStruct;
};
type AnyComponentParams = ComponentParams<AnyComponentStruct, AnyMessage>;
type AnyComponentStruct = ComponentStruct<ComponentStructBase<AnyMessage>, AnyMessage>;
type AnyComponentModel = ComponentModel<AnyComponentStruct, AnyMessage>;
type DynamicChildren = Record<string, AnyComponentModel>;
type ComponentParams<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends AnyMessage = {}> = Partial<ComponentProps<TStruct>> & Partial<ComponentEvents<TStruct>> & {
    init?: (model: ComponentModel<TStruct, TMsg>) => void;
    mount?: (model: ComponentModel<TStruct, TMsg>) => void;
    unmount?: (model: ComponentModel<TStruct, TMsg>) => void;
} & {
    owner?: DynamicChildren;
};
type ComponentPrivateMembers = {
    __owner: AnyComponentModel;
    __deleteMember: (name: string) => boolean;
    __calledFromJSX: boolean;
    __messages: Partial<Messages<AnyMessage>>;
    __propBindings: string[];
    __mounted: boolean;
    __initialize: () => void;
    __unmount: () => void;
    __updateInitializedModelProperties: (params: AnyComponentParams) => void;
    __autoRunDisposers: IReactionDisposer[];
    bus: IMessageBus<AnyMessage, AnyName>;
    View: ComponentView;
    BaseView: ComponentView;
    firstTimeRendering: boolean;
    disableOnChange: () => void;
    enableOnChange: () => void;
    changeNotifyDisabled: () => boolean;
    fullId: () => string;
    htmlId: () => string;
    birthMark: () => string;
    calledFromJSX: () => boolean;
    init: (model: ComponentModel<AnyComponentStruct, AnyMessage>) => void;
    mount: (model: ComponentModel<AnyComponentStruct, AnyMessage>) => void;
    unmount: (model: ComponentModel<AnyComponentStruct, AnyMessage>) => void;
};
declare const $: unique symbol;
type ComponentModel<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends AnyMessage = {}> = ComponentProps<TStruct["__struct"]> & Readonly<ComponentChildren<TStruct["__struct"]>> & Readonly<ComponentMethods<TStruct["__struct"]>> & ComponentStructEvents<ComponentProps<TStruct["__struct"]>> & ComponentEvents<TStruct["__struct"]> & {
    readonly [$]: ComponentPrivateMembers;
    readonly bus: IMessageBus<TMsg, AnyName>;
    readonly View: ComponentView;
    readonly BaseView: ComponentView;
    readonly disableOnChange: () => void;
    readonly enableOnChange: () => void;
    readonly changeNotifyDisabled: () => boolean;
    readonly fullId: () => string;
    readonly htmlId: () => string;
    readonly birthMark: () => string;
    readonly calledFromJSX: () => boolean;
};
type ComponentModelTrapRegistry = {
    readonly _hookCallsCount: number;
    readonly _newModels: AnyComponentModel[];
    readonly models: AnyComponentModel[];
    readonly cached: boolean;
    readonly nextCachedModel: () => AnyComponentModel;
    readonly cacheModel: (model: AnyComponentModel) => void;
    readonly updateCache: (owner: AnyComponentModel) => void;
};
declare const blankView: () => any;
declare function useComponent<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends AnyMessage>(struct: TStruct, params?: ComponentParams<TStruct>): ComponentModel<TStruct, TMsg>;
declare function mergeStruct<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TExt extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends AnyMessage>(struct: TStruct, extStruct: TExt, model: () => ComponentModel<TExt, TMsg>): TStruct & TExt;
declare function bind<T>(get: () => T, set: (value: T) => void): Bond<T>;
declare function bindProp<T, P extends keyof T>(obj: () => T, prop: P): Bond<T[P]>;
declare function newComponentModelTrapRegistry(cache?: AnyComponentModel[]): ComponentModelTrapRegistry;
declare const ComponentModelTrap: React.Context<ComponentModelTrapRegistry>;
declare function useComponentModelTrap(): ComponentModelTrapRegistry;
declare function getFC<TStruct extends ComponentStruct<ComponentStructBase<TMsg>, TMsg>, TMsg extends AnyMessage>(modelHook: (params: ComponentParams<TStruct>) => ComponentModel<TStruct, TMsg>): (params: ComponentParams<TStruct>) => JSX.Element;
declare function componentModelDebug(text: string): void;
export { ComponentModel, AnyComponentModel, ComponentTemplate, ComponentStruct, ComponentProps, ComponentMethods, ComponentEvents, ComponentMessages, ComponentParams, ComponentView, DynamicChildren, ComponentModelTrap, ComponentModelTrapRegistry, useComponentModelTrap, newComponentModelTrapRegistry, useComponent, mergeStruct, blankView, bind, bindProp, componentModelDebug, getFC, $ };
