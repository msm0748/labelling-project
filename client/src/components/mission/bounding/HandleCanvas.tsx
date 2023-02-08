import { MouseEvent, useRef, useEffect, Dispatch, SetStateAction, useState, useCallback } from "react";
import styled from "styled-components";
import { IElements, ICategory, ISelectedElement } from "./index.type";

interface Props {
    tool: "select" | "move" | "bounding";
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
    selectedElement: ISelectedElement | null;
    setSelectedElement: Dispatch<SetStateAction<ISelectedElement | null>>;
    category: ICategory;
    handleImgWheel: (event: React.WheelEvent) => void;
    handleImgMouseDown: (event: MouseEvent) => void;
    handleImgMouseMove: (event: MouseEvent) => void;
    viewportTopLeft: Point;
    handleUpdateMouse: (event: MouseEvent) => void;
    scale: number;
}

type Point = {
    x: number;
    y: number;
};

const StyledHandler = styled.canvas`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
`;

const resizePoint = 9;

const adjustElementCoordinates = (element: IElements) => {
    //오른쪽에서 왼쪽으로 그릴때 좌표값 제대로  잡아주기
    const { sX, sY, cX, cY, ...rest } = element;
    const minX = Math.min(sX, cX);
    const maxX = Math.max(sX, cX);
    const minY = Math.min(sY, cY);
    const maxY = Math.max(sY, cY);
    return { sX: minX, sY: minY, cX: maxX, cY: maxY, ...rest };
};

const nearPoint = (offsetX: number, offsetY: number, x: number, y: number, name: string, cX?: number, cY?: number) => {
    if (cX && cY) {
        switch (name) {
            case "t":
            case "b":
                return x < offsetX && cX > offsetX && Math.abs(offsetY - y) < resizePoint ? name : null;
            case "l":
            case "r":
                return y < offsetY && cY > offsetY && Math.abs(offsetX - x) < resizePoint ? name : null;
        }
    } else {
        return Math.abs(offsetX - x) < resizePoint && Math.abs(offsetY - y) < resizePoint ? name : null;
    }
};

const positionWithinElement = (offsetX: number, offsetY: number, element: IElements) => {
    const { sX, sY, cX, cY } = element;
    const topLeft = nearPoint(offsetX, offsetY, sX, sY, "tl");
    const topRight = nearPoint(offsetX, offsetY, cX, sY, "tr");
    const bottomLeft = nearPoint(offsetX, offsetY, sX, cY, "bl");
    const bottomRight = nearPoint(offsetX, offsetY, cX, cY, "br");

    const top = nearPoint(offsetX, offsetY, sX, sY, "t", cX, cY);
    const bottom = nearPoint(offsetX, offsetY, sX, cY, "b", cX, cY);
    const right = nearPoint(offsetX, offsetY, cX, sY, "r", cX, cY);
    const left = nearPoint(offsetX, offsetY, sX, sY, "l", cX, cY);

    const inside = offsetX >= sX && offsetX <= cX && offsetY >= sY && offsetY <= cY ? "inside" : null;

    return topLeft || topRight || bottomLeft || bottomRight || top || right || bottom || left || inside;
};

const cursorForPosition = (position: string) => {
    switch (position) {
        case "tl":
        case "br":
            return "nwse-resize";
        case "tr":
        case "bl":
            return "nesw-resize";
        case "t":
        case "b":
            return "row-resize";
        case "l":
        case "r":
            return "col-resize";
        default:
            return "move";
    }
};

const resizedCoordinates = (offsetX: number, offsetY: number, position: string, coordinates: IElements) => {
    const { sX, sY, cX, cY } = coordinates;
    switch (position) {
        case "tl":
            return { sX: offsetX, sY: offsetY, cX, cY };
        case "tr":
            return { sX, sY: offsetY, cX: offsetX, cY };
        case "br":
            return { sX, sY, cX: offsetX, cY: offsetY };
        case "bl":
            return { sX: offsetX, sY, cX, cY: offsetY };
        case "b":
            return { sX, sY, cX, cY: offsetY };
        case "t":
            return { sX, sY: offsetY, cX, cY };
        case "r":
            return { sX, sY, cX: offsetX, cY };
        case "l":
            return { sX: offsetX, sY, cX, cY };
        default:
            return { sX, sY, cX, cY };
    }
};

