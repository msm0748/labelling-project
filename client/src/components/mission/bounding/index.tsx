import { useState } from "react";
import styled from "styled-components";
import Canvas from "./BoundingCanvas";
import Tool from "./BoundingTool";
import RightBar from "./BoundingRightBar";
import { IElements } from "../../../lib/bounding/index.type";
import Bounding from "../../../lib/bounding/index";

const StyledWrap = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
`;

const categoryList = [
    {
        categoryTitle: "선수",
        categoryColor: "rgb(0, 192, 108)",
    },
    {
        categoryTitle: "심판",
        categoryColor: "rgb(255, 91, 208)",
    },
];

const bounding = new Bounding();

function BoundingComponent() {
    const [tool, setTool] = useState<"select" | "move" | "bounding">("select");
    const [elements, setElements] = useState<IElements[]>([]);
    return (
        <StyledWrap>
            <Tool tool={tool} setTool={setTool} />
            <Canvas tool={tool} elements={elements} setElements={setElements} categoryList={categoryList} bounding={bounding}></Canvas>
            <RightBar elements={elements} setElements={setElements} categoryList={categoryList} bounding={bounding}></RightBar>
        </StyledWrap>
    );
}

export default BoundingComponent;
