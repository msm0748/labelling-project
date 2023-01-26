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
    }
    init(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d")!;
    }
    tools(tool: "select" | "move" | "bounding") {
        this.tool = tool;
        this.selectedElement = null;
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
                    this.ctx?.strokeRect(sX, sY, width, height);
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
        const { offsetX: cX, offsetY: cY } = e.nativeEvent;
        if (this.tool === "bounding") {
            if (this.action !== "none") return;
            this.sX = cX;
            this.sY = cY;
            this.action = "drawing";
        } else if (this.tool === "select") {
            this.sX = cX;
            this.sY = cY;
            const element = this.getElementPosition(cX, cY, this.elements);
            if (element) {
                this.action = "moving";
                this.selectedElement = element;
            }
        }
    }
    handleMouseMove(e: MouseEvent) {
        this.reRednder();
        const { offsetX: cX, offsetY: cY } = e.nativeEvent;
        this.cX = cX;
        this.cY = cY;

        if (this.tool === "bounding") {
            if (this.action === "drawing") {
                const width = cX - this.sX;
                const height = cY - this.sY;
                this.ctx?.setLineDash([]);
                this.ctx!.strokeStyle = "green";
                this.ctx!.fillStyle = "rgba(173,255,47, 0.5)";
                this.ctx?.fillRect(this.sX, this.sY, width, height);
                this.ctx?.strokeRect(this.sX, this.sY, width, height);
            }
        } else if (this.tool === "select") {
            const target = e.target as HTMLCanvasElement;
            console.log(this.getElementPosition(cX, cY, this.elements));
            target.style.cursor = this.getElementPosition(cX, cY, this.elements) ? "move" : "default";

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
                    if (newX < 0) {
                        newX = 0;
                    }
                    if (newY < 0) {
                        newY = 0;
                    }
                    if (newX + width > this.canvas!.width) {
                        newX = this.canvas!.width - width;
                    }
                    if (newY + height > this.canvas!.height) {
                        newY = this.canvas!.height - height;
                    } //canvas 이탈 금지
                    this.updateElement = this.createElement(id, newX, newY, newX + width, newY + height);
                    this.elements[id] = this.updateElement;
                }
            }
        }
    }
    handleMouseUp(e: MouseEvent) {
        const { offsetX: cX, offsetY: cY } = e.nativeEvent;
        if (this.tool === "bounding") {
            if (Math.abs(this.sX - cX) < 5 && Math.abs(this.sY - cY) < 5) return;
            const element = this.createElement(this.elements.length, this.sX, this.sY, cX, cY);
            this.elements = [...this.elements, element];
        } else if (this.tool === "select") {
            if (this.updateElement) {
                this.elements = [...this.elements];
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
        const elementsCopy = [...elements].reverse();
        return elementsCopy.find((element) => this.isWithinElement(cX, cY, element)); // 마지막 rect 값 가져옴
    };
    isWithinElement = (x: number, y: number, element: IElements) => {
        const { sX, sY, cX, cY } = element;
        const minX = Math.min(sX, cX);
        const maxX = Math.max(sX, cX);
        const minY = Math.min(sY, cY);
        const maxY = Math.max(sY, cY);
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    };
}

export default Bounding;
