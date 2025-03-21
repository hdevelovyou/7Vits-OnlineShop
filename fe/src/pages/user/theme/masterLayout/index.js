import { memo } from "react";
import Header from "../header";
import Footer from "../footer";

const MasterLayout = ({ children, ...props }) => {
    return (
        <div>
            <Header />
            {children}
            <Footer />
        </div>
    )
}

export default memo (MasterLayout);