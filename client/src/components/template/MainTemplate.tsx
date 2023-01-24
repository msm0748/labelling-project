import { ReactNode } from "react";
import styled from "styled-components";

interface Props {
    header: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
}

const StyledMain = styled.main`
    height: calc(100% - 48px); // header 높이 제외
`;

function PageTemplate({ header, children, footer }: Props) {
    return (
        <>
            <header>{header}</header>
            <StyledMain>{children}</StyledMain>
            {footer}
        </>
    );
}

export default PageTemplate;
