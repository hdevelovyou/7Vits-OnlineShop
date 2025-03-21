import { memo } from "react";
import bg from '../../../assets/images/loginbg.png';
const LoginPage = () => {
    return (
        <div>
            <img src={bg} alt="bg" style={{width: '100%', height: '100vh'}}/>
        </div>
    )
}

export default memo  (LoginPage);