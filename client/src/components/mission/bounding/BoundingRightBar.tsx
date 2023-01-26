import { Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { IElements } from "../../../lib/bounding/index.type";

interface Props {
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
}

const StyledWrap = styled.section`
    display: flex;
    width: 360px;
    height: 100%;
    flex-direction: column;
    border-left: 1px solid;
`;

function RightBar({ elements, setElements }: Props) {
    console.log(elements, "right bar");
    return (
        <StyledWrap>
            <ul>
                <li>왜 안되</li>
            </ul>
        </StyledWrap>
    );
}

export default RightBar;
