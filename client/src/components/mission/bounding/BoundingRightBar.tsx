import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styled from "styled-components";
import { IElements, ICategory } from "../../../lib/bounding/index.type";
import ColorPointItem from "../../common/category/ColorPointItem";
import DropDown from "../../common/category";
import Bounding from "../../../lib/bounding";

interface Props {
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
    categoryList: ICategory[];
    bounding: Bounding;
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

function RightBar({ elements, setElements, categoryList, bounding }: Props) {
    const [category, setCategory] = useState<ICategory>(categoryList[0]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const handleActive = (index: number, { categoryTitle, categoryColor }: ICategory) => {
        setActiveIndex(index);
        setCategory({ categoryTitle, categoryColor });
    };
    useEffect(() => {
        bounding.setCategory(activeIndex, category);
        setElements(bounding.elements);
    }, [bounding, category, activeIndex, setElements]);
    return (
        <StyledWrap>
            <StyledElementsListWrap>
                <ul>
                    {elements.map((item, index) => (
                        <StyledItem key={index} className={activeIndex === index ? "active" : ""} onClick={() => handleActive(index, item)}>
                            <ColorPointItem categoryColor={item.categoryColor} categoryTitle={item.categoryTitle} />
                        </StyledItem>
                    ))}
                </ul>
            </StyledElementsListWrap>
            <StyledCategoryWrap>
                <StyledCategoryTitle>카테고리</StyledCategoryTitle>
                {activeIndex !== null && category && (
                    <StyledDropDownWrap>
                        <DropDown category={category} setCategory={setCategory} categoryList={categoryList} />
                    </StyledDropDownWrap>
                )}
            </StyledCategoryWrap>
        </StyledWrap>
    );
}

export default RightBar;
