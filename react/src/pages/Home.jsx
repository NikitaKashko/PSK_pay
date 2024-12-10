import "../styles/Home.css"
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const handleLogoutBtnClick = () => {
        navigate("/logout")
    }

    const handleProfileBtnClick = () => {
        navigate("/profile")
    }

    const handleHelpBtnClick = () => {
        navigate("/help")
    }

    return (
        <div className="home">
            <div className="header">
                <button className="profile-button" onClick={handleProfileBtnClick}>
                    <p>Профиль</p>
                </button>
                <button className="logout-button" onClick={handleLogoutBtnClick}>
                    <p>Выйти из аккаунта</p>
                </button>
            </div>
            <h2 className="header-text">Здравствуйте! Выберите, что Вы хотите сделать</h2>
            <div className="menu-buttons">
            <button className="menu-button">
                    <p>Посмотреть счета к оплате</p>
                </button>
                <button className="menu-button">
                    <p>Оплатить счёт</p>
                </button>
                <button className="menu-button">
                    <p>Посмотреть историю платежей</p>
                </button>
                <button className="menu-button">
                    <p>Посмотреть историю счетов</p>
                </button>
            </div>
            <div className="help-section">
                <button className="help-button" onClick={handleHelpBtnClick}>
                    <p>Ответы на часто задаваемые вопросы</p>
                </button>
            </div>
        </div>
    );
}

export default Home;