import { useRoutes } from "react-router-dom";
import Home from "./pages/Home";

export default function Router() {
    const element = useRoutes([
        {
            path: "/",
            element: <Home />,
        },
    ]);
    return element;
}
