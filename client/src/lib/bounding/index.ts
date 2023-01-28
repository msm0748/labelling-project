import { MouseEvent } from "react";
import { IElements } from "./index.type";

class Bounding {
    private canvas: HTMLCanvasElement | null;
    private ctx: CanvasRenderingContext2D | null;
    public elements: IElements[];
    private sX: number;
    private sY: number;
    private cX: number;
    private cY: number;
    private action: "none" | "moving" | "drawing" | "resizing";
    private tool: "select" | "move" | "bounding";
    private selectedElement: IElements | null;
    private updateElement: IElements | null;
    private resizePoint: number;

    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.elements = [];
        this.sX = 0;
        this.sY = 0;
        this.cX = 0;
        this.cY = 0;
        this.action = "none";
        this.tool = "select";
        this.selectedElement = null;
        this.updateElement = null;
        this.resizePoint = 12;
    }
    init(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d")!;
    }
    tools(tool: "select" | "move" | "bounding") {
        this.tool = tool;
        this.selectedElement = null;
        this.canvas!.style.cursor = "default";
        this.action = "none";
        this.reRednder();
    }
    reRednder() {
        this.ctx?.clearRect(0, 0, this.canvas!.offsetWidth, this.canvas!.offsetHeight);
        this.elements.forEach(({ sX, sY, cX, cY }, index) => {
            // 기존 strokeRect는 보존하되 잔상 제거

            const width = cX - sX;
            const height = cY - sY;
            this.ctx?.setLineDash([]);
            this.ctx!.strokeStyle = "green";
            this.ctx?.strokeRect(sX, sY, width, height);
            if (this.selectedElement) {
                // 현재 선택중인 rect 색상 변경
                if (index === this.selectedElement.id) {
                    this.ctx!.strokeStyle = "red";
                    this.ctx!.fillStyle = "white";
                    this.ctx?.strokeRect(sX, sY, width, height);

                    this.ctx?.strokeRect(cX - this.resizePoint / 2, sY - this.resizePoint / 2, this.resizePoint, this.resizePoint);
                    this.ctx?.fillRect(cX - this.resizePoint / 2, sY - this.resizePoint / 2, this.resizePoint, this.resizePoint);

                    this.ctx?.strokeRect(sX - this.resizePoint / 2, sY - this.resizePoint / 2, this.resizePoint, this.resizePoint);
                    this.ctx?.fillRect(sX - this.resizePoint / 2, sY - this.resizePoint / 2, this.resizePoint, this.resizePoint);

                    this.ctx?.strokeRect(sX - this.resizePoint / 2, cY - this.resizePoint / 2, this.resizePoint, this.resizePoint);
                    this.ctx?.fillRect(sX - this.resizePoint / 2, cY - this.resizePoint / 2, this.resizePoint, this.resizePoint);

                    this.ctx?.strokeRect(cX - this.resizePoint / 2, cY - this.resizePoint / 2, this.resizePoint, this.resizePoint);
                    this.ctx?.fillRect(cX - this.resizePoint / 2, cY - this.resizePoint / 2, this.resizePoint, this.resizePoint);
                }
            }
        });
        this.crosshair();
    }
    crosshair() {
        if (this.tool !== "bounding") return;

        this.ctx?.setLineDash([2, 5]);
        this.ctx!.strokeStyle = "black";
        this.ctx?.beginPath();
        this.ctx?.moveTo(0, this.cY);
        this.ctx?.lineTo(this.canvas!.offsetWidth, this.cY);
        this.ctx?.stroke();
        this.ctx?.closePath();

        this.ctx?.beginPath();
        this.ctx?.moveTo(this.cX, 0);
        this.ctx?.lineTo(this.cX, this.canvas!.offsetHeight);
        this.ctx?.stroke();
        this.ctx?.closePath();
    }
    handleMouseDown(e: MouseEvent) {
        const { offsetX, offsetY } = e.nativeEvent;
        if (this.tool === "bounding") {
            if (this.action !== "none") return;
            this.sX = offsetX;
            this.sY = offsetY;
            this.action = "drawing";
        } else if (this.tool === "select") {
            this.sX = offsetX;
            this.sY = offsetY;

            const element = this.getElementPosition(offsetX, offsetY, this.elements);
            if (element) {
                if (element.position === "inside") {
                    this.action = "moving";
                } else {
                    this.action = "resizing";
                }
                // if (this.selectedElement) {
                //     if (this.positionWithinElement(offsetX, offsetY, this.selectedElement)) {
                //         return;
                //     }
                // } // 현재 선택중인 element 있으면 선택된거 이동
                this.selectedElement = element;
            } else {
                this.selectedElement = null;
            }
        }
        this.reRednder();
    }
    handleMouseMove(e: MouseEvent) {
        this.reRednder();
        const { offsetX, offsetY } = e.nativeEvent;
        this.cX = offsetX;
        this.cY = offsetY;

        if (this.tool === "bounding") {
            if (this.action === "drawing") {
                const width = offsetX - this.sX;
                const height = offsetY - this.sY;
                this.ctx?.setLineDash([]);
                this.ctx!.strokeStyle = "green";
                this.ctx!.fillStyle = "rgba(173,255,47, 0.5)";
                this.ctx?.fillRect(this.sX, this.sY, width, height);
                this.ctx?.strokeRect(this.sX, this.sY, width, height);
            }
        } else if (this.tool === "select") {
            const element = this.getElementPosition(offsetX, offsetY, this.elements);
            if (this.canvas) {
                this.canvas.style.cursor = element ? this.cursorForPosition(element.position!) : "default";
            }

            if (this.action === "moving") {
                if (this.selectedElement) {
                    const { id, sX, sY, cX, cY } = this.selectedElement;
                    const width = cX - sX;
                    const height = cY - sY;

                    const offsetX = this.sX - sX;
                    const offsetY = this.sY - sY;
                    let newX = this.cX - offsetX;
                    let newY = this.cY - offsetY;
                    //자연스럽게 이동

                    if (newX < 0) newX = 0;
                    if (newY < 0) newY = 0;
                    if (newX + width > this.canvas!.width) newX = this.canvas!.width - width;
                    if (newY + height > this.canvas!.height) newY = this.canvas!.height - height;
                    //canvas 이탈 금지

                    this.updateElement = this.createElement(id, newX, newY, newX + width, newY + height);
                    this.elements[id] = this.updateElement;
                }
            } else if (this.action === "resizing") {
                if (this.selectedElement) {
                    const { position, ...coordinates } = this.selectedElement;
                    const { id } = this.selectedElement;
                    if (position) {
                        const { sX, sY, cX, cY } = this.resizedCoordinates(offsetX, offsetY, position, coordinates);

                        const element = this.createElement(id, sX, sY, cX, cY);
                        const adjustElement = this.adjustElementCoordinates(element);

                        this.updateElement = adjustElement;
                        this.elements[id] = this.updateElement;
                    }
                }
            }
        }
    }
    handleMouseUp(e: MouseEvent) {
        const { offsetX, offsetY } = e.nativeEvent;
        if (this.tool === "bounding") {
            if (Math.abs(this.sX - offsetX) < 5 && Math.abs(this.sY - offsetY) < 5) return;
            const element = this.createElement(this.elements.length, this.sX, this.sY, offsetX, offsetY);
            const adjustElement = this.adjustElementCoordinates(element);
            this.elements = [...this.elements, adjustElement];
        } else if (this.tool === "select") {
            if (this.updateElement) {
                this.elements = [...this.elements];
                this.selectedElement = this.updateElement; // 선택 중인 Rect 최신화
                this.updateElement = null;
            }
        }
        this.action = "none";
        this.reRednder();
    }
    createElement(id: number, sX: number, sY: number, cX: number, cY: number) {
        return { id, sX, sY, cX, cY };
    }
    getElementPosition = (cX: number, cY: number, elements: IElements[]) => {
        const elementsCopy = [...elements].reverse(); // 마지막 rect 값 가져옴
        return elementsCopy
            .map((element) => ({ ...element, position: this.positionWithinElement(cX, cY, element) }))
            .find((element) => element.position !== null);
    };
    cursorForPosition(position: string) {
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
    }

    positionWithinElement = (offsetX: number, offsetY: number, element: IElements) => {
        const { sX, sY, cX, cY } = element;
        const topLeft = this.nearPoint(offsetX, offsetY, sX, sY, "tl");
        const topRight = this.nearPoint(offsetX, offsetY, cX, sY, "tr");
        const bottomLeft = this.nearPoint(offsetX, offsetY, sX, cY, "bl");
        const bottomRight = this.nearPoint(offsetX, offsetY, cX, cY, "br");

        const top = this.nearPoint(offsetX, offsetY, sX, sY, "t", cX, cY);
        const bottom = this.nearPoint(offsetX, offsetY, sX, cY, "b", cX, cY);
        const right = this.nearPoint(offsetX, offsetY, cX, sY, "r", cX, cY);
        const left = this.nearPoint(offsetX, offsetY, sX, sY, "l", cX, cY);

        const inside = offsetX >= sX && offsetX <= cX && offsetY >= sY && offsetY <= cY ? "inside" : null;

        return topLeft || topRight || bottomLeft || bottomRight || top || right || bottom || left || inside;
    };
    nearPoint(offsetX: number, offsetY: number, x: number, y: number, name: string, cX?: number, cY?: number) {
        const resizePoint = this.resizePoint - 3;
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
    }

    resizedCoordinates(offsetX: number, offsetY: number, position: string, coordinates: IElements) {
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
    }
    adjustElementCoordinates(element: IElements) {
        //오른쪽에서 왼쪽으로 그릴때 좌표값 제대로  잡아주기
        const { id, sX, sY, cX, cY } = element;
        const minX = Math.min(sX, cX);
        const maxX = Math.max(sX, cX);
        const minY = Math.min(sY, cY);
        const maxY = Math.max(sY, cY);
        return { id, sX: minX, sY: minY, cX: maxX, cY: maxY };
    }
}

export default Bounding;
