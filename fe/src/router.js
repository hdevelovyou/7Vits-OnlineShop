import Homepage from "./pages/user/homePage";
import LoginPage from "./pages/user/loginPage";
import ProfilePage from "./pages/user/profilePage";
import RegisterPage from "./pages/user/registerPage";
import MasterLayout from "./pages/user/theme/masterLayout";
import { ROUTES } from "./utils/router";
import { Routes, Route } from "react-router-dom";
import OtpPage from "./pages/user/otpPage";
import ForgotPage from "./pages/user/forgotPage";
import NewPassword from "./pages/user/newPassword";
import ProductPage from "./pages/user/productPage";
import StorePage from "./pages/user/storePage";
import CartPage from "./pages/user/cartpage";
import ResetPassword from "./pages/auth/ResetPassword";
import ChatPage from "./pages/user/chatPage";
import Chat from "./components/Chat"; // Đường dẫn tới component Chat của bạn
// Import new components
import SellProductPage from "./pages/user/sellProductPage/sellProductPage";
import MyProductsPage from "./pages/user/myProductPage/myProductPage";
import EditProductPage from "./pages/user/editProductPage/editProductPage";
import VnpayTopup from "./components/vnpay_Topup/vnpay_Topup";
import VnpayReturn from "./components/vnpay_Return/vnpay_Return";
import PaymentSuccessPage from "./pages/user/paymentSuccessPage";
import Otpregister from "./pages/user/otpregister";
import ChinhSachPage from "./pages/user/chinhSachPage";
const renderUserRoutes = () => {
    return (
        <MasterLayout>
            {({ isLoggedIn, setIsLoggedIn, cart, setCart }) => (
                <Routes>
                    <Route path={ROUTES.USER.HOME} element={<Homepage />} />
                    <Route path={ROUTES.USER.PROFILE} element={<ProfilePage />} />
                    <Route path={ROUTES.USER.LOGIN} element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path={ROUTES.USER.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.USER.OTPFORFORGOT} element={<OtpPage />} />
                    <Route path={ROUTES.USER.FORGOTPASSWORD} element={<ForgotPage />} />
                    <Route path={ROUTES.USER.NEWPASSWORD} element={<NewPassword />} />
                    <Route path={ROUTES.USER.PRODUCT} element={<ProductPage cart={cart} setCart={setCart} />} />
                    <Route path={ROUTES.USER.STORE} element={<StorePage />} />
                    <Route path={ROUTES.USER.CART} element={<CartPage cart={cart} setCart={setCart} />} />
                    <Route path="/reset-password" element={<ResetPassword />} />                    
                    <Route path="/chat/:id" element={<ChatPage />} />
                    <Route path="/chat" element={<Chat />} />
                    {/* New routes for selling products */}
                    <Route path={ROUTES.USER.SELL_PRODUCT} element={<SellProductPage />} />
                    <Route path={ROUTES.USER.MY_PRODUCTS} element={<MyProductsPage />} />
                    <Route path={ROUTES.USER.EDIT_PRODUCT} element={<EditProductPage />} />
                    <Route path="/topup" element={<VnpayTopup />} />
                    <Route path="/payment/vnpay_return" element={<VnpayReturn />} />
                    {/* Payment success page */}
                    <Route path={ROUTES.USER.PAYMENT_SUCCESS} element={<PaymentSuccessPage />} />
                    <Route path="/otp-for-signup" element={<Otpregister />} />
                    {/* Policy page */}
                    <Route path={ROUTES.USER.CHINH_SACH} element={<ChinhSachPage />} />
                    {/* Add other routes here */}
                </Routes>
            )}
        </MasterLayout>
    );
}

const RouterCustom = () => {
    return renderUserRoutes();
}

export default RouterCustom;