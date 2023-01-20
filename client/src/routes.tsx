import { useRoutes } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import KakaoAuth from "./pages/oauth/Kakao";
import NaverAuth from "./pages/oauth/Naver";

export default function Router() {
    const element = useRoutes([
        {
            path: "/",
            element: <Home />,
        },
        {
            path: "/signup",
            element: <SignUp />,
        },
        {
            path: "/signin",
            element: <SignIn />,
        },
        {
            path: "/oauth/kakao",
            element: <KakaoAuth />,
        },
        {
            path: "/oauth/naver",
            element: <NaverAuth />,
        },
    ]);
    return element;
}
