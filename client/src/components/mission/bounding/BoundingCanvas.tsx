import { MouseEvent, useRef, useEffect, Dispatch, SetStateAction, useState, useCallback, useLayoutEffect, WheelEvent } from "react";
import styled from "styled-components";
import DropDown from "../../common/category";
import { IElements, ICategory, ISelectedElement } from "./index.type";
import HandleCanvas from "./HandleCanvas";
import testImg from "../../../assets/images/mission/test.jpg";

interface Props {
    tool: "select" | "move" | "bounding";
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
    categoryList: ICategory[];
    selectedElement: ISelectedElement | null;
    setSelectedElement: Dispatch<SetStateAction<ISelectedElement | null>>;
}

const StyledWrap = styled.section`
    display: flex;
    flex: 1;
    position: relative;
`;

const StyledCanvas = styled.canvas`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: gray;
`;

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

const resizePoint = 9;

function Canvas({ tool, elements, setElements, categoryList, selectedElement, setSelectedElement }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [category, setCategory] = useState<ICategory>(categoryList[0]);
    const canvasSizeRef = useRef({ x: 0, y: 0 });

    // const [isGrabbing, setIsGrabbing] = useState(false);
    const [scale, setScale] = useState<number>(1);
    const [offsetPos, setOffsetPos] = useState<Point>(ORIGIN);
    const [mousePos, setMousePos] = useState<Point>(ORIGIN);
    const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN);
    const isResetRef = useRef<boolean>(false);
    const lastMousePosRef = useRef<Point>(ORIGIN);
    const lastOffsetRef = useRef<Point>(ORIGIN);

    useEffect(() => {
        const canvas = canvasRef.current!;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        canvasSizeRef.current.x = canvas.offsetWidth;
        canvasSizeRef.current.y = canvas.offsetHeight;

        const context = canvas.getContext("2d");

        setCtx(context);
    }, []);

    useEffect(() => {
        lastOffsetRef.current = offsetPos;
    }, [offsetPos]);

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

    const handleImgMouseDown = useCallback((event: MouseEvent) => {
        lastMousePosRef.current = { x: event.pageX, y: event.pageY };
    }, []);

    const handleImgMouseMove = useCallback(
        (event: MouseEvent) => {
            // const { offsetX, offsetY } = event.nativeEvent;
            if (ctx) {
                const lastMousePos = lastMousePosRef.current;
                const currentMousePos = { x: event.pageX, y: event.pageY }; // use document so can pan off element
                lastMousePosRef.current = currentMousePos;

                const mouseDiff = diffPoints(currentMousePos, lastMousePos);
                setOffsetPos((prevOffset) => addPoints(prevOffset, mouseDiff));
            }
            handleUpdateMouse(event);
        },
        [ctx, handleUpdateMouse]
    );

    const handleImgMouseUp = useCallback(() => {}, []);

    useLayoutEffect(() => {
        if (ctx && lastOffsetRef.current) {
            const offsetDiff = scalePoint(diffPoints(offsetPos, lastOffsetRef.current), scale);
            ctx.translate(offsetDiff.x, offsetDiff.y);
            setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
            isResetRef.current = false;
        }
    }, [ctx, offsetPos, scale]);

    const reRender = useCallback(() => {
        // const canvas = canvasRef.current!;
        // ctx?.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        elements.forEach(({ id, sX, sY, cX, cY, color }) => {
            // 기존 strokeRect는 보존하되 잔상 제거
            const resizePointRect = resizePoint + 3; // +3 미세 조절
            const width = cX - sX;
            const height = cY - sY;
            ctx?.setLineDash([0]);
            // ctx!.globalAlpha = 1;
            ctx!.strokeStyle = color;
            ctx!.lineWidth = 2;
            ctx?.strokeRect(sX, sY, width, height);
            // console.log("렌더링", viewportTopLeft.x);
            if (selectedElement) {
                // 현재 선택중인 rect 색상 변경
                if (id === selectedElement.id) {
                    ctx!.fillStyle = "white";
                    ctx?.strokeRect(sX, sY, width, height);

                    ctx?.strokeRect(cX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);
                    ctx?.fillRect(cX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);

                    ctx?.strokeRect(sX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);
                    ctx?.fillRect(sX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);

                    ctx?.strokeRect(sX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);
                    ctx?.fillRect(sX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);

                    ctx?.strokeRect(cX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);
                    ctx?.fillRect(cX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);
                }
            }
        });
    }, [ctx, elements, selectedElement]);

    useEffect(() => {
        if (tool === "bounding") {
            setSelectedElement(null);
        }
    }, [tool, setSelectedElement]);

    // draw
    useLayoutEffect(() => {
        if (ctx) {
            // clear canvas but maintain transform
            const storedTransform = ctx.getTransform();

            ctx.canvas.width = ctx.canvas.width!;
            ctx.setTransform(storedTransform);
            ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height); // ??
            reRender();
        }
    }, [ctx, scale, offsetPos, reRender]);

    const handleImgWheel = useCallback(
        (event: WheelEvent) => {
            if (ctx) {
                const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
                const viewportTopLeftDelta = {
                    x: (mousePos.x / scale) * (1 - 1 / zoom),
                    y: (mousePos.y / scale) * (1 - 1 / zoom),
                };
                const newViewportTopLeft = addPoints(viewportTopLeft, viewportTopLeftDelta);

                ctx.translate(viewportTopLeft.x, viewportTopLeft.y);
                ctx.scale(zoom, zoom);
                ctx.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);

                setViewportTopLeft(newViewportTopLeft);
                setScale(scale * zoom);
                isResetRef.current = false;
            }
            handleUpdateMouse(event);
        },
        [ctx, mousePos.x, mousePos.y, viewportTopLeft, scale, handleUpdateMouse]
    );

    return (
        <StyledWrap>
            {tool === "bounding" && <DropDown category={category} setCategory={setCategory} categoryList={categoryList} isAbsolute={true} />}
            <StyledCanvas ref={canvasRef} />
            <HandleCanvas
                tool={tool}
                elements={elements}
                setElements={setElements}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                category={category}
                handleImgWheel={handleImgWheel}
                handleImgMouseDown={handleImgMouseDown}
                handleImgMouseMove={handleImgMouseMove}
                handleImgMouseUp={handleImgMouseUp}
                viewportTopLeft={viewportTopLeft}
                offsetPos={offsetPos}
            />
        </StyledWrap>
    );
}

export default Canvas;
