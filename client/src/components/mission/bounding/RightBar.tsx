import { Dispatch, SetStateAction, useEffect, useState, MouseEvent, useCallback } from "react";
import styled from "styled-components";
import { IElements, ICategory, ISelectedElement } from "./index.type";
import ColorPointItem from "../../common/category/ColorPointItem";
import DropDown from "../../common/category";

interface Props {
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
    categoryList: ICategory[];
    tool: "select" | "move" | "bounding";
    setTool: Dispatch<SetStateAction<"select" | "move" | "bounding">>;
    selectedElement: ISelectedElement | null;
    setSelectedElement: Dispatch<SetStateAction<ISelectedElement | null>>;
    setIsReset: Dispatch<SetStateAction<boolean>>;
}

const StyledWrap = styled.section`
    display: flex;
    width: 360px;
    height: 100%;
    flex-direction: column;
    border-left: 1px solid;
    justify-content: space-between;
`;

const StyledElementsListWrap = styled.div`
    height: 360px;
    overflow-y: overlay;
`;

const StyledItem = styled.li`
    display: flex;
    justify-content: space-between;
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

const StyledBlock = styled.div`
    display: flex;
    align-items: center;
`;

const StyledSvgBlock = styled.div`
    &:hover svg {
        fill: rgb(12, 95, 219);
    }
`;

const StyledTextWrap = styled.div`
    margin-top: 170px;
    text-align: center;
    color: rgb(123, 126, 133);
`;

const StyledSubmitWrap = styled.div`
    border-top: 1px solid rgb(235, 236, 239);
    padding: 16px;
`;

const StyledSubmitBtn = styled.button`
    background: rgb(26, 26, 26);
    border-radius: 4px;
    width: 100%;
    height: 56px;
    color: white;
`;

function RightBar({ elements, setElements, categoryList, tool, setTool, selectedElement, setSelectedElement, setIsReset }: Props) {
    const [category, setCategory] = useState<ICategory>(categoryList[0]);
    const handleActive = useCallback(
        (element: IElements) => {
            const { title, color } = element;
            setCategory({ title, color });
            setTool("select");
            setSelectedElement(element);
        },
        [setTool, setSelectedElement]
    );
    const handleDeleteElement = useCallback(
        (e: MouseEvent, id: number) => {
            e.stopPropagation();
            setElements((elements) => elements.filter((element) => element.id !== id));
            setSelectedElement(null);
        },
        [setElements, setSelectedElement]
    );

    const handleSumbit = useCallback(() => {
        setElements([]);
        setSelectedElement(null);
        setIsReset(true);
    }, [setElements, setSelectedElement, setIsReset]);

    useEffect(() => {
        if (!selectedElement) return;
        const { id } = selectedElement;
        const deleteElement = (e: KeyboardEvent) => {
            if (e.code === "Delete" || e.code === "Backspace") {
                setElements((elements) => elements.filter((element) => element.id !== id));
                setSelectedElement(null);
            }
        };
        document.addEventListener("keydown", deleteElement);
        return () => {
            document.removeEventListener("keydown", deleteElement);
        };
    }, [selectedElement, setElements, setSelectedElement]);

    useEffect(() => {
        if (!selectedElement) return;
        setElements((elements) =>
            elements.map((element) => (element.id === selectedElement.id ? { ...element, color: category.color, title: category.title } : element))
        );
    }, [category, selectedElement, setElements]);

    useEffect(() => {
        if (!selectedElement) return;
        setCategory({ title: selectedElement.title, color: selectedElement.color });
    }, [selectedElement]);

    return (
        <StyledWrap>
            <div>
                {elements.length < 1 && <StyledTextWrap>?????? ?????? ???????????? ????????? ?????????????????? !</StyledTextWrap>}
                <StyledElementsListWrap>
                    <ul>
                        {elements.map((element) => (
                            <StyledItem key={element.id} className={selectedElement?.id === element.id ? "active" : ""} onClick={() => handleActive(element)}>
                                <StyledBlock>
                                    <ColorPointItem color={element.color} title={element.title} />
                                </StyledBlock>
                                <StyledSvgBlock onClick={(e) => handleDeleteElement(e, element.id)}>
                                    <svg
                                        width="16"
                                        height="16"
                                        fill="rgba(26,26,26,0.8)"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fillOpacity="1"
                                        viewBox="0 0 96 96"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="m23.992 26.778 3.725 50.296a1 1 0 0 0 .998.926h38.57a1 1 0 0 0 .998-.926l3.725-50.296 5.984.444-3.726 50.295A7 7 0 0 1 67.286 84H28.714a7 7 0 0 1-6.981-6.483l-3.726-50.295 5.984-.444Z"
                                            fill="current"
                                            fillOpacity="current"
                                        ></path>
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M12 27a3 3 0 0 1 3-3h66a3 3 0 1 1 0 6H15a3 3 0 0 1-3-3ZM34.74 43.011a3 3 0 0 1 3.249 2.73l2 23a3 3 0 1 1-5.978.519l-2-23a3 3 0 0 1 2.73-3.249ZM45 69V46a3 3 0 1 1 6 0v23a3 3 0 1 1-6 0ZM58.74 71.989a3 3 0 0 1-2.729-3.249l2-23a3 3 0 1 1 5.978.52l-2 23a3 3 0 0 1-3.249 2.729Z"
                                            fill="current"
                                            fillOpacity="current"
                                        ></path>
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M38.389 18a1 1 0 0 0-.987.836l-1.443 8.657-5.918-.986 1.443-8.658A7 7 0 0 1 38.388 12h19.224a7 7 0 0 1 6.904 5.85l1.443 8.657-5.918.986-1.443-8.657a1 1 0 0 0-.986-.836H38.388Z"
                                            fill="current"
                                            fillOpacity="current"
                                        ></path>
                                    </svg>
                                </StyledSvgBlock>
                            </StyledItem>
                        ))}
                    </ul>
                </StyledElementsListWrap>
                {selectedElement !== null && (
                    <StyledCategoryWrap>
                        <StyledCategoryTitle>????????????</StyledCategoryTitle>
                        <StyledDropDownWrap>
                            <DropDown category={category} setCategory={setCategory} categoryList={categoryList} />
                        </StyledDropDownWrap>
                    </StyledCategoryWrap>
                )}
            </div>
            <div>
                <StyledSubmitWrap>
                    <StyledSubmitBtn onClick={handleSumbit}>????????????</StyledSubmitBtn>
                </StyledSubmitWrap>
            </div>
        </StyledWrap>
    );
}

export default RightBar;
