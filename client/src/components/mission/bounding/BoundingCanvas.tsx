import { MouseEvent, useRef, useEffect, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import Bounding from "../../../lib/bounding";
import { IElements } from "../../../lib/bounding/index.type";

interface Props {
    tool: "select" | "move" | "bounding";
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
}

const bounding = new Bounding();

const StyledWrap = styled.section`
    display: flex;
    flex: 1;
`;

const StyledCanvas = styled.canvas`
    width: 100%;
    height: 100%;
`;

function Canvas({ tool, elements, setElements }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        bounding.init(canvas);
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }, []);
    useEffect(() => {
        bounding.tools(tool);
    }, [tool]);

    const mouseDown = (e: MouseEvent) => {
        bounding.drawStart(e);
    };
    const mouseMove = (e: MouseEvent) => {
        bounding.draw(e);
    };
    const mouseUp = (e: MouseEvent) => {
        bounding.drawEnd(e);
        setElements(bounding.elements);
    };

    return (
        <StyledWrap>
            <StyledCanvas ref={canvasRef} onMouseDown={mouseDown} onMouseMove={mouseMove} onMouseUp={mouseUp}></StyledCanvas>
        </StyledWrap>
    );
}

export default Canvas;
