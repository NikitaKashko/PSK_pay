import "../styles/MeterReadings.css";
import { useState, useEffect } from "react";
import api from "../api.js";
import {useNavigate} from "react-router-dom";
import Meter from "../components/Meter.jsx";

function MeterReadings() {
    const [dayMeter, setDayMeter] = useState("");
    const [nightMeter, setNightMeter] = useState("");
    const [previousMeters, setPreviousMeters] = useState({ day: "", night: "" });
    const [accountNumber, setAccountNumber] = useState("");
    const [date] = useState(new Date().toISOString().slice(0, 10));
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const accountRes = await api.get("/api/profile/"); // подгружаем привязанный к профилю лицевой счет?
                setAccountNumber(accountRes.data.accountNumber);

                const meterRes = await api.get("/api/meters/previous-meters/",
                    { params : { accountNumber: accountRes.data.accountNumber }}); // подгружаем предыдущие показания по номеру лицевого счета
                setPreviousMeters({
                    day: meterRes.data.dayMeter || "",
                    night: meterRes.data.nightMeter || "",
                })
            } catch (error) {
                console.error("Ошибка при подгрузке показаний с базы ", error);
                setError(true);
            }
        };

        fetchUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/meters/submit-meters", {
                date,
                dayMeter,
                nightMeter,
                accountNumber,
            });
            setSuccess(true);
            setError(false);
            setDayMeter("");
            setNightMeter("");
        } catch (err) {
            console.error("Ошибка при отправке показаний", err);
            setSuccess(false);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutBtnClick = () => {
        navigate("/logout")
    }

    const handleMenuBtnClick = () => {
        navigate("/")
    }

    const handleUnpaidBillsBtnClick = () => {
        navigate("/unpaid-bills")
    }

    return (
        <div className="meter-readings-container">
            <div className="header-area">
                <button className="backmenu-button" onClick={handleMenuBtnClick}>
                    <p>На главную страницу</p>
                </button>
                <button className="logout-button" onClick={handleLogoutBtnClick}>
                    <p>Выйти из аккаунта</p>
                </button>
            </div>
            <div className="meter-readings-content">
                <h1 className="meter-readings-title">Передача показаний</h1>
                <form className="meter-readings-form" onSubmit={handleSubmit}>
                    <div className="field">
                        <label>Дата:</label>
                        <input type="text" value={date} readOnly />
                    </div>
                    <div className="field">
                        <label>Лицевой счёт:</label>
                        <input type="text" value={accountNumber} readOnly />
                    </div>
                    <div className="field">
                        <label>Дневные показания:</label>
                        <input
                            type="number"
                            value={dayMeter}
                            placeholder={previousMeters.day}
                            onChange={(e) => setDayMeter(e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label>Ночные показания:</label>
                        <input
                            type="number"
                            value={nightMeter}
                            placeholder={previousMeters.night}
                            onChange={(e) => setNightMeter(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? "Отправка" : "Отправить показания"}
                    </button>
                </form>
                {success &&
                    <p className="success-message">Показания успешно отправлены!</p> &&
                    <button className="unpaidbills-button" onClick={handleUnpaidBillsBtnClick}>
                        <p>На страницу неоплаченных счетов</p>
                    </button>
                }
                {error && <p className="error-message">Ошибка при отправке показаний. Попробуйте ещё раз.</p>}
            </div>
        </div>
    );
}

export default MeterReadings;