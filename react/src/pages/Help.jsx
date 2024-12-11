import "../styles/Help.css"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Help() {
    const [faqData] = useState([
        {
            question: "Как выйти из аккаунта?",
            answer: "Чтобы выйти из аккаунта, нажмите кнопку 'Выйти в окно' в верхней части страницы."
        },
        {
            question: "Как платить?",
            answer: "Для оплаты нажмите кнопку оплатить рядом с необходимым счетом и выберите способ оплаты."
        },
        {
            question: "Как попасть в профиль?",
            answer: "Вы можете перейти в профиль, нажав кнопку 'Профиль' в верхней части сайта."
        },
        {
            question: "Как изменить почту, указанную при регистрации?",
            answer: "Изменить почту, указанную при регистрации нельзя."
        }
    ]);

    const [expanded, setExpanded] = useState(null);
    const navigate = useNavigate();

    const switchQuestion = (index) => {
        setExpanded(expanded === index ? null : index);
    }

    const handleLogoutBtnClick = () => {
        navigate("/logout")
    }

    const handleMenuBtnClick = () => {
        navigate("/")
    }

    return (
        <div className="help-container">
            <div className="header-area">
                <button className="backmenu-button" onClick={handleMenuBtnClick}>
                    <p>На главную страницу</p>
                </button>
                <button className="logout-button" onClick={handleLogoutBtnClick}>
                    <p>Выйти из аккаунта</p>
                </button>
            </div>
            <div className="help-content">
                <h1 className="help-title">Помощь</h1>
                <div className="faq-section">
                    <h2 className="faq-title">Помощь пользователям ЛКК</h2>
                    <div className="faq-list">
                        {faqData.map((item, index) => (
                            <div key={index} className="faq-item">
                                <div className="faq-question" onClick={() => switchQuestion(index)}>
                                    <span>{item.question}</span>
                                    <span className="faq-switch">{expanded === index ? "▲" : "▼"}</span>
                                </div>
                                {expanded === index && <div className="faq-answer">{item.answer}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="contact-box">
                <h3>ПСКPay</h3>
                <p>Санкт-Петербург</p>
                <p>По всем вопросам</p>
                <p><b>+7 (XXX) XXX XX XX</b></p>
                <p>Пн-Пт с 8:00 до 21:00</p>
            </div>
        </div>
    );
}

export default Help;