interface IElements {
    sX: number;
    sY: number;
    cX: number;
    cY: number;
}
class Bounding {
    private canvas: HTMLCanvasElement | null;
    private ctx: CanvasRenderingContext2D | null;
    public elements: IElements[];
    private sX: number;
    private sY: number;
    private cX: number;
    private cY: number;

    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.elements = [];
        this.sX = 0;
        this.sY = 0;
        this.cX = 0;
        this.cY = 0;
    }
    init(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d")!;
        this.ctx.strokeStyle = "green";
    }
    draw(sX: number, sY: number, cX: number, cY: number) {
        this.sX = sX;
        this.sY = sY;
        this.cX = cX;
        this.cY = cY;
        this.ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.ctx?.strokeRect(sX, sY, cX, cY);
        this.elements.forEach(({ sX, sY, cX, cY }) => {
            // 기존 strokeRect는 보존하되 잔상 제거
            this.ctx?.strokeRect(sX, sY, cX, cY);
        });
    }
    drawEnd() {
        const element: IElements = {
            sX: this.sX,
            sY: this.sY,
            cX: this.cX,
            cY: this.cY,
        };
        this.elements.push(element);
    }
}

export default Bounding;
