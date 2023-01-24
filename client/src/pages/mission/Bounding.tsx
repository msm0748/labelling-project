import MainTemplate from "../../components/template/MainTemplate";
import MissionHeaderComponent from "../../components/header/MissionHeader";
import BoundingComponent from "../../components/mission/bounding";

function Home() {
    return (
        <MainTemplate header={<MissionHeaderComponent />}>
            <BoundingComponent />
        </MainTemplate>
    );
}
export default Home;
