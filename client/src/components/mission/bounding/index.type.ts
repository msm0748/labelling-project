interface IElements extends ICategory {
    id: number;
    sX: number;
    sY: number;
    cX: number;
    cY: number;
    position?: string | null;
}

interface ICategory {
    color: string;
    title: string;
}

export type { IElements, ICategory };
