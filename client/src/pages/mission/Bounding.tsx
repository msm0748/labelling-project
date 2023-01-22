import MainTemplate from "../../components/template/MainTemplate";
import MissionHeaderComponent from "../../components/header/MissionHeader";
import BoundingComponent from "../../components/mission/Bounding";

function Home() {
    return (
        <MainTemplate header={<MissionHeaderComponent />}>
            <BoundingComponent />
        </MainTemplate>
    );
}
export default Home;
