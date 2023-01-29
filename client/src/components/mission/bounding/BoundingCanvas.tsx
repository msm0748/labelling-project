import { MouseEvent, useRef, useEffect, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import Bounding from "../../../lib/bounding/index";
import DropDown from "../../common/category";
import { IElements, ICategory } from "../../../lib/bounding/index.type";

interface Props {
    tool: "select" | "move" | "bounding";
    elements: IElements[];
    category: ICategory;
    setElements: Dispatch<SetStateAction<IElements[]>>;
    setCategory: Dispatch<SetStateAction<ICategory>>;
    categoryList: ICategory[];
}

const bounding = new Bounding();

const StyledWrap = styled.section`
    display: flex;
    flex: 1;
    position: relative;
`;

const StyledCanvas = styled.canvas`
    width: 100%;
    height: 100%;
`;

function Canvas({ tool, elements, setElements, category, setCategory, categoryList }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        bounding.init(canvas);
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }, []);
    useEffect(() => {
        bounding.tools(tool);
        console.log(tool);
    }, [tool]);

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
            {tool === "bounding" && <DropDown category={category} setCategory={setCategory} categoryList={categoryList} />}
            <StyledCanvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}></StyledCanvas>
        </StyledWrap>
    );
}

export default Canvas;
