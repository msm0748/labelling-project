import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styled from "styled-components";
import { IElements, ICategory } from "./index.type";
import ColorPointItem from "../../common/category/ColorPointItem";
import DropDown from "../../common/category";

interface Props {
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
    categoryList: ICategory[];
    tool: "select" | "move" | "bounding";
    setTool: Dispatch<SetStateAction<"select" | "move" | "bounding">>;
}

const StyledWrap = styled.section`
    display: flex;
    width: 360px;
    height: 100%;
    flex-direction: column;
    border-left: 1px solid;
`;

const StyledElementsListWrap = styled.div`
    height: 360px;
    overflow-y: overlay;
`;

const StyledItem = styled.li`
    display: flex;
    align-items: center;
    padding: 15px;
    cursor: pointer;
    &: hover {
        background: rgba(0, 0, 0, 0.04);
    }
    &.active {
        background: rgba(0, 0, 0, 0.08);
    }
`;
const StyledCategoryWrap = styled.div`
    width: 100%;
    height: 136px;
    background: rgb(247, 247, 249);
`;

const StyledDropDownWrap = styled.div`
    padding: 15px;
`;

const StyledCategoryTitle = styled.div`
    padding: 15px;
    color: rgb(52, 55, 59);
    background: rgb(235, 236, 239);
`;

function RightBar({ elements, setElements, categoryList, tool, setTool }: Props) {
    const [category, setCategory] = useState<ICategory>(categoryList[0]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const handleActive = (index: number, { title, color }: ICategory) => {
        setActiveIndex(index);
        setCategory({ title, color });
        setTool("select");
    };
    useEffect(() => {
        if (tool !== "select") {
            setActiveIndex(null);
        }
    }, [tool]);
    return (
        <StyledWrap>
            <StyledElementsListWrap>
                <ul>
                    {elements.map((item, index) => (
                        <StyledItem key={index} className={activeIndex === index ? "active" : ""} onClick={() => handleActive(index, item)}>
                            <ColorPointItem color={item.color} title={item.title} />
                        </StyledItem>
                    ))}
                </ul>
            </StyledElementsListWrap>
            {activeIndex !== null && category && (
                <StyledCategoryWrap>
                    <StyledCategoryTitle>카테고리</StyledCategoryTitle>
                    <StyledDropDownWrap>
                        <DropDown category={category} setCategory={setCategory} categoryList={categoryList} />
                    </StyledDropDownWrap>
                </StyledCategoryWrap>
            )}
        </StyledWrap>
    );
}

export default RightBar;
