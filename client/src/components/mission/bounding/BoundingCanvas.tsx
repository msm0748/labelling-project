import { MouseEvent, useRef, useEffect, Dispatch, SetStateAction, useState, useCallback, useLayoutEffect } from "react";
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
    setIsReset: Dispatch<SetStateAction<boolean>>;
    isReset: boolean;
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

function diffPoints(p1: Point, p2: Point) {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
}

function addPoints(p1: Point, p2: Point) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

function scalePoint(p1: Point, scale: number) {
    return { x: p1.x / scale, y: p1.y / scale };
}
const ORIGIN = { x: 0, y: 0 };
const MAX_SCALE = 4;
const MIN_SCALE = 0.1;
const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll

const image = new Image();
image.src = testImg;

const resizePoint = 9;

function Canvas({ tool, elements, setElements, categoryList, selectedElement, setSelectedElement, isReset, setIsReset }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [category, setCategory] = useState<ICategory>(categoryList[0]);
    const canvasSizeRef = useRef({ x: 0, y: 0 });

    const [scale, setScale] = useState<number>(1);
    const [offsetPos, setOffsetPos] = useState<Point>(ORIGIN);
    const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN);
    const lastMousePosRef = useRef<Point>(ORIGIN);
    const lastOffsetRef = useRef<Point>(ORIGIN);
    const isZoomRef = useRef<boolean>(false);
    const mousePosRef = useRef<Point>(ORIGIN);

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

    /* reset */
    useLayoutEffect(() => {
        const canvas = canvasRef.current!;
        if (canvas && ctx) {
            // get new drawing context
            if (isReset) {
                ctx.canvas.width = canvas.offsetWidth;
                ctx.canvas.height = canvas.offsetHeight;
                ctx.scale(1, 1);
                setScale(1);

                // reset state and refs
                setOffsetPos(ORIGIN);
                mousePosRef.current = ORIGIN;
                setViewportTopLeft(ORIGIN);
                lastOffsetRef.current = ORIGIN;
                lastMousePosRef.current = ORIGIN;
            }
        }
    }, [ctx, isReset]);

    const handleUpdateMouse = useCallback((event: MouseEvent) => {
        const { offsetX, offsetY } = event.nativeEvent;
        if (canvasRef.current) {
            const viewportMousePos = { x: offsetX, y: offsetY };
            const topLeftCanvasPos = {
                x: canvasRef.current.offsetLeft,
                y: canvasRef.current.offsetTop,
            };
            mousePosRef.current = diffPoints(viewportMousePos, topLeftCanvasPos);
        }
    }, []);

    const handleImgMouseDown = useCallback((event: MouseEvent) => {
        const { offsetX, offsetY } = event.nativeEvent;
        lastMousePosRef.current = { x: offsetX, y: offsetY };
    }, []);

    const handleImgMouseMove = useCallback(
        (event: MouseEvent) => {
            const { offsetX, offsetY } = event.nativeEvent;
            if (ctx) {
                const lastMousePos = lastMousePosRef.current;
                const currentMousePos = { x: offsetX, y: offsetY }; // use document so can pan off element
                lastMousePosRef.current = currentMousePos;

                const mouseDiff = diffPoints(currentMousePos, lastMousePos);
                setOffsetPos((prevOffset) => addPoints(prevOffset, mouseDiff));
            }
        },
        [ctx]
    );

    useLayoutEffect(() => {
        if (ctx && lastOffsetRef.current) {
            const offsetDiff = scalePoint(diffPoints(offsetPos, lastOffsetRef.current), scale);
            ctx.translate(offsetDiff.x, offsetDiff.y);
            setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
            setIsReset(false);
        }
    }, [ctx, offsetPos, scale, setIsReset]);

    const reRender = useCallback(() => {
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
    useEffect(() => {
        if (ctx) {
            // clear canvas but maintain transform
            const storedTransform = ctx.getTransform();

            ctx.canvas.width = ctx.canvas.width!;
            ctx.setTransform(storedTransform);
            ctx?.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height); // ??
            reRender();
        }
    }, [ctx, scale, offsetPos, reRender, isReset]);

    const handleImgWheel = useCallback(
        (event: React.WheelEvent) => {
            if (isZoomRef.current) {
                if (ctx) {
                    const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;
                    const viewportTopLeftDelta = {
                        x: (mousePosRef.current.x / scale) * (1 - 1 / zoom),
                        y: (mousePosRef.current.y / scale) * (1 - 1 / zoom),
                    };
                    const newViewportTopLeft = addPoints(viewportTopLeft, viewportTopLeftDelta);
                    const newScale = scale * zoom;
                    if (MIN_SCALE > newScale || newScale > MAX_SCALE) return;

                    ctx.translate(viewportTopLeft.x, viewportTopLeft.y);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);

                    setViewportTopLeft(newViewportTopLeft);
                    setScale(newScale);
                    setIsReset(false);
                }
            } else {
                setOffsetPos((prev) => ({ x: prev.x - event.deltaX, y: prev.y - event.deltaY }));
                setIsReset(false);
            }
        },
        [ctx, viewportTopLeft, scale, setIsReset]
    );
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Control" || e.key === "Meta") {
                isZoomRef.current = true;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Control" || e.key === "Meta") {
                isZoomRef.current = false;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

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
                viewportTopLeft={viewportTopLeft}
                handleUpdateMouse={handleUpdateMouse}
                scale={scale}
            />
        </StyledWrap>
    );
}

export default Canvas;
