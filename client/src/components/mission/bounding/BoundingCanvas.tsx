import { MouseEvent, useRef, useEffect, Dispatch, SetStateAction, useState, useCallback } from "react";
import styled from "styled-components";
import DropDown from "../../common/category";
import { IElements, ICategory } from "./index.type";

interface Props {
    tool: "select" | "move" | "bounding";
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
    categoryList: ICategory[];
    selectedElement: IElements | null;
    setSelectedElement: Dispatch<SetStateAction<IElements | null>>;
}

interface IStartPosition {
    startX: number;
    startY: number;
}

const StyledWrap = styled.section`
    display: flex;
    flex: 1;
    position: relative;
`;

const StyledCanvas = styled.canvas`
    width: 100%;
    height: 100%;
`;

function Canvas({ tool, elements, setElements, categoryList, selectedElement, setSelectedElement }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [category, setCategory] = useState<ICategory>(categoryList[0]);
    const [startPosition, setStartPosition] = useState<IStartPosition>({ startX: 0, startY: 0 });
    const [action, setAction] = useState<"none" | "moving" | "drawing" | "resizing">("none");

    const resizePoint = 9;

    useEffect(() => {
        const canvas = canvasRef.current!;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const context = canvas.getContext("2d");
        setCtx(context);
    }, []);

    console.log("렌더링");

    const reRender = useCallback(() => {
        const canvas = canvasRef.current!;
        ctx?.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        elements.forEach(({ sX, sY, cX, cY, color }, index) => {
            // 기존 strokeRect는 보존하되 잔상 제거
            const resizePointRect = resizePoint + 3; // +3 미세 조절
            const width = cX - sX;
            const height = cY - sY;
            ctx?.setLineDash([]);
            ctx!.globalAlpha = 1;
            ctx!.strokeStyle = color;
            ctx?.strokeRect(sX, sY, width, height);
            if (selectedElement) {
                // 현재 선택중인 rect 색상 변경
                if (index === selectedElement.id) {
                    ctx!.strokeStyle = selectedElement.color;
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

    const crosshair = useCallback(
        (offsetX: number, offsetY: number) => {
            const canvas = canvasRef.current!;
            if (tool !== "bounding") return;
            ctx?.setLineDash([2, 5]);
            ctx!.globalAlpha = 1;
            ctx!.strokeStyle = "black";
            ctx?.beginPath();
            ctx?.moveTo(0, offsetY);
            ctx?.lineTo(canvas.offsetWidth, offsetY);
            ctx?.stroke();
            ctx?.closePath();

            ctx?.beginPath();
            ctx?.moveTo(offsetX, 0);
            ctx?.lineTo(offsetX, canvas.offsetHeight);
            ctx?.stroke();
            ctx?.closePath();
        },
        [ctx, tool]
    );

    const createElement = useCallback((id: number, sX: number, sY: number, cX: number, cY: number, color: string, title: string) => {
        return { id, sX, sY, cX, cY, color, title };
    }, []);

    const adjustElementCoordinates = useCallback((element: IElements) => {
        //오른쪽에서 왼쪽으로 그릴때 좌표값 제대로  잡아주기
        const { sX, sY, cX, cY, ...rest } = element;
        const minX = Math.min(sX, cX);
        const maxX = Math.max(sX, cX);
        const minY = Math.min(sY, cY);
        const maxY = Math.max(sY, cY);
        return { sX: minX, sY: minY, cX: maxX, cY: maxY, ...rest };
    }, []);

    const nearPoint = useCallback((offsetX: number, offsetY: number, x: number, y: number, name: string, cX?: number, cY?: number) => {
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
    }, []);

    const positionWithinElement = useCallback(
        (offsetX: number, offsetY: number, element: IElements) => {
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
        },
        [nearPoint]
    );

    const getElementPosition = useCallback(
        (cX: number, cY: number, elements: IElements[]) => {
            const elementsCopy = [...elements].reverse(); // 마지막 rect 값 가져옴
            return elementsCopy
                .map((element) => ({ ...element, position: positionWithinElement(cX, cY, element) }))
                .find((element) => element.position !== null);
        },
        [positionWithinElement]
    );

    const cursorForPosition = useCallback((position: string) => {
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
    }, []);

    const resizedCoordinates = useCallback((offsetX: number, offsetY: number, position: string, coordinates: IElements) => {
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
    }, []);

    const handleMouseDown = (e: MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (tool === "bounding") {
            if (action !== "none") return;
            setStartPosition({ startX: offsetX, startY: offsetY });
            setAction("drawing");
        } else if (tool === "select") {
            setStartPosition({ startX: offsetX, startY: offsetY });

            const element = getElementPosition(offsetX, offsetY, elements);
            if (element) {
                if (element.position === "inside") {
                    setAction("moving");
                } else {
                    setAction("resizing");
                }
                setSelectedElement(element);
            } else {
                setSelectedElement(null);
            }
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const { startX, startY } = startPosition;
        const canvas = canvasRef.current!;
        reRender();
        crosshair(offsetX, offsetY);
        if (tool === "bounding") {
            if (action === "drawing") {
                const width = offsetX - startX;
                const height = offsetY - startY;
                ctx?.setLineDash([]);
                ctx!.strokeStyle = category.color;
                ctx?.strokeRect(startX, startY, width, height);
            }
        } else if (tool === "select") {
            const element = getElementPosition(offsetX, offsetY, elements);
            if (canvas) {
                canvas.style.cursor = element ? cursorForPosition(element.position!) : "default";
            }

            if (action === "moving") {
                if (!selectedElement) return;
                const { id, sX, sY, cX, cY, color, title } = selectedElement;
                const width = cX - sX;
                const height = cY - sY;

                const x = startX - sX;
                const y = startY - sY;
                let newX = offsetX - x;
                let newY = offsetY - y;
                //자연스럽게 이동

                if (newX < 0) newX = 0;
                if (newY < 0) newY = 0;
                if (newX + width > canvas!.width) newX = canvas!.width - width;
                if (newY + height > canvas!.height) newY = canvas!.height - height;
                //canvas 이탈 금지

                const updateElement = createElement(id, newX, newY, newX + width, newY + height, color, title);

                const elementsCopy = [...elements];
                elementsCopy[id] = updateElement;
                setElements(elementsCopy);
            } else if (action === "resizing") {
                if (!selectedElement) return;
                const { position, ...coordinates } = selectedElement;
                const { id, color, title } = selectedElement;
                if (!position) return;
                const { sX, sY, cX, cY } = resizedCoordinates(offsetX, offsetY, position, coordinates);
                const updateElement = createElement(id, sX, sY, cX, cY, color, title);
                const adjustElement = adjustElementCoordinates(updateElement);

                const elementsCopy = [...elements];
                elementsCopy[id] = adjustElement;
                setElements(elementsCopy);
            }
        }
    };
    const handleMouseUp = (e: MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const { startX, startY } = startPosition;
        if (tool === "bounding") {
            if (Math.abs(startX - offsetX) < 5 && Math.abs(startY - offsetY) < 5) return; // 마우스 클릭으로도 그릴 수 있게
            if (action !== "drawing") return;
            const element = createElement(elements.length, startX, startY, offsetX, offsetY, category.color, category.title);
            const adjustElement = adjustElementCoordinates(element);
            setElements((prev) => [...prev, adjustElement]);
        }
        setAction("none");
    };

    useEffect(() => {
        reRender();
        if (tool === "bounding") {
            setSelectedElement(null);
        }
    }, [tool, reRender, selectedElement, elements, setSelectedElement]);

    return (
        <StyledWrap>
            {tool === "bounding" && <DropDown category={category} setCategory={setCategory} categoryList={categoryList} isAbsolute={true} />}
            <StyledCanvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}></StyledCanvas>
        </StyledWrap>
    );
}

export default Canvas;
