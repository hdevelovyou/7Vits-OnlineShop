import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VnpayTopup from './components/vnpay_Topup/vnpay_Topup';
import VnpayReturn from './components/vnpay_Return/vnpay_Return';

function App() {
    return(
        <Router>
            <Routes>
                <Route path="/topup" element={<VnpayTopup />} />
                <Route path="/payment/vnpay_return" element={<VnpayReturn />} />
            </Routes>
        </Router>
    );
}

export default App; 