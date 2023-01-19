import { useRoutes } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

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
    ]);
    return element;
}
