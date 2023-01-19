import styled, { css } from "styled-components";

// width: ${(props) => (props.fullScreen ? "" : "1024")}px;
// ${(props) => (props.fullScreen ? "" : "width: 1024px; margin: 0 auto;")}

const StyledWrap = styled.div<{ fullScreen?: boolean }>`
    ${(props) =>
        props.fullScreen
            ? css``
            : css`
                  width: 1024px;
                  margin: 0 auto;
              `}
`;

export default StyledWrap;
