import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { signInWithCustomToken } from "firebase/auth";
import auth from "../lib/firebase";
import Wrap from "./common/Wrap";

const StyledBlock = styled.div`
    margin-top: 70px;
`;

interface Props {
    site: "naver" | "kakao";
}

function OauthComponent({ site }: Props) {
    const navigate = useNavigate();

    const getFirebaseCustomToken = useCallback(
        async (code: string | null, state?: string | null) => {
            try {
                const {
                    data: { result },
                } = await axios({
                    url: `/oauth/${site}`,
                    method: "post",
                    data: { code, state },
                });
                signInWithCustomToken(auth, result)
                    .then(() => {
                        navigate("/");
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        alert(errorCode);
                    });
            } catch (err) {
                console.log(err);
            }
        },
        [navigate, site]
    );

    useEffect(() => {
        const params = new URL(window.location.href).searchParams;
        const code = params.get("code");
        const state = params.get("state");
        getFirebaseCustomToken(code, state);
    }, [getFirebaseCustomToken]);

    return (
        <Wrap>
            <StyledBlock>진행 중..</StyledBlock>
        </Wrap>
    );
}

export default OauthComponent;
