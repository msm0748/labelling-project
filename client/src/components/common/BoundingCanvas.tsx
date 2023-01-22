import { MouseEvent, useRef, useState, useEffect } from "react";
import Bounding from "../../lib/bounding";

const bounding = new Bounding();

// interface IElements {
//     sX: number;
//     sY: number;
//     cX: number;
//     cY: number;
// }

function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const startPos = useRef({ sX: 0, sY: 0, cX: 0, cY: 0 });
    // const [elements, setElements] = useState<IElements[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        bounding.init(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, []);
    console.log("바운딩 캔버스 렌더링");

    const mouseDown = ({ nativeEvent }: MouseEvent) => {
        setIsDrawing(true);
        const { offsetX, offsetY } = nativeEvent;
        startPos.current.sX = offsetX;
        startPos.current.sY = offsetY;
    };
    const mouseMove = ({ nativeEvent }: MouseEvent) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        startPos.current.cX = offsetX - startPos.current.sX;
        startPos.current.cY = offsetY - startPos.current.sY;

        const { sX, sY, cX, cY } = startPos.current;
        bounding.draw(sX, sY, cX, cY);
    };
    const mouseUp = () => {
        setIsDrawing(false);
        bounding.drawEnd();
    };

    return <canvas ref={canvasRef} onMouseDown={mouseDown} onMouseMove={mouseMove} onMouseUp={mouseUp}></canvas>;
}

export default Canvas;
