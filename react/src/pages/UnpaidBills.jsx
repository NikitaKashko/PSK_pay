import "../styles/UnpaidBills.css"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import Bill from "../components/Bill.jsx";

function UnpaidBills() {
    const [unpaidBills, setUnpaidBills] = useState([]);
    const [setLoading] = useState(false);
    const [setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUnpaidBills = async () => {
            try {
                const res = await api.get("/api/bills/unpaid/");
                setUnpaidBills(res.data);
            } catch (error) {
                console.error("Ошибка при подгрузке неполаченных счетов с базы ", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchUnpaidBills();
    }, []);

    const handleNavigateToPayment = (billId) => {
        navigate("/payment-page/", { state: { billId: billId } });
    };

    const handleLogoutBtnClick = () => {
        navigate("/logout")
    }

    const handleMenuBtnClick = () => {
        navigate("/")
    }

    return (
        <div className="unpaidbills-container">
            <div className="header-area">
                <button className="backmenu-button" onClick={handleMenuBtnClick}>
                    <p>На главную страницу</p>
                </button>
                <button className="logout-button" onClick={handleLogoutBtnClick}>
                    <p>Выйти из аккаунта</p>
                </button>
            </div>
            <div className="unpaidbills-content">
                <h1 className="unpaidbills-title">Счета к оплате</h1>
                <div className="unpaid-bills-container">
                    {unpaidBills.length > 0 ? (
                        unpaidBills.map((bill) => (
                            <Bill
                                key={bill.id}
                                id={bill.id}
                                date={bill.date}
                                accountNumber={bill.accountNumber}
                                amount={bill.amount}
                                pdfUrl={bill.pdUrl}
                                isPaid={bill.isPaid}
                                onPay={() => handleNavigateToPayment(bill.id)}
                            />
                        ))
                    ) : (
                        <p>Нет неоплаченных счетов</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UnpaidBills;