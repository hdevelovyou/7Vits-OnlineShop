import Homepage from "./pages/user/homePage";
import LoginPage from "./pages/user/loginPage";
import ProfilePage from "./pages/user/profilePage";
import RegisterPage from "./pages/user/registerPage";
import MasterLayout from "./pages/user/theme/masterLayout";
import { ROUTES } from "./utils/router";
import { Routes, Route } from "react-router-dom";
import OtpPage from "./pages/user/otpPage";
import ForgotPage from "./pages/user/forgotPage";
import OtpPage2 from "./pages/user/otpPage2";
import NewPassword from "./pages/user/newPassword";
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
        {
            path: ROUTES.USER.OTPFORSIGNUP ,
            component: <OtpPage />
        },
        {
            path: ROUTES.USER.FORGOTPASSWORD,
            component: <ForgotPage />
        },
        {
            path: ROUTES.USER.OTPFORFORGOT, 
            component: <OtpPage2 />
        },
        {
            path: ROUTES.USER.NEWPASSWORD, 
            component: <NewPassword />
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
