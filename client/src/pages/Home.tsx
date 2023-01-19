import MainTemplate from "../components/template/MainTemplate";
import HeaderComponent from "../components/header/Header";
import HomeComponent from "../components/Home";

function Home() {
    return (
        <MainTemplate header={<HeaderComponent />}>
            <HomeComponent />
        </MainTemplate>
    );
}
export default Home;
