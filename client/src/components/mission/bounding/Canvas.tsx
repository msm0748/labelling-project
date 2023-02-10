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

function Canvas({ tool, elements, setElements, categoryList, selectedElement, setSelectedElement, isReset, setIsReset }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [category, setCategory] = useState<ICategory>(categoryList[0]);
    const canvasSizeRef = useRef({ x: 0, y: 0 });

    const [scale, setScale] = useState<number>(1);
    const [offsetPos, setOffsetPos] = useState<Point>(ORIGIN);
    const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN);
    const mousePosRef = useRef<Point>(ORIGIN);
    const lastMousePosRef = useRef<Point>(ORIGIN);
    const lastOffsetRef = useRef<Point>(ORIGIN);
    const isZoomRef = useRef<boolean>(false);
    const [isImgMove, setIsImgMove] = useState<boolean>(false);
    const isGrabbingRef = useRef<boolean>(false);

    const RESIZE_POINT = 9 / scale;

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

    useLayoutEffect(() => {
        if (ctx && lastOffsetRef.current) {
            const offsetDiff = scalePoint(diffPoints(offsetPos, lastOffsetRef.current), scale);
            ctx.translate(offsetDiff.x, offsetDiff.y);
            setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
            setIsReset(false);
        }
    }, [ctx, offsetPos, scale, setIsReset]);

    const cutLineStroke = useCallback(
        (sX: number, sY: number, cX: number, cY: number) => {
            if (!ctx) return;
            ctx.setLineDash([5, 5]);
            const width = cX - sX;
            const height = cY - sY;
            const cutLineX = width - width * 0.95;
            const cutLineY = height - height * 0.95;

            const cutLine = Math.min(cutLineX, cutLineY);

            ctx.strokeRect(sX + cutLine / 2, sY + cutLine / 2, width - cutLine, height - cutLine);
        },
        [ctx]
    );

    const draw = useCallback(
        (getElementId?: number) => {
            if (!ctx) return;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
            elements.forEach(({ id, sX, sY, cX, cY, color }) => {
                const resizePointRect = RESIZE_POINT + 3 / scale; // +3 미세 조절
                const width = cX - sX;
                const height = cY - sY;
                ctx.setLineDash([0]);
                ctx.strokeStyle = color;
                ctx.lineWidth = 2 / scale;
                ctx.strokeRect(sX, sY, width, height);

                if (getElementId === id) {
                    if (!selectedElement || selectedElement.id !== getElementId) {
                        ctx.globalAlpha = 0.5;
                        ctx.fillStyle = color;
                        ctx.fillRect(sX, sY, width, height);
                        ctx.globalAlpha = 1;
                    }
                }

                if (selectedElement) {
                    // 현재 선택중인 rect 색상 변경
                    if (id === selectedElement.id) {
                        ctx.fillStyle = "white";

                        if (tool === "select") {
                            ctx.strokeRect(cX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);
                            ctx.fillRect(cX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);

                            ctx.strokeRect(sX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);
                            ctx.fillRect(sX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);

                            ctx.strokeRect(sX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);
                            ctx.fillRect(sX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);

                            ctx.strokeRect(cX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);
                            ctx.fillRect(cX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);
                        }

                        cutLineStroke(sX, sY, cX, cY);
                    }
                }
            });
        },
        [ctx, elements, selectedElement, RESIZE_POINT, scale, cutLineStroke, tool]
    );

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
            draw();
        }
    }, [ctx, scale, offsetPos, draw, isReset]);

    const calculateMouse = useCallback((event: MouseEvent) => {
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

    const getMouseOverElement = useCallback(
        (element: ISelectedElement | undefined) => {
            if (element) {
                draw(element.id);
            } else {
                draw();
            }
        },
        [draw]
    );

    const handleImgMouseDown = useCallback(
        (event: MouseEvent, handleCtx: CanvasRenderingContext2D) => {
            const { offsetX, offsetY } = event.nativeEvent;
            lastMousePosRef.current = { x: offsetX, y: offsetY };
            if (isImgMove === true || tool === "move") {
                isGrabbingRef.current = true;
                handleCtx.canvas.style.cursor = "grabbing";
            }
        },
        [tool, isImgMove]
    );

    const handleImgMouseMove = useCallback(
        (event: MouseEvent, handleCtx: CanvasRenderingContext2D) => {
            const { offsetX, offsetY } = event.nativeEvent;
            calculateMouse(event);

            if (isImgMove === true || tool === "move") {
                handleCtx.canvas.style.cursor = "grab";
                if (!isGrabbingRef.current) return;
                handleCtx.canvas.style.cursor = "grabbing";

                if (ctx) {
                    const lastMousePos = lastMousePosRef.current;
                    const currentMousePos = { x: offsetX, y: offsetY }; // use document so can pan off element
                    lastMousePosRef.current = currentMousePos;

                    const mouseDiff = diffPoints(currentMousePos, lastMousePos);
                    setOffsetPos((prevOffset) => addPoints(prevOffset, mouseDiff));
                }
            }
        },
        [ctx, calculateMouse, tool, isImgMove]
    );

    const handleImgMouseUp = useCallback(
        (handleCtx: CanvasRenderingContext2D) => {
            if (isImgMove === true || tool === "move") {
                isGrabbingRef.current = false;
                handleCtx.canvas.style.cursor = "grab";
            }
        },
        [tool, isImgMove]
    );

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
                setIsReset(false);
                setOffsetPos((prev) => ({ x: prev.x - event.deltaX, y: prev.y - event.deltaY }));
            }
        },
        [ctx, viewportTopLeft, scale, setIsReset]
    );

    //img move
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                setIsImgMove(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                setIsImgMove(false);
                isGrabbingRef.current = false;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    //img zoom
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
                handleImgMouseUp={handleImgMouseUp}
                viewportTopLeft={viewportTopLeft}
                scale={scale}
                RESIZE_POINT={RESIZE_POINT}
                isImgMove={isImgMove}
                getMouseOverElement={getMouseOverElement}
            />
        </StyledWrap>
    );
}

export default Canvas;
