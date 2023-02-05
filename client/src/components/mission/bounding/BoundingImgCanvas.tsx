import { useEffect, useCallback, useLayoutEffect, useRef, useState, MouseEvent, WheelEvent } from "react";
import testImg from "../../../assets/images/mission/test.jpg";
import styled from "styled-components";

const StyledCanvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
`;

type CanvasProps = {
    canvasWidth: number;
    canvasHeight: number;
};

type Point = {
    x: number;
    y: number;
};

const ORIGIN = { x: 0, y: 0 };

function diffPoints(p1: Point, p2: Point) {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
}

function addPoints(p1: Point, p2: Point) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

function scalePoint(p1: Point, scale: number) {
    return { x: p1.x / scale, y: p1.y / scale };
}

const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll

const image = new Image();
image.src = testImg;

function ImgCanvas(props: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [isDraw, setIsDraw] = useState(false);
    const [scale, setScale] = useState<number>(1);
    const [offset, setOffset] = useState<Point>(ORIGIN);
    const [mousePos, setMousePos] = useState<Point>(ORIGIN);
    const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN);
    const isResetRef = useRef<boolean>(false);
    const lastMousePosRef = useRef<Point>(ORIGIN);
    const lastOffsetRef = useRef<Point>(ORIGIN);

    // update last offset
    useEffect(() => {
        lastOffsetRef.current = offset;
    }, [offset]);

    // reset
    const reset = useCallback(
        (context: CanvasRenderingContext2D) => {
            if (context && !isResetRef.current) {
                context.canvas.width = props.canvasWidth;
                context.canvas.height = props.canvasHeight;
                context.scale(1, 1);
                setScale(1);

                // reset state and refs
                setContext(context);
                setOffset(ORIGIN);
                setMousePos(ORIGIN);
                setViewportTopLeft(ORIGIN);
                lastOffsetRef.current = ORIGIN;
                lastMousePosRef.current = ORIGIN;

                // this thing is so multiple resets in a row don't clear canvas
                isResetRef.current = true;
            }
        },
        [props.canvasWidth, props.canvasHeight]
    );

    // functions for panning

    const handleUpdateMouse = useCallback((event: MouseEvent) => {
        if (canvasRef.current) {
            const viewportMousePos = { x: event.clientX, y: event.clientY };
            const topLeftCanvasPos = {
                x: canvasRef.current.offsetLeft,
                y: canvasRef.current.offsetTop,
            };
            setMousePos(diffPoints(viewportMousePos, topLeftCanvasPos));
        }
    }, []);

    const mouseDown = useCallback((event: MouseEvent) => {
        lastMousePosRef.current = { x: event.pageX, y: event.pageY };
        setIsDraw(true);
    }, []);

    const mouseMove = useCallback(
        (event: MouseEvent) => {
            if (!isDraw) return;
            if (context) {
                const lastMousePos = lastMousePosRef.current;
                const currentMousePos = { x: event.pageX, y: event.pageY }; // use document so can pan off element
                lastMousePosRef.current = currentMousePos;

                const mouseDiff = diffPoints(currentMousePos, lastMousePos);
                setOffset((prevOffset) => addPoints(prevOffset, mouseDiff));
            }
            handleUpdateMouse(event);
        },
        [isDraw, context, handleUpdateMouse]
    );

    const mouseUp = useCallback(() => {
        setIsDraw(false);
    }, []);

    // setup canvas and set context
    useLayoutEffect(() => {
        if (canvasRef.current) {
            // get new drawing context
            const renderCtx = canvasRef.current.getContext("2d");

            if (renderCtx) {
                reset(renderCtx);
            }
        }
    }, [reset, props.canvasHeight, props.canvasWidth]);

    // pan when offset or scale changes
    useLayoutEffect(() => {
        if (context && lastOffsetRef.current) {
            const offsetDiff = scalePoint(diffPoints(offset, lastOffsetRef.current), scale);
            context.translate(offsetDiff.x, offsetDiff.y);
            setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
            isResetRef.current = false;
        }
    }, [context, offset, scale]);

    // draw
    useLayoutEffect(() => {
        if (context) {
            // clear canvas but maintain transform
            const storedTransform = context.getTransform();
            context.canvas.width = context.canvas.width!;
            context.setTransform(storedTransform);

            context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);
        }
    }, [props.canvasWidth, props.canvasHeight, context, scale, offset]);

    const handleWheel = useCallback(
        (event: WheelEvent) => {
            if (context) {
                const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
                const viewportTopLeftDelta = {
                    x: (mousePos.x / scale) * (1 - 1 / zoom),
                    y: (mousePos.y / scale) * (1 - 1 / zoom),
                };
                const newViewportTopLeft = addPoints(viewportTopLeft, viewportTopLeftDelta);

                context.translate(viewportTopLeft.x, viewportTopLeft.y);
                context.scale(zoom, zoom);
                context.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);

                setViewportTopLeft(newViewportTopLeft);
                setScale(scale * zoom);
                isResetRef.current = false;
            }
            handleUpdateMouse(event);
        },
        [context, mousePos.x, mousePos.y, viewportTopLeft, scale, handleUpdateMouse]
    );

    return (
        <StyledCanvas
            onMouseDown={mouseDown}
            onMouseMove={mouseMove}
            onMouseUp={mouseUp}
            onWheel={handleWheel}
            ref={canvasRef}
            width={props.canvasWidth}
            height={props.canvasHeight}
        ></StyledCanvas>
    );
}

export default ImgCanvas;
