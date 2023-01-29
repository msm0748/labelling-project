interface IElements extends ICategory {
    id: number;
    sX: number;
    sY: number;
    cX: number;
    cY: number;
    position?: string | null;
}

interface ICategory {
    categoryTitle: string;
    categoryColor: string;
}

export type { IElements, ICategory };
