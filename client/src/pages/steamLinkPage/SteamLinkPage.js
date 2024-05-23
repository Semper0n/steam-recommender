import React, {useState} from 'react';
import cl from "./SteamLinkPage.module.css"
import {checkUser} from "../../http/userAPI";
import {useNavigate} from "react-router-dom";

const SteamLinkPage = () => {
    const history = useNavigate()
    const [error, setError] = useState('')

    const getURL = async () => {
        try {
            if (URL.length === 0) {
                return;  // Вернуться из функции, не вызывая getURL.
            }
            const response = await checkUser(URL)
            console.log(response)
            history(`/${response.data.steamid}`)
        } catch (e) {
            document.getElementById("error").style.display = 'block'
            setError(e.response.data.message)
            console.log(e.response.data.message)
            // alert(e.response.data.message)
        }
    }
    const [URL, setURL] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    return (
        <section className={cl.wrapper}>
            <h1 className={cl.title}>Рекомендательный алгоритм Steam</h1>
            <p className={cl.description}>Введите SteamID и получите список рекомендация на основе Вашей библиотеки Steam</p>
            <form className={cl['input-form']} onSubmit={handleSubmit}>
                <div className={cl['input-wrapper']}>
                    <input required className={cl.input} placeholder="Введите ссылку на профиль или SteamID" value={URL} onChange={e => setURL(e.target.value)}/>
                </div>
                <button className={cl['input-button']} onClick={getURL}>Посмотреть рекомендации</button>
                <div className={cl.error} id={'error'}>
                    <p className={cl['error-title']}>Error</p>
                    <p className={cl['error-text']}>{error}</p>
                </div>
            </form>
        </section>
    );
};

export default SteamLinkPage;