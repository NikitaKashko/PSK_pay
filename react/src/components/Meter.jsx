import * as PropTypes from "prop-types";

const Meter = ({ date, dayMeter, nightMeter, accountNumber }) => {
    return (
        <div className="meter">
            <p><b>Дата:</b> {date}</p>
            <p><b>День:</b> {dayMeter}</p>
            <p><b>Ночь:</b> {nightMeter}</p>
            <p><b>Лицевой счёт:</b> {accountNumber}</p>
        </div>
    );
};

Meter.propTypes = {
    date: PropTypes.string.isRequired,
    accountNumber: PropTypes.string.isRequired,
    dayMeter: PropTypes.string.isRequired,
    nightMeter: PropTypes.string.isRequired,
};

export default Meter;
