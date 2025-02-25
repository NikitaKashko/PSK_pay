import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx"
import NotFound from "./pages/NotFound.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Recover from "./pages/Recover.jsx";
import Profile from "./pages/Profile.jsx";
import Help from "./pages/Help.jsx";
import UnpaidBills from "./pages/UnpaidBills.jsx";
import BillsHistory from "./pages/BillsHistory.jsx";
import MeterReadings from "./pages/MeterReadings.jsx";
import MeterHistory from "./pages/MeterHistory.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";

function Logout(){
    localStorage.clear();
    return <Navigate to="/login" />
}

function RegisterAndLogout() {
    localStorage.clear();
    return <Register />
}
function App() {


    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/register" element={<RegisterAndLogout />} />
                <Route path="/recover" element={<Recover />} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/unpaid-bills"
                    element={
                        <ProtectedRoute>
                            <UnpaidBills />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/bills-history"
                    element={
                        <ProtectedRoute>
                            <BillsHistory />
                        </ProtectedRoute>
                    }
                />
                <Route path="/meter-readings" element={<MeterReadings />} />
                <Route path="/meter-history" element={<MeterHistory />} />
                <Route
                    path="/payment-page"
                    element={
                        <ProtectedRoute>
                            <PaymentPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/help" element={<Help />} />
                <Route path="*" element={<NotFound />}></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
