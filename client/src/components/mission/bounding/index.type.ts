interface IElements extends ICategory {
    id: number;
    sX: number;
    sY: number;
    cX: number;
    cY: number;
}

interface ISelectedElement extends IElements {
    position?: string | null;
    startX?: number;
    startY?: number;
}

interface ICategory {
    color: string;
    title: string;
}

export type { IElements, ICategory, ISelectedElement };
