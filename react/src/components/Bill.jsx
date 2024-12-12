import * as PropTypes from "prop-types";

const Bill = ({
                  id,
                  date,
                  accountNumber,
                  amount,
                  pdfUrl,
                  isPaid,
                  onPay
              }) => {
    const handlePayClick = () => {
        onPay(id);
    };

    return (
        <div className="bill-card">
            <p><b>Счёт за:</b> {date}</p>
            <p><b>Лицевой счёт:</b> {accountNumber}</p>
            <p><b>Сумма:</b> {amount} ₽</p>

            {!isPaid ? (
                <button onClick={handlePayClick} className="pay-button">
                    Оплатить
                </button>
            ) : (
                <p className="paid-status">Счёт оплачен</p>
            )}

            {pdfUrl ? (
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    <button className="pdf-button">Скачать PDF</button>
                </a>
            ) : (
                <p className="pdf-unavailable">PDF недоступен</p>
            )}
        </div>
    );
};

Bill.propTypes = {
    id: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    pdfUrl: PropTypes.string,
    isPaid: PropTypes.bool.isRequired,
    onPay: PropTypes.func,
};

export default Bill;
