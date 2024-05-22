
function timeDifference(msecNowDate: number, msecUpdateDate: number) {
    const milliSecondsPerMinute = 60 * 1000;
    const milliSecondsPerHour = milliSecondsPerMinute * 60;
    const milliSecondsPerDay = milliSecondsPerHour * 24;
    const milliSecondsPerWeek = milliSecondsPerDay * 7;
    const milliSecondsPerMonth = milliSecondsPerDay * 30;

    const elapseTime = msecNowDate - msecUpdateDate

    if (elapseTime < milliSecondsPerMinute / 3) {
        return 'Just Now';
    }

    if (elapseTime < milliSecondsPerMinute) {
        return (
            Math.round(elapseTime / 1000) + ' seconds ago'
        );
    } else if (elapseTime < milliSecondsPerHour) {
        return (
            Math.round(elapseTime / milliSecondsPerMinute) + ' min ago'
        );
    } else if (elapseTime < milliSecondsPerDay) {
        return (
            Math.round(elapseTime / milliSecondsPerHour) + ' hours ago'
        );
    } else if (elapseTime < milliSecondsPerWeek) {
        return (
            Math.round(elapseTime / milliSecondsPerDay) + ' day ago'
        );
    } else if (elapseTime < milliSecondsPerMonth) {
        return (
            Math.round(elapseTime / milliSecondsPerWeek) + ' week ago'
        );
    } else {
        return (
            Math.round(elapseTime / milliSecondsPerMonth) + ' month ago'
        );
    }

}

function timeDifferenceForDay(date: Date) {
    const nowDate = Date.now();
    const updatedDate = new Date(date).getTime();

    return timeDifference(nowDate, updatedDate);
}

export default timeDifferenceForDay
