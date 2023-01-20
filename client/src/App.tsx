import Router from "./routes";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import auth from "./lib/firebase";
import { useAppDispatch } from "./redux/store";
import { authLogOut, authLogin } from "./redux/userSlice";

function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const payload = {
                    email: user.email!,
                };
                dispatch(authLogin(payload));
            } else {
                dispatch(authLogOut());
            }
        });
    }, [dispatch]);

    return (
        <>
            <Router />
        </>
    );
}

export default App;
