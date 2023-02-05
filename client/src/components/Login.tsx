import styled from "styled-components";
import naverImg from "../assets/images/logo/naver.png";
import kakaoImg from "../assets/images/logo/kakao.png";
import googleImg from "../assets/images/logo/google.png";
import auth from "../lib/firebase";
import Wrap from "../components/common/Wrap";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";

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
    const provider = new GoogleAuthProvider();
    const navigate = useNavigate();

    const onGoogleClick = async () => {
        const result = await signInWithPopup(auth, provider);
        const { uid, displayName, email, photoURL } = result.user;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        //구글로 로그인시 첫로그인만(회원가입 개념) users데이터에 정보 넣기
        if (!docSnap.exists()) {
            await setDoc(doc(db, "users", uid), {
                name: displayName,
                email: email,
                photoURL: photoURL,
                uid: uid,
                currentPoint: 0,
                totalPoint: 0,
                createdAt: Date.now(),
            });
        }
        navigate("/");
    };

    const onNaverClick = () => {
        window.location.replace(
            `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.REACT_APP_NAVER_CLIENT_ID}&state=test&redirect_uri=${process.env.REACT_APP_REDIRECT_URL}/oauth/naver`
        );
    };

    const onKakaoClick = () => {
        window.location.replace(
            `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_KAKAO_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URL}/oauth/kakao`
        );
    };
    return (
        <Wrap>
            <StyledContainer>
                <StyleHead>SNS {text}</StyleHead>
                <StyledButton bc="rgb(30, 200, 0)" color="#fff" onClick={onNaverClick}>
                    <img src={naverImg} alt="네이버 로고" />
                    <div>네이버 {text}</div>
                </StyledButton>
                <StyledButton bc="rgb(250, 227, 0)" onClick={onKakaoClick}>
                    <img src={kakaoImg} alt="카카오 로고" />
                    <div>카카오 {text}</div>
                </StyledButton>
                <StyledButton border="1px solid rgb(235, 236, 239)" pl="0" pr="0" onClick={onGoogleClick}>
                    <img src={googleImg} alt="구글 로고" />
                    <div>Google {text}</div>
                </StyledButton>
            </StyledContainer>
        </Wrap>
    );
}

export default LoginComponent;
