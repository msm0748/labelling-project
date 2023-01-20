import MainTemplate from "../../components/template/MainTemplate";
import HeaderComponent from "../../components/header/Header";
import OauthComponent from "../../components/Oauth";

function NaverAuth() {
    return (
        <MainTemplate header={<HeaderComponent />}>
            <OauthComponent site="naver" />
        </MainTemplate>
    );
}

export default NaverAuth;
