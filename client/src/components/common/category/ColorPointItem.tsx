import StyledColorPoint from "./StyledColorPoint";
import { ICategory } from "../../mission/bounding/index.type";

function StyledCategoryItem({ title, color }: ICategory) {
    return (
        <>
            <StyledColorPoint color={color} />
            <div>{title}</div>
        </>
    );
}

export default StyledCategoryItem;
