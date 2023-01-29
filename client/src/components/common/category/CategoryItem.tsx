import { Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import StyledColorPoint from "./StyledColorPoint";
import { ICategory } from "../../../lib/bounding/index.type";

interface Props {
    title: string;
    color: string;
    setCategory: Dispatch<SetStateAction<ICategory>>;
    setIsDropDown: Dispatch<SetStateAction<boolean>>;
}

const StyledItem = styled.li`
    display: flex;
    align-items: center;
    padding: 15px;
    &: hover {
        background: rgba(0, 0, 0, 0.04);
    }
`;

function CategoryItem({ title, color, setCategory, setIsDropDown }: Props) {
    const hadleOnClick = () => {
        setCategory({ color, title });
        setIsDropDown((prev) => !prev);
    };
    return (
        <>
            <StyledItem onClick={hadleOnClick}>
                <StyledColorPoint color={color} />
                <div>{title}</div>
            </StyledItem>
        </>
    );
}

export default CategoryItem;
