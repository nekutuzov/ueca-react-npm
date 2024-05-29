import * as React from "react";
declare function IF(props: {
    condition: boolean;
    children: React.ReactNode;
}): JSX.Element;
declare function renderNode(node: React.ReactNode): any;
declare function isSimpleNode(node: React.ReactNode): boolean;
export { IF, renderNode, isSimpleNode };
