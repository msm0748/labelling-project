import "styled-components";
import { ColorTypes, SizeTypes, PseudoTypes } from "./theme";

declare module "styled-components" {
    export interface DefaultTheme {
        color: ColorTypes;
        size: SizeTypes;
        pseudoElements: PseudoTypes;
    }
}
