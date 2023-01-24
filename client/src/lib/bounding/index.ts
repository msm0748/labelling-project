interface IElements {
    x: number;
    y: number;
    width: number;
    height: number;
}
class Bounding {
    private canvas: HTMLCanvasElement | null;
    private ctx: CanvasRenderingContext2D | null;
    public elements: IElements[];
    private sX: number;
    private sY: number;
    private cX: number;
    private cY: number;
    private width: number;
    private height: number;
    private isDrawing: boolean;
    private tool: "select" | "move" | "bounding";

    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.elements = [];
        this.sX = 0;
        this.sY = 0;
        this.cX = 0;
        this.cY = 0;
        this.width = 0;
        this.height = 0;
        this.isDrawing = false;
        this.tool = "select";
    }
    init(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d")!;
    }
    tools(tool: "select" | "move" | "bounding") {
        this.tool = tool;
        this.reRednder();
    }
    reRednder() {
        this.ctx?.clearRect(0, 0, this.canvas!.offsetWidth, this.canvas!.offsetHeight);
        this.elements.forEach(({ x, y, width, height }) => {
            // 기존 strokeRect는 보존하되 잔상 제거
            this.ctx?.setLineDash([]);
            this.ctx!.strokeStyle = "green";
            this.ctx?.strokeRect(x, y, width, height);
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
    drawStart(cX: number, cY: number) {
        if (this.isDrawing) return;
        this.isDrawing = true;
        this.sX = cX;
        this.sY = cY;
    }
    draw(cX: number, cY: number) {
        this.cX = cX;
        this.cY = cY;
        this.reRednder();

        if (!this.isDrawing) return;
        this.width = cX - this.sX;
        this.height = cY - this.sY;
        this.ctx?.setLineDash([]);
        this.ctx!.strokeStyle = "green";
        this.ctx!.fillStyle = "rgba(173,255,47, 0.5)";
        this.ctx?.fillRect(this.sX, this.sY, this.width, this.height);
        this.ctx?.strokeRect(this.sX, this.sY, this.width, this.height);
    }
    drawEnd(cX: number, cY: number) {
        if (this.sX === cX && this.sY === cY) return; // 제자리  찍었을때 방지
        this.isDrawing = false;
        const element = this.createElement();
        this.elements.push(element);
        this.reRednder();
    }
    createElement() {
        const element: IElements = {
            x: this.sX,
            y: this.sY,
            width: this.width,
            height: this.height,
        };
        return element;
    }
}

export default Bounding;
