import MainTemplate from "../components/template/MainTemplate";
import HeaderConponent from "../components/header/Header";
import LoginComponent from "../components/Login";

function SignUp() {
    return (
        <MainTemplate header={<HeaderConponent />}>
            <LoginComponent text="회원가입" />
        </MainTemplate>
    );
}

export default SignUp;
