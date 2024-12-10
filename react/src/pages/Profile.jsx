import "../styles/Profile.css"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Profile() {
    const [userData, setUserData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get("/api/profile/") //здесь будет нормальный запрос на бэк (мб рут поменяется)
                if (res.status === 200) {
                    setUserData(res.data);
                } else {
                    setUserData({email: ""});
                }
            } catch (error) {
                console.error("Ошибка при подгрузке данных с базы ", error);
                setError(true);
            } finally {
                setLoading(false)
            }
        };

        fetchUserData();
    }, []);

    const handleLogoutBtnClick = () => {
        navigate("/logout")
    }

    const handleMenuBtnClick = () => {
        navigate("/")
    }

    //надо будет еще сделать editMode - поменять поля на измененяемые, отправить запрос на бэк для редактирования инфы

    return (
        <div className="profile-container">
            <div className="header-area">
                <button className="menu-button" onClick={handleMenuBtnClick}>
                    <p>На главную страницу</p>
                </button>
                <button className="logout-button" onClick={handleLogoutBtnClick}>
                    <p>Выйти из аккаунта</p>
                </button>
            </div>
            <h1 className="header-text">Профиль</h1>
            <div>
                <p><b>ФИО:</b> {`${userData?.lastName || "Не указано"} ${userData?.firstName || "Не указано"} ${userData?.middleName || ""}`}</p>
                <p><b>Дата рождения:</b> {userData?.birthDate || "Не указана"}</p>
                <p><b>Номер телефона:</b> {userData?.phone || "Не указан"}</p>
                <p><b>Email:</b> {userData?.email || "Не указан"}</p>
                <button className="edit-button">Редактировать данные</button>
            </div>
        </div>
    );
}

export default Profile;
