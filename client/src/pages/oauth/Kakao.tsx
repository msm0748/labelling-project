import MainTemplate from "../../components/template/MainTemplate";
import HeaderComponent from "../../components/header/Header";
import OauthComponent from "../../components/Oauth";

function KakaoAuth() {
    return (
        <MainTemplate header={<HeaderComponent />}>
            <OauthComponent site="kakao" />
        </MainTemplate>
    );
}

export default KakaoAuth;
