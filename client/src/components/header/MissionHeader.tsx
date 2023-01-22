import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Wrap from "../common/Wrap";

const StyledWrap = styled(Wrap)`
    display: flex;
    justify-content: space-between;
    height: 50px;
    padding: 0 15px;
`;

function MissionHeaderComponent() {
    const navigate = useNavigate();
    const handleHistory = () => {
        if (window.confirm("정말 나가시겠습니까?")) navigate(-1);
    };
    return (
        <StyledWrap fullScreen>
            <button onClick={handleHistory}>
                <svg width="24" height="24" fill="rgba(26,26,26,0.8)" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M50.121 12.879a3 3 0 0 1 0 4.242L22.243 45H81a3 3 0 1 1 0 6H22.243L50.12 78.879a3 3 0 1 1-4.242 4.242l-33-33a3 3 0 0 1 0-4.242l33-33a3 3 0 0 1 4.242 0Z"
                        fill="current"
                        fillOpacity="current"
                    ></path>
                </svg>
            </button>
            <button>
                <svg width="24" height="24" fill="rgba(26,26,26,0.8)" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16 19c0-6.075 4.925-11 11-11h50a3 3 0 0 1 3 3v58a3 3 0 0 1-3 3h-1a5 5 0 0 0 0 10h1a3 3 0 1 1 0 6H27c-6.075 0-11-4.925-11-11V19Zm6 58a5 5 0 0 0 5 5h39.2c-.767-1.5-1.2-3.2-1.2-5 0-1.8.433-3.5 1.2-5H27a5 5 0 0 0-5 5Zm52-11H27c-1.8 0-3.5.433-5 1.2V19a5 5 0 0 1 5-5h47v52Z"
                        fill="current"
                        fillOpacity="current"
                    ></path>
                </svg>
            </button>
        </StyledWrap>
    );
}

export default MissionHeaderComponent;
