import StyledColorPoint from "./StyledColorPoint";
import { ICategory } from "../../../lib/bounding/index.type";

function StyledCategoryItem({ categoryTitle, categoryColor }: ICategory) {
    return (
        <>
            <StyledColorPoint color={categoryColor} />
            <div>{categoryTitle}</div>
        </>
    );
}

export default StyledCategoryItem;
