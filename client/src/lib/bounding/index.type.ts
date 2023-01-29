interface IElements {
    id: number;
    sX: number;
    sY: number;
    cX: number;
    cY: number;
    position?: string | null;
}

interface ICategory {
    title: string;
    color: string;
}

export type { IElements, ICategory };
