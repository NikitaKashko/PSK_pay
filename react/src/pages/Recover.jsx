import "../styles/Recover.css"
import {useState} from "react";
import { useNavigate } from "react-router-dom";

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
            //тут надо будет отправить запрос на бэк
            setMessage("На вашу почту отправлено письмо с инструкциями.");
        } catch (error) {
            setMessage("Ошибка при восстановлении пароля. Проверьте введенный email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="recover-container">
            <h1>Восстановление пароля</h1>
            <p>Введите адрес электронной почты, чтобы восстановить пароль.</p>
            <form onSubmit={handleRecover}>
                <input
                    type="email"
                    placeholder="Почта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="recover-input"
                />
                <button type="submit" className="recover-button" disabled={loading}>
                    {loading ? "Отправка" : "Восстановить"}
                </button>
            </form>
            <button className="recover-button-link" onClick={() => {
                return navigate('/login');
            }}>
                {link}
            </button>
            {message && <p className="recover-message">{message}</p>}
        </div>
    );
}

export default Recover;