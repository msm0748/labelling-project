import { Link } from "react-router-dom";
import styled from "styled-components";
import Wrap from "../components/common/Wrap";

const StyledLink = styled(Link)`
    color: blue;
`;

function HomeComponent() {
    return (
        <Wrap>
            <div>Home</div>
            <StyledLink to="/mission/bounding">바운딩 미션</StyledLink>
        </Wrap>
    );
}
export default HomeComponent;
