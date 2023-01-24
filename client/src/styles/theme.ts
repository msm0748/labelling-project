import { DefaultTheme } from "styled-components";

const color = {
    main: "rgba(26, 26, 26, 0.8)",
};

const size = {};

const pseudoElements = {
    contentBefore: {
        display: "block",
        right: "-18px",
        top: "50%",
        transform: "translate(0px, -50%)",
        borderTop: "8px solid transparent",
        borderRight: "12px solid rgb(235, 236, 239)",
        borderBottom: "8px solid transparent",
        borderLeft: "8px solid transparent",
    },
    contentAfter: {
        display: "flex",
        alignItems: "center",
        top: "0",
        bottom: "0",
        padding: "0 15px",
        left: "50px",
        width: "max-content",
        background: "rgb(235, 236, 239)",
        borderRadius: "5px",
        fontSize: "14px",
    },
};

export type ColorTypes = typeof color;
export type SizeTypes = typeof size;
export type PseudoTypes = typeof pseudoElements;

export const theme: DefaultTheme = {
    color,
    size,
    pseudoElements,
};