function HandleCanvas({
    tool,
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    category,
    handleImgWheel,
    handleImgMouseDown,
    handleImgMouseMove,
    viewportTopLeft,
    handleUpdateMouse,
    scale,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [action, setAction] = useState<"none" | "moving" | "drawing" | "resizing">("none");
    const [isGrabbing, setIsGrabbing] = useState(false);
    const isSpaceDownRef = useRef<boolean>(false);

    useEffect(() => {
        const canvas = canvasRef.current!;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const context = canvas.getContext("2d");

        setCtx(context);
    }, []);

    useEffect(() => {
        if (tool !== "bounding") {
            const canvas = canvasRef.current!;
            ctx?.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        }
    }, [ctx, tool]);

    const crosshair = useCallback(
        (offsetX: number, offsetY: number) => {
            const canvas = canvasRef.current!;
            let x = offsetX;
            let y = offsetY;
            ctx?.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            if (tool !== "bounding") return;
            ctx?.setLineDash([2, 5]);
            ctx!.lineWidth = 1;
            ctx!.globalAlpha = 1;
            ctx!.strokeStyle = "black";
            ctx?.beginPath();
            ctx?.moveTo(0, y);
            ctx?.lineTo(canvas.offsetWidth, y);
            ctx?.stroke();
            ctx?.closePath();

            ctx?.beginPath();
            ctx?.moveTo(x, 0);
            ctx?.lineTo(x, canvas.offsetHeight);
            ctx?.stroke();
            ctx?.closePath();
        },
        [ctx, tool]
    );

    const createElement = (id: number, sX: number, sY: number, cX: number, cY: number, color: string = category.color, title: string = category.title) => {
        return { id, sX, sY, cX, cY, color, title };
    };

    const updateElement = (id: number, sX: number, sY: number, cX: number, cY: number, color: string, title: string) => {
        const updateElement = createElement(id, sX, sY, cX, cY, color, title);

        const elementsCopy = [...elements].map((element) => (element.id === id ? updateElement : element));
        setElements(elementsCopy);
    };

    const getZoomPosition = useCallback(
        (offsetX: number, offsetY: number) => {
            return { x: offsetX / scale + viewportTopLeft.x, y: offsetY / scale + viewportTopLeft.y };
        },
        [viewportTopLeft, scale]
    );

    const getElementPosition = useCallback(
        (offsetX: number, offsetY: number, elements: IElements[]) => {
            const { x, y } = getZoomPosition(offsetX, offsetY);
            let elementsCopy = [...elements];
            if (selectedElement) {
                // 현재 selectedElement가 있으면 1순위로 수정되게끔
                const selectedElementCopy = elementsCopy.find((element) => element.id === selectedElement.id); // 최신 selectedElement값 가져오기 위한 복사(마우스 움직일때 selectedElement는 최신값이 아님)
                elementsCopy = elementsCopy.filter((element) => element.id !== selectedElement.id); //현재 selectedElement값을 없애고 밑에서 최신 selectedElement를 넣어줌
                if (selectedElementCopy) {
                    elementsCopy = [selectedElementCopy, ...elementsCopy]; //
                    return elementsCopy
                        .map((element) => ({ ...element, position: positionWithinElement(x, y, element) }))
                        .find((element) => element.position !== null);
                }
            }

            return elementsCopy
                .reverse()
                .map((element) => ({ ...element, position: positionWithinElement(x, y, element) }))
                .find((element) => element.position !== null); // selectedElement 가 없으면 마지막 rect 값 가져옴
        },
        [selectedElement, getZoomPosition]
    );

    const handleMouseDown = (e: MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (isSpaceDownRef.current === true || tool === "move") {
            setIsGrabbing(true);
            handleImgMouseDown(e);
            canvasRef.current!.style.cursor = "grabbing";
            return;
        }
        if (tool === "bounding") {
            if (action !== "none") return;
            setAction("drawing");
            const id = +new Date();
            const { x, y } = getZoomPosition(offsetX, offsetY);
            const element = createElement(id, x, y, x, y);
            console.log(x, y);
            setElements((prev) => [...prev, element]);
        } else if (tool === "select") {
            const element = getElementPosition(offsetX, offsetY, elements);
            if (element) {
                if (element.position === "inside") {
                    setAction("moving");
                } else {
                    setAction("resizing");
                }
                setSelectedElement({ ...element, startX: offsetX, startY: offsetY });
            } else {
                setSelectedElement(null);
            }
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        crosshair(offsetX, offsetY);
        handleUpdateMouse(e);
        if (isSpaceDownRef.current === true || tool === "move") {
            canvasRef.current!.style.cursor = "grab";
            if (isGrabbing !== true) return;
            handleImgMouseMove(e);
            canvasRef.current!.style.cursor = "grabbing";
            return;
        }
        if (tool === "bounding") {
            if (action === "drawing") {
                const { x, y } = getZoomPosition(offsetX, offsetY);
                const index = elements.length - 1;
                const { id, sX, sY, color, title } = elements[index];
                updateElement(id, sX, sY, x, y, color, title);
            }
        } else if (tool === "select") {
            const element = getElementPosition(offsetX, offsetY, elements);
            canvasRef.current!.style.cursor = element ? cursorForPosition(element.position!) : "default";

            if (action === "moving") {
                const canvas = canvasRef.current!;
                if (!selectedElement) return;
                const { id, sX, sY, cX, cY, color, title, startX, startY } = selectedElement;
                if (!(startX && startY)) return;
                const width = cX - sX;
                const height = cY - sY;

                const x = startX - sX;
                const y = startY - sY;
                let newX = offsetX - x;
                let newY = offsetY - y;
                //자연스럽게 이동

                if (newX < 0) newX = 0;
                if (newY < 0) newY = 0;
                if (newX + width > canvas!.width) newX = canvas.width - width;
                if (newY + height > canvas!.height) newY = canvas.height - height;
                //canvas 이탈 금지

                updateElement(id, newX, newY, newX + width, newY + height, color, title);
            } else if (action === "resizing") {
                if (!selectedElement) return;
                const { position, ...coordinates } = selectedElement;
                const { id, color, title } = selectedElement;
                const { x, y } = getZoomPosition(offsetX, offsetY);
                if (!position) return;
                const { sX, sY, cX, cY } = resizedCoordinates(x, y, position, coordinates);

                updateElement(id, sX, sY, cX, cY, color, title);
            }
        }
    };
    const handleMouseUp = (e: MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (isSpaceDownRef.current === true || tool === "move") {
            setIsGrabbing(false);
            canvasRef.current!.style.cursor = "grab";
            return;
        }
        if (tool === "bounding") {
            const index = elements.length - 1;
            const { id, sX, sY, cX, cY, color, title } = adjustElementCoordinates(elements[index]);
            if (Math.abs(sX - offsetX) < 5 && Math.abs(sY - offsetY) < 5) return; // 마우스 클릭으로도 그릴 수 있게
            updateElement(id, sX, sY, cX, cY, color, title);
        } else if (tool === "select") {
            if (selectedElement) {
                if (action === "resizing") {
                    const element = elements.find((element) => element.id === selectedElement.id);
                    if (!element) return;
                    const { id, sX, sY, cX, cY, color, title } = adjustElementCoordinates(element);
                    updateElement(id, sX, sY, cX, cY, color, title);
                }
                const updateSelectedElement = [...elements].find((element) => element.id === selectedElement.id);
                if (updateSelectedElement) {
                    setSelectedElement(updateSelectedElement);
                }
            }
        }
        setAction("none");
    };

    const handleWheel = (e: React.WheelEvent) => {
        handleUpdateMouse(e);
        handleImgWheel(e);
    };

    useEffect(() => {
        if (tool === "move") {
            canvasRef.current!.style.cursor = "grab";
        } else {
            canvasRef.current!.style.cursor = "default";
        }
    }, [tool]);

    /** 이미지 이동 */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                isSpaceDownRef.current = true;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                isSpaceDownRef.current = false;
                setIsGrabbing(false);
                canvasRef.current!.style.cursor = "default";
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const preventDefault = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        };
        canvas.addEventListener("wheel", preventDefault, { passive: false });
        return () => {
            canvas.removeEventListener("wheel", preventDefault);
        };
    }, []);

    return (
        <StyledHandler
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
        ></StyledHandler>
    );
}

export default HandleCanvas;
