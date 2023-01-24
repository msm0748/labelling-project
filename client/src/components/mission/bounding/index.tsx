import styled from "styled-components";
import Canvas from "./BoundingCanvas";
import Tool from "./BoundingTool";
import { useState } from "react";

const StyledWrap = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`;

function BoundingComponent() {
    const [tool, setTool] = useState<"select" | "move" | "bounding">("select");
    return (
        <StyledWrap>
            <Tool tool={tool} setTool={setTool} />
            <Canvas tool={tool}></Canvas>
        </StyledWrap>
    );
}

export default BoundingComponent;
