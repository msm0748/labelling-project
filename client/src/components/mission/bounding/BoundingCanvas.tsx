import { MouseEvent, useRef, useEffect, Dispatch, SetStateAction, useState } from "react";
import styled from "styled-components";
import Bounding from "../../../lib/bounding/index";
import DropDown from "../../common/category";
import { IElements, ICategory } from "../../../lib/bounding/index.type";

interface Props {
    tool: "select" | "move" | "bounding";
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
    categoryList: ICategory[];
    bounding: Bounding;
}

const StyledWrap = styled.section`
    display: flex;
    flex: 1;
    position: relative;
`;

const StyledCanvas = styled.canvas`
    width: 100%;
    height: 100%;
`;

function Canvas({ tool, elements, setElements, categoryList, bounding }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [category, setCategory] = useState<ICategory>(categoryList[0]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        bounding.init(canvas);
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }, [bounding]);
    useEffect(() => {
        bounding.tools(tool);
    }, [bounding, tool]);
    useEffect(() => {
        bounding.getCategory(category);
    }, [bounding, category]);

    const handleMouseDown = (e: MouseEvent) => {
        bounding.handleMouseDown(e);
    };
    const handleMouseMove = (e: MouseEvent) => {
        bounding.handleMouseMove(e);
    };
    const handleMouseUp = (e: MouseEvent) => {
        bounding.handleMouseUp(e);
        setElements(bounding.elements);
    };

    return (
        <StyledWrap>
            {tool === "bounding" && <DropDown category={category} setCategory={setCategory} categoryList={categoryList} isAbsolute={true} />}
            <StyledCanvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}></StyledCanvas>
        </StyledWrap>
    );
}

export default Canvas;
