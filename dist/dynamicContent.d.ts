import React from "react";
import { AnyComponentModel, ComponentModel, ComponentParams, ComponentStruct, DynamicChildren } from "./componentModel";
type Struct = ComponentStruct<{
    props: {
        children: React.ReactNode;
        _baseProps: string[];
        _staticChildrenModels: AnyComponentModel[];
        _childrenFromJSX: boolean;
        _forceUpdate: boolean;
    };
    children: DynamicChildren;
    methods: {
        destroyModels: () => void;
        forceUpdate: (children?: React.ReactNode) => void;
        getModels: () => AnyComponentModel[];
        getChildrenNames: () => string[];
    };
}>;
type DynamicContentModel = ComponentModel<Struct> & Record<string, ComponentModel<ComponentStruct<{}>>>;
declare function useDynamicContent(params?: ComponentParams<Struct>): DynamicContentModel;
declare const DynamicContent: (params: ComponentParams<Struct, {}>) => JSX.Element;
export { DynamicContentModel, DynamicContent, useDynamicContent };
