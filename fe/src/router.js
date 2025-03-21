import Homepage from "./pages/user/homePage";
import LoginPage from "./pages/user/loginPage";
import ProfilePage from "./pages/user/profilePage";
import RegisterPage from "./pages/user/registerPage";
import MasterLayout from "./pages/user/theme/masterLayout";
import { ROUTES } from "./utils/router";
import { Routes, Route } from "react-router-dom";

const renderUserRoutes = () => {
    const userRouters = [
        {
            path: ROUTES.USER.HOME,
            component: <Homepage />
        },
        {
            path: ROUTES.USER.PROFILE   ,
            component: <ProfilePage />
        },
        {
            path: ROUTES.USER.LOGIN   ,
            component: <LoginPage />
        },
        {
            path: ROUTES.USER.REGISTER   ,
            component: <RegisterPage />
        },
    ]
    return (
       <MasterLayout>
            <Routes>
                {userRouters.map((item, key) => (
                    <Route key={key} path={item.path} element={item.component} />
                ))}
            </Routes>
       </MasterLayout>
    )
}

const RouterCustom = () => {
    return renderUserRoutes();
}
export default RouterCustom;
