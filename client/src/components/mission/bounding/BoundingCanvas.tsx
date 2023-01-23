import { MouseEvent, useRef, useEffect } from "react";
import Bounding from "../../../lib/bounding";

const bounding = new Bounding();

function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // const [elements, setElements] = useState<IElements[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        bounding.init(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }, []);
    console.log("바운딩 캔버스 렌더링");

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

    return <canvas ref={canvasRef} onMouseDown={mouseDown} onMouseMove={mouseMove} onMouseUp={mouseUp}></canvas>;
}

export default Canvas;
