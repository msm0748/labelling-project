import styled from "styled-components";
import naverImg from "../assets/images/naver.png";
import kakaoImg from "../assets/images/kakao.png";
import googleImg from "../assets/images/google.png";

const StyledContainer = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    margin-top: 80px;
`;

const StyledButton = styled.button<{ bc?: string; color?: string; border?: string; pl?: string; pr?: string }>`
    display: flex;
    width: 400px;
    font-size: 14px;
    align-items: center;
    justify-content: center;
    height: 40px;
    border-radius: 4px;
    background-color: ${(props) => props.bc || "#fff"};
    margin: 10px auto;
    padding-left: ${(props) => props.pl || "10.5px"};
    border: ${(props) => props.border};
    div {
        margin: 0 auto;
        color: ${(props) => props.color || "#000"};
    }
    img {
        padding-right: ${(props) => props.pr || "10.5px"};
        overflow-clip-margin: content-box;
        overflow: clip;
    }
`;

const StyleHead = styled.h2`
    text-align: center;
    margin-bottom: 40px;
    font-size: 24px;
    font-weight: 600;
`;

interface Props {
    text: string;
}

function LoginComponent({ text }: Props) {
    return (
        <StyledContainer>
            <StyleHead>SNS {text}</StyleHead>
            <StyledButton bc="rgb(30, 200, 0)" color="#fff">
                <img src={naverImg} alt="네이버 로고" />
                <div>네이버 {text}</div>
            </StyledButton>
            <StyledButton bc="rgb(250, 227, 0)">
                <img src={kakaoImg} alt="카카오 로고" />
                <div>카카오 {text}</div>
            </StyledButton>
            <StyledButton border="1px solid rgb(235, 236, 239)" pl="0" pr="0">
                <img src={googleImg} alt="구글 로고" />
                <div>Google {text}</div>
            </StyledButton>
        </StyledContainer>
    );
}

export default LoginComponent;
