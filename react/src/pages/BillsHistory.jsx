import "../styles/BillsHistory.css"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import Bill from "../components/Bill.jsx";

function BillsHistory(){
    const [bills, setBills] = useState([]);
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7),
        accountNumber: "",
    });
    const [setLoading] = useState(false);
    const [setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const res = await api.get("/api/bills/history/", { params: filters });
                setBills(res.data);
            } catch (error) {
                console.error("Ошибка при подгрузке счетов с базы ", error);
                setError(true);
            } finally {
                setLoading(false)
            }
        };

        fetchBills();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleLogoutBtnClick = () => {
        navigate("/logout")
    }

    const handleMenuBtnClick = () => {
        navigate("/")
    }

    return (
        <div className="billshistory-container">
            <div className="header-area">
                <button className="backmenu-button" onClick={handleMenuBtnClick}>
                    <p>На главную страницу</p>
                </button>
                <button className="logout-button" onClick={handleLogoutBtnClick}>
                    <p>Выйти из аккаунта</p>
                </button>
            </div>
            <div className="billshistory-content">
                <h1 className="billshistory-title">История</h1>
                <div className="filters">
                    <label htmlFor="month">Выберите месяц:</label>
                    <input
                        type="month"
                        id="month"
                        name="month"
                        value={filters.month}
                        onChange={handleFilterChange}
                    />
                    <label htmlFor="accountNumber">Введите номер лицевого счёта:</label>
                    <input
                        type="text"
                        id="accountNumber"
                        name="accountNumber"
                        value={filters.accountNumber}
                        placeholder="Лицевой счёт"
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="billshistory-container">
                    {bills.length > 0 ? (
                        bills.map((bill) => (
                            <Bill
                                key={bill.id}
                                id={bill.id}
                                month={bill.month}
                                year={bill.year}
                                accountNumber={bill.accountNumber}
                                amount={bill.amount}
                                pdfUrl={bill.pdfUrl}
                                isPaid={bill.isPaid}
                            />
                        ))
                    ) : (
                        <p>Счета за выбранный период и/или по введенному лицевому счету отсутствуют</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BillsHistory;