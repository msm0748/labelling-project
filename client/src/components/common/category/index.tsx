import { useState, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import StyledColorPoint from "./StyledColorPoint";
import CategoryItem from "./CategoryItem";
import { ICategory } from "../../../lib/bounding/index.type";

interface Props {
    category: ICategory;
    setCategory: Dispatch<SetStateAction<ICategory>>;
    categoryList: ICategory[];
}

const StyledDropDownWrap = styled.div`
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 100;
    font-size: 18px;
    & > * {
        border-radius: 8px;
        cursor: pointer;
    }
`;

const StyledCategory = styled.div`
    background: rgba(0, 0, 0, 0.87);
    color: #fff;
    display: flex;
    align-items: center;
    padding: 15px;
`;
const StyledSelect = styled.div`
    margin-right: 15px;
`;

const StyledList = styled.ul`
    background: #fff;
`;

function Category({ category, setCategory, categoryList }: Props) {
    const [isDropDown, setIsDropDown] = useState(false);
    const handleDropDown = () => {
        setIsDropDown((prev) => !prev);
    };
    return (
        <StyledDropDownWrap>
            <StyledCategory onClick={handleDropDown}>
                <StyledColorPoint color={category.color} />
                <StyledSelect>{category.title}</StyledSelect>
                {isDropDown ? (
                    <svg width="16" height="16" fill="#fff" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M48 25a3 3 0 0 1 2.183.942l33 35a3 3 0 1 1-4.366 4.116L48 32.373 17.183 65.058a3 3 0 0 1-4.366-4.116l33-35A3 3 0 0 1 48 25Z"
                            fill="current"
                            fillOpacity="current"
                        ></path>
                    </svg>
                ) : (
                    <svg width="16" height="16" fill="#fff" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M48 71a3 3 0 0 1-2.183-.942l-33-35a3 3 0 1 1 4.366-4.116L48 63.627l30.817-32.685a3 3 0 0 1 4.366 4.116l-33 35A3 3 0 0 1 48 71Z"
                            fill="current"
                            fillOpacity="current"
                        ></path>
                    </svg>
                )}
            </StyledCategory>
            {isDropDown && (
                <StyledList>
                    {categoryList.map((item, index) => (
                        <CategoryItem key={index} title={item.title} color={item.color} setCategory={setCategory} setIsDropDown={setIsDropDown}></CategoryItem>
                    ))}
                </StyledList>
            )}
        </StyledDropDownWrap>
    );
}
export default Category;
