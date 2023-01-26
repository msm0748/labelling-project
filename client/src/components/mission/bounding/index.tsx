import { useState } from "react";
import styled from "styled-components";
import Canvas from "./BoundingCanvas";
import Tool from "./BoundingTool";
import RightBar from "./BoundingRightBar";
import { IElements } from "../../../lib/bounding/index.type";

const StyledWrap = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`;

function BoundingComponent() {
    const [tool, setTool] = useState<"select" | "move" | "bounding">("select");
    const [elements, setElements] = useState<IElements[]>([]);
    return (
        <StyledWrap>
            <Tool tool={tool} setTool={setTool} />
            <Canvas tool={tool} elements={elements} setElements={setElements}></Canvas>
            <RightBar elements={elements} setElements={setElements}></RightBar>
        </StyledWrap>
    );
}

export default BoundingComponent;
