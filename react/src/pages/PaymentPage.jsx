import "../styles/PaymentPage.css";
import { useEffect, useState } from "react";
import api from "../api.js";
import { useNavigate, useLocation } from "react-router-dom";

function PaymentPage() {
    const [billDetails, setBillDetails] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState("");
    const [newCard, setNewCard] = useState("");
    const [showQrCode, setShowQrCode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBillDetails = async () => {
            const { billId } = location.state || {};
            if (!billId) {
                setError("ID счета не найден");
                return;
            }
            try {
                const billRes = await api.get(`/api/bills/${billId}/`);
                setBillDetails(billRes.data);
            } catch (err) {
                console.error("Ошибка при загрузке деталей счёта", err);
                setError("Ошибка при загрузке данных счёта");
            }
        };

        const fetchPaymentMethods = async () => {
            try {
                const res = await api.get("/api/payment-methods/");
                setPaymentMethods(res.data);
            } catch (err) {
                console.error("Ошибка при загрузке методов оплаты", err);
            }
        };

        fetchBillDetails();
        fetchPaymentMethods();
    }, [location]);

    const handleAddCard = async () => {
        if (!newCard) return;
        if (!/^\d{16}$/.test(newCard)) {
            setError("Введите корректный номер карты (16 цифр)");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/api/payment-methods/", { method: newCard });
            setPaymentMethods((prevMethods) => [...prevMethods, res.data]);
            setNewCard("");
            setError("");
        } catch (err) {
            console.error("Ошибка при добавлении карты", err);
            setError("Не удалось добавить карту");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMethod = async (methodId) => {
        setLoading(true);
        try {
            await api.delete(`/api/payment-methods/${methodId}/`);
            setPaymentMethods((prevMethods) => prevMethods.filter((method) => method.id !== methodId));
        } catch (err) {
            console.error("Ошибка при удалении метода оплаты", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (!selectedMethod) {
            setError("Выберите метод оплаты");
            return;
        }
        setLoading(true);
        try {
            if (selectedMethod === "QR-код") {
                setShowQrCode(true);
                const res = await api.post("/api/payment-methods/qr", { billId: billDetails.id});
                if (res.status === 200) {
                    setSuccess(true);
                    setError("");
                } else {
                    setError("ОШибка при оплате qr-кодом");
                    setShowQrCode(false);
                }
            } else {
                setShowQrCode(false);
                const res = await api.post("/api/bills/pay/", { billId: billDetails.id, method: selectedMethod });
                if (res.status === 200) {
                    setSuccess(true);
                    setError("");
                }
            }
            setTimeout(() => {
                navigate("/");
            }, 5000);
        } catch (err) {
            console.error("Ошибка при оплате счёта", err);
            setError("Ошибка при оплате. Попробуйте ещё раз.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payment-page-container">
            <h1>Оплата счета</h1>
            {billDetails && (
                <div className="bill-details">
                    <p>Лицевой счёт: {billDetails.accountNumber}</p>
                    <p>Дата: {billDetails.date}</p>
                    <p className="payment-amount">Сумма к оплате: {billDetails.amount} руб.</p>
                </div>
            )}
            <div className="payment-methods">
                <h2>Методы оплаты</h2>
                <ul>
                    {paymentMethods.map((method) => (
                        <li key={method.id}>
                            <span>{method.card_number}</span>
                            {method.id !== "qr" && (
                                <button className="delete-btn" onClick={() => handleDeleteMethod(method.id)}>
                                    Удалить
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                <input
                    className="card-input"
                    type="text"
                    value={newCard}
                    placeholder="Добавить карту (16 цифр)"
                    onChange={(e) => setNewCard(e.target.value)}
                />
                <button className="add-card-btn" onClick={handleAddCard} disabled={loading}>
                    Добавить карту
                </button>
            </div>
            <div className="payment-actions">
                <label className="method-choice">
                    Выберите метод оплаты:
                    <select
                        className="choice-form"
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                    >
                        <option value="">Выберите</option>
                        {paymentMethods.map((method) => (
                            <option key={method.id} value={method.card_number}>
                                {method.card_number}
                            </option>
                        ))}
                        <option value="QR-код">QR-код</option>
                    </select>
                </label>
                <button className="pay-btn" onClick={handlePay} disabled={loading}>
                    {loading ? "Оплата" : "Оплатить"}
                </button>
                {success && <p className="success-message">Счёт успешно оплачен</p>}
                {error && <p className="error-message">{error}</p>}
                {showQrCode && (
                    <div>
                        <h3>Оплатите через QR-код:</h3>
                        <img src="/qr-code.png" alt="QR-код" width="500" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentPage;
