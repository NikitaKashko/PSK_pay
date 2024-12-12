import "../styles/PaymentPage.css";
import { useEffect, useState } from "react";
import api from "../api.js";
import { useNavigate, useLocation } from "react-router-dom";
//import QRCode from "qrcode.react";

function PaymentPage() {
    const [billDetails, setBillDetails] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState("");
    const [newCard, setNewCard] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [qrCodeData, setQrCodeData] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBillDetails = async () => {
            const { billId } = location.state || {};
            try {
                const billRes = await api.get(`/api/bills/${billId}`);
                setBillDetails(billRes.data);
            } catch (err) {
                console.error("Ошибка при загрузке деталей счёта", err);
            }
        };

        const fetchPaymentMethods = async () => {
            try {
                const res = await api.get("/api/payment-methods");
                setPaymentMethods([...res.data, { id: "qr", method: "QR-код" }]);
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
            const res = await api.post("/api/payment-methods", { method: newCard });
            setPaymentMethods((prev) => [...prev, res.data]);
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
        if (methodId === "qr") return;
        setLoading(true);
        try {
            await api.delete(`/api/payment-methods/${methodId}`);
            setPaymentMethods((prev) => prev.filter((method) => method.id !== methodId));
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
                const qrData = `PAYMENT:${billDetails.amount};ACCOUNT:${billDetails.accountNumber}`;
                setQrCodeData(qrData);
            } else {
                await api.post("/api/bills/pay", { billId: billDetails.id, method: selectedMethod });
                setSuccess(true);
                setError("");
                setTimeout(() => {
                    navigate("/");
                }, 5000);
            }
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
                            <span>{method.method}</span>
                            {method.id !== "qr" && (
                                <button onClick={() => handleDeleteMethod(method.id)}>
                                    Удалить
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
                <input
                    type="text"
                    value={newCard}
                    placeholder="Добавить карту (16 цифр)"
                    onChange={(e) => setNewCard(e.target.value)}
                />
                <button onClick={handleAddCard} disabled={loading}>
                    Добавить карту
                </button>
            </div>
            <div className="payment-actions">
                <label>
                    Выберите метод оплаты:
                    <select
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                    >
                        <option value="">-- Выберите --</option>
                        {paymentMethods.map((method) => (
                            <option key={method.id} value={method.method}>
                                {method.method}
                            </option>
                        ))}
                    </select>
                </label>
                <button onClick={handlePay} disabled={loading}>
                    {loading ? "Оплата" : "Оплатить"}
                </button>
                {success && <p className="success-message">Счёт успешно оплачен</p>}
                {error && <p className="error-message">{error}</p>}
                {qrCodeData && (
                    <div className="qr-code-container">
                        <h3>Оплатите через QR-код:</h3>
                        <QRCode value={qrCodeData} size={256} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentPage;
