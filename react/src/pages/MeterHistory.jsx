import "../styles/MeterHistory.css"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import Meter from "../components/Meter.jsx";

function MeterHistory(){
    const [meters, setMeters] = useState([]);
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7)
    });
    const [setLoading] = useState(false);
    const [setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMeters = async () => {
            try {
                const res = await api.get("/api/meters/history/", { params: filters });
                setMeters(res.data);
            } catch (error) {
                console.error("Ошибка при подгрузке показаний с базы ", error);
                setError(true);
            } finally {
                setLoading(false)
            }
        };

        fetchMeters();
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
        <div className="metershistory-container">
            <div className="header-area">
                <button className="backmenu-button" onClick={handleMenuBtnClick}>
                    <p>На главную страницу</p>
                </button>
                <button className="logout-button" onClick={handleLogoutBtnClick}>
                    <p>Выйти из аккаунта</p>
                </button>
            </div>
            <div className="metershistory-content">
                <h1 className="metershistory-title">История показаний</h1>
                <div className="filters">
                    <label htmlFor="month">Выберите месяц:</label>
                    <input className="date-input"
                        type="month"
                        id="month"
                        name="month"
                        value={filters.month}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="meters-history-container">

                    {meters.length > 0 ? (
                        meters.map((meter) => (
                            <div className="meter-info">
                                <Meter
                                    date={meter.date}
                                    accountNumber={meter.accountNumber}
                                    dayMeter={meter.dayMeter}
                                    nightMeter={meter.nightMeter}
                                />
                            </div>
                        ))
                    ) : (
                        <p>Показания за выбранный период отсутствуют</p>
                    )}

                </div>
            </div>
        </div>
    );
}

export default MeterHistory;