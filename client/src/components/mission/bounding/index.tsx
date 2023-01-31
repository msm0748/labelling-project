import { useState } from "react";
import styled from "styled-components";
import Canvas from "./BoundingCanvas";
import Tool from "./BoundingTool";
import RightBar from "./BoundingRightBar";
import { IElements } from "./index.type";

const StyledWrap = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`;

const categoryList = [
    {
        title: "선수",
        color: "rgb(0, 192, 108)",
    },
    {
        title: "심판",
        color: "rgb(255, 91, 208)",
    },
];

function BoundingComponent() {
    const [tool, setTool] = useState<"select" | "move" | "bounding">("select");
    const [elements, setElements] = useState<IElements[]>([]);
    const [selectedElement, setSelectedElement] = useState<IElements | null>(null);
    return (
        <StyledWrap>
            <Tool tool={tool} setTool={setTool} />
            <Canvas
                tool={tool}
                elements={elements}
                setElements={setElements}
                categoryList={categoryList}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
            ></Canvas>
            <RightBar elements={elements} setElements={setElements} categoryList={categoryList} tool={tool} setTool={setTool}></RightBar>
        </StyledWrap>
    );
}

export default BoundingComponent;
