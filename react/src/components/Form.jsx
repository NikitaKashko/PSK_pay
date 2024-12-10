import {useState} from "react";
import api from "../api";
import {useNavigate} from "react-router-dom";
import {ACCESS_TOKEN, REFRESH_TOKEN} from "../constants";
import "../styles/Form.css"

function Form({route, method}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Авторизация" : "Регистрация";
    const buttonName = method === "login" ? "Войти" : "Зарегистрироваться";
    const link = method === "login" ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Авторизуйтесь";
    const recoverLink = method === "login" ? "Забыли пароль? Восстановить" : null;

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, {username: email, password})
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/")
            } else {
                navigate("/login")
            }
        } catch (error) {
            console.error("Ошибка ", error);
            setError(true);
        } finally {
            setLoading(false)
        }
    };

    const handleButtonClick = () => {
        if (method === "login") {
            navigate('/register');
        } else {
            navigate('/login');
        }
    }

    return (

        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Почта"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
            />
            {error && <p className="error-text">Логин или пароль неверный</p>}
            {/*{loading && <LoadingIndicator />}*/}
            <button className="form-button" type="submit">
                {buttonName}
            </button>
            <button className="form-button-link" onClick={handleButtonClick}>
                {link}
            </button>
            {recoverLink && (<button className="form-button-recover" onClick={() => navigate('/recover')}>
                {recoverLink}
            </button>)}
        </form>
    );
}

export default Form