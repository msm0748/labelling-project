import { DefaultTheme } from "styled-components";

const color = {
    main: "rgba(26, 26, 26, 0.8)",
};

const size = {};

export type ColorTypes = typeof color;
export type SizeTypes = typeof size;

export const theme: DefaultTheme = {
    color,
    size,
};
