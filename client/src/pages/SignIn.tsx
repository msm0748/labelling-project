import MainTemplate from "../components/template/MainTemplate";
import HeaderConponent from "../components/header/Header";
import LoginComponent from "../components/Login";

function SignIn() {
    return (
        <MainTemplate header={<HeaderConponent />}>
            <LoginComponent text="로그인" />
        </MainTemplate>
    );
}

export default SignIn;
