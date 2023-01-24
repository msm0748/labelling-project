import { MouseEvent, useRef, useEffect } from "react";
import Bounding from "../../../lib/bounding";
import styled from "styled-components";

interface Props {
    tool: "select" | "move" | "bounding";
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

function Canvas({ tool }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // const [elements, setElements] = useState<IElements[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        bounding.init(canvas);
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }, []);
    console.log("바운딩 캔버스 렌더링", tool);

    const mouseDown = ({ nativeEvent }: MouseEvent) => {
        const { offsetX, offsetY } = nativeEvent;
        bounding.drawStart(offsetX, offsetY);
    };
    const mouseMove = ({ nativeEvent }: MouseEvent) => {
        const { offsetX, offsetY } = nativeEvent;
        bounding.draw(offsetX, offsetY);
    };
    const mouseUp = ({ nativeEvent }: MouseEvent) => {
        const { offsetX, offsetY } = nativeEvent;
        bounding.drawEnd(offsetX, offsetY);
    };

    return (
        <StyledWrap>
            <StyledCanvas ref={canvasRef} onMouseDown={mouseDown} onMouseMove={mouseMove} onMouseUp={mouseUp}></StyledCanvas>
        </StyledWrap>
    );
}

export default Canvas;
