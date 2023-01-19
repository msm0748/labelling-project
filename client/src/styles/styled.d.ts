import "styled-components";
import { ColorTypes, SizeTypes } from "./theme";

declare module "styled-components" {
    export interface DefaultTheme {
        color: ColorTypes;
        size: SizeTypes;
    }
}
