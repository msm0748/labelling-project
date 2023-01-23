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
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private isDrawing: boolean;

    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.elements = [];
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.isDrawing = false;
    }
    init(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d")!;
    }
    reRednder() {
        this.elements.forEach(({ x, y, width, height }) => {
            // 기존 strokeRect는 보존하되 잔상 제거
            this.ctx?.restore();
            this.ctx?.strokeRect(x, y, width, height);
        });
    }
    crosshair(cX: number, cY: number) {
        this.ctx?.save();

        this.ctx?.setLineDash([2, 5]);
        this.ctx!.strokeStyle = "black";
        this.ctx?.beginPath();
        this.ctx?.moveTo(0, cY);
        this.ctx?.lineTo(window.innerWidth, cY);
        this.ctx?.stroke();

        this.ctx?.beginPath();
        this.ctx?.moveTo(cX, 0);
        this.ctx?.lineTo(cX, window.innerHeight);
        this.ctx?.stroke();

        this.reRednder();
    }
    drawStart(cX: number, cY: number) {
        if (this.isDrawing) return;
        this.isDrawing = true;
        this.x = cX;
        this.y = cY;
    }
    draw(cX: number, cY: number) {
        this.ctx?.restore();
        if (this.isDrawing) {
            this.width = cX - this.x;
            this.height = cY - this.y;

            this.ctx!.strokeStyle = "green";
            this.ctx!.fillStyle = "rgba(173,255,47, 0.5)";
            this.ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
            this.ctx?.fillRect(this.x, this.y, this.width, this.height);
            this.ctx?.strokeRect(this.x, this.y, this.width, this.height);
        } else {
            this.ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
        this.crosshair(cX, cY);
    }
    drawEnd(cX: number, cY: number) {
        if (this.x === cX && this.y === cY) return; // 제자리  찍었을때 방지
        this.isDrawing = false;
        const element: IElements = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
        this.elements.push(element);
        this.ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.reRednder();
    }
}

export default Bounding;
