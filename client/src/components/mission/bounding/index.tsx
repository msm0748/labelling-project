import { useState } from "react";
import styled from "styled-components";
import Canvas from "./BoundingCanvas";
import Tool from "./BoundingTool";
import RightBar from "./BoundingRightBar";
import { IElements, ISelectedElement } from "./index.type";

const StyledWrap = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`;

const categoryList = [
    {
        title: "강아지",
        color: "rgb(0, 192, 108)",
    },
    {
        title: "고양이",
        color: "rgb(255, 91, 208)",
    },
];

function BoundingComponent() {
    const [tool, setTool] = useState<"select" | "move" | "bounding">("select");
    const [elements, setElements] = useState<IElements[]>([]);
    const [selectedElement, setSelectedElement] = useState<ISelectedElement | null>(null);
    const [isReset, setIsReset] = useState<boolean>(false);
    return (
        <StyledWrap>
            <Tool tool={tool} setTool={setTool} setIsReset={setIsReset} />
            <Canvas
                tool={tool}
                isReset={isReset}
                setIsReset={setIsReset}
                elements={elements}
                setElements={setElements}
                categoryList={categoryList}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
            ></Canvas>
            <RightBar
                elements={elements}
                setElements={setElements}
                categoryList={categoryList}
                tool={tool}
                setTool={setTool}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
            ></RightBar>
        </StyledWrap>
    );
}

export default BoundingComponent;
