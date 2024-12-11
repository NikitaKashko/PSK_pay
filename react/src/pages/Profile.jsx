import "../styles/Profile.css"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Profile() {
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [setLoading] = useState(false);
    const [setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get("/api/profile/");
                if (res.status === 200) {
                    setUserData({
                        firstName: res.data.first_name || "",
                        secondName: res.data.second_name || "",
                        username: res.data.username || "",
                        birthDate: res.data.birth_date || "",
                    });
                    setFormData({
                        firstName: res.data.first_name || "",
                        secondName: res.data.second_name || "",
                        username: res.data.username || "",
                        birthDate: res.data.birth_date || "",
                    });
                } else {
                    setUserData({username: ""});
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const res = await api.put("/api/profile/", {
                first_name: formData.firstName,
                second_name: formData.secondName,
                birth_date: formData.birthDate,
            });
            if (res.status === 200) {
                setUserData({
                    firstName: res.data.first_name || "",
                    secondName: res.data.second_name || "",
                    username: res.data.username || "",
                    birthDate: res.data.birth_date || "",
                });
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Ошибка при обновлении данных профиля:", error);
        }
    };

    const handleLogoutBtnClick = () => {
        navigate("/logout")
    }

    const handleMenuBtnClick = () => {
        navigate("/")
    }

    return (
        <div className="profile-container">
            <div className="header-area">
                <button className="backmenu-button" onClick={handleMenuBtnClick}>
                    <p>На главную страницу</p>
                </button>
                <button className="logout-button" onClick={handleLogoutBtnClick}>
                    <p>Выйти из аккаунта</p>
                </button>
            </div>
            <h1 className="header-text">Профиль</h1>
            {isEditing ? (
                <div className="edit-form">
                    <label>
                        Фамилия:
                        <input
                            type="text"
                            name="secondName"
                            value={formData.secondName || ""}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Имя:
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName || ""}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Дата рождения:
                        <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate || ""}
                            onChange={handleInputChange}
                        />
                    </label>
                    <p><b>Email:</b> {userData?.username || "Не указан"}</p>
                    <button onClick={handleSave}>Сохранить</button>
                    <button onClick={() => setIsEditing(false)}>Отмена</button>
                </div>
            ) : (
                <div className="profile-view">
                    <p className="info-text"><b className="info-block">Фамилия:</b> {userData?.secondName || "Не указана"}</p>
                    <p className="info-text"><b className="info-block">Имя:</b> {userData?.firstName || "Не указано"}</p>
                    <p className="info-text"><b className="info-block">Дата рождения:</b> {userData?.birthDate || "Не указана"}</p>
                    <p className="info-text"><b className="info-block">Email:</b> {userData?.username || "Не указан"}</p>
                    <button className="edit-button" onClick={() => setIsEditing(true)}>Редактировать данные</button>
                </div>
            )}
        </div>
    );
}

export default Profile;
