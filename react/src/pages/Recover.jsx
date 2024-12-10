import "../styles/Recover.css"
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Recover() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const link = "Вернуться на страницу авторизации";

    const handleRecover = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/api/password_reset/", {email: email});
            setMessage("На вашу почту отправлено письмо с инструкциями.");
        } catch (error) {
            console.error(error);
            setMessage("Ошибка при восстановлении пароля. Проверьте введенный email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="recover-container">
            <h1>Восстановление пароля</h1>
            <p className="recover-p">Введите адрес электронной почты, чтобы восстановить пароль.</p>
            <form onSubmit={handleRecover}>
                <input
                    type="email"
                    placeholder="Почта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="recover-input"
                />
                {message && <p className="recover-message">{message}</p>}
                <button type="submit" className="recover-button" disabled={loading}>
                    {loading ? "Отправка" : "Восстановить"}
                </button>
            </form>
            <button className="recover-button-link" onClick={() => {
                return navigate('/login');
            }}>
                {link}
            </button>
        </div>
    );
}

export default Recover;