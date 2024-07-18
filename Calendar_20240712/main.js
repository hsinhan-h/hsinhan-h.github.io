const lastMonthBtn = document.querySelector('.last-month_btn');
const nextMonthBtn = document.querySelector('.next-month_btn');
const todayBtn = document.querySelector('.today_btn');
const calenderHeaderYear = document.querySelector('.calendar-header .year');
const calenderHeaderMonth = document.querySelector('.calendar-header .month');
const monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const yearDropdown = document.querySelector('.year-dropdown');
const monthDropdown = document.querySelector('.month-dropdown');
const scheduleModal = document.querySelector('#schedule-modal');
const scheduleModalYearDropDown = scheduleModal.querySelector('.year-dropdown');
const scheduleModalMonthDropDown = scheduleModal.querySelector('.month-dropdown');
const scheduleModalDateDropDown = scheduleModal.querySelector('.date-dropdown');
const modalBootStrap = new bootstrap.Modal(scheduleModal);
const dates = document.querySelector('.dates');

const addScheduleBtn = document.querySelector('.add-schedule_btn');
const deleteScheduleBtn = document.querySelector('.delete_btn');
const scheduleConfirmBtn = document.querySelector('.schedule-confirm_btn');

const today = new Date();
const yearOfToday = today.getFullYear();
const monthOfToday = today.getMonth() + 1;
const dateOfToday = today.getDate();
const weekDayOfToday = today.getDay();
const daysOfMonth = (year, month) => new Date(year, month, 0).getDate();
let selectedDataId;
let selectedYear;
let selectedMonth;
let selectedDate;

const dateBlockHTML = `
    <div class="date-block">
        <div class="date"></div>
        <div class="date-schedules overflow-auto"></div>
    </div>
`

window.addEventListener('load', renderCalendar(yearOfToday, monthOfToday));
window.addEventListener('load', appendYearDropDown(yearDropdown));
lastMonthBtn.addEventListener('click', moveToLastMonth);
nextMonthBtn.addEventListener('click', moveToNextMonth);
todayBtn.addEventListener('click', () => {
    clearCalender();
    renderCalendar(yearOfToday, monthOfToday);
});
scheduleConfirmBtn.addEventListener('click', saveSchedulesToLocalStorage);
addScheduleBtn.addEventListener('click', resetModalInfo);
deleteScheduleBtn.addEventListener('click', () => removeScheduleFromLocalStorage(selectedDataId));

//當date block的行程被點擊時，彈出編輯/刪除行程modal
dates.addEventListener('click', (e) => {
    const dateId = e.target.closest('.date-block').getAttribute('dateid');
    selectedYear = e.target.closest('.date-block').getAttribute('year');
    selectedMonth = e.target.closest('.date-block').getAttribute('month');
    selectedDate = e.target.closest('.date-block').getAttribute('date');
    if (e.target.classList.contains('date-schedule') ||
        e.target.classList.contains('schedule-title_tag') ||
        e.target.classList.contains('tag-color')) {
        const dataId = e.target.closest('.date-schedule').getAttribute('dataId');
        selectedDataId = dataId;
        setModalInfo(selectedYear, selectedMonth, selectedDate);
        setModalEditInfo(dateId, selectedYear, selectedMonth, selectedDate, dataId);
        modalBootStrap.show();
        //date block被點擊時，彈出新增行程modal
    } else {
        resetModalInfo();
        setModalInfo(selectedYear, selectedMonth, selectedDate);
        modalBootStrap.show();
    }
});

function renderCalendar(year, month) {
    const totalDaysOfThisMonth = daysOfMonth(year, month);
    const firstWeekDay = new Date(year, month - 1, 1).getDay();
    const blocksNeeded = decideBlocksNeeded(firstWeekDay, totalDaysOfThisMonth);
    for (let i = 0; i < blocksNeeded; i++) {
        document.querySelector('.dates').innerHTML += dateBlockHTML;
    }

    for (let date = 1; date <= totalDaysOfThisMonth; date++) {
        const currentDateTag = document.querySelector(`.dates div:nth-of-type(${date + firstWeekDay}) .date`);
        if (currentDateTag) {
            currentDateTag.textContent = date;
            const dateId = dateToIdTransformer(year, month, date);
            setDateAttribute(currentDateTag, dateId, year, month, date);
            if ((date + firstWeekDay - 1) % 7 === 0) {
                currentDateTag.classList.add('text-danger');
            }
            if ((date + firstWeekDay - 1) % 7 === 6) {
                currentDateTag.classList.add('text-success');
            }
        }
    }

    //如果第一天不是禮拜天, 把前一個月的日期渲染出來
    const totalDaysOfLastMonth = daysOfMonth(year, month - 1);
    const lastYear = (month === 1) ? year - 1 : year;
    const lastMonth = (month === 1) ? 12 : month - 1;
    if (firstWeekDay != 0) {
        for (let i = 1; i <= firstWeekDay; i++) {
            const lastMonthDateTag = document.querySelector(`.dates div:nth-of-type(${i}) .date`);
            const date = totalDaysOfLastMonth - firstWeekDay + i;
            lastMonthDateTag.textContent = date;
            const dateId = dateToIdTransformer(lastYear, lastMonth, date);
            setDateAttribute(lastMonthDateTag, dateId, lastYear, lastMonth, date)
            lastMonthDateTag.closest('.date-block').classList.add('last-month');
        }
    }

    //把下個月的日期渲染出來
    const remainDays = blocksNeeded - (firstWeekDay + totalDaysOfThisMonth);
    const nextYear = (month === 12) ? year + 1 : year;
    const nextMonth = (month === 12) ? 1 : month + 1;
    for (let date = 1; date <= remainDays; date++) {
        const nextMonthDateTag = document.querySelector(`.dates div:nth-of-type(${firstWeekDay + totalDaysOfThisMonth + date}) .date`);
        const dateId = dateToIdTransformer(nextYear, nextMonth, date);
        setDateAttribute(nextMonthDateTag, dateId, nextYear, nextMonth, date);
        nextMonthDateTag.textContent = date;
        nextMonthDateTag.closest('.date-block').classList.add('next-month');
    }

    //如果是這個月的月曆，把今天標註出來
    if (year === yearOfToday && month === monthOfToday) {
        markDateOnCalendar(firstWeekDay + dateOfToday);
    }

    //把schedule渲染出來
    const dateBlockList = document.querySelectorAll('.date-block');
    const scheduleData = getSchedulesFromLocalStorage();
    dateBlockList.forEach((dateBlock) => {
        const scheduleDataOfTheDay = scheduleData.find((data) => data.id === dateBlock.getAttribute('dateid'));
        if (scheduleDataOfTheDay) {
            const scheduleArray = scheduleDataOfTheDay.scheduleList;
            for (let i = 0; i < scheduleArray.length; i++) {
                dateBlock.querySelector('.date-schedules').innerHTML += `<div class="date-schedule text-truncate" dataId="${scheduleArray[i].dataId}"><span class="tag-color" style="background-color: ${scheduleArray[i].color_tag}"></span><span class="schedule-title_tag">${scheduleArray[i].title}</span></div>`
            }
        }
    })


    calenderHeaderYear.textContent = year;
    calenderHeaderMonth.textContent = monthList[month - 1];

    //設定modal dropdown預設值
    appendModalYearDropDown(scheduleModalYearDropDown);
    scheduleModalMonthDropDown.value = getCurrentMonth();
    appendModalDateDropDown(scheduleModalDateDropDown, getCurrentYear(), getCurrentMonth());
}


function markDateOnCalendar(dateBlockNumber) {
    const dateBlockOfToday = document.querySelector(`.dates div:nth-of-type(${dateBlockNumber}) .date`);
    dateBlockOfToday.classList.add('bg-info', 'text-light', 'rounded-circle');
}

function decideBlocksNeeded(firstWeekDay, totalDaysOfMonth) {
    if (firstWeekDay === 6 && totalDaysOfMonth >= 30 ||
        firstWeekDay === 5 && totalDaysOfMonth === 31) {
        return 42;
    } else if (firstWeekDay === 0 && totalDaysOfMonth === 28) {
        return 28;
    } else {
        return 35;
    }
}

function moveToLastMonth() {
    let year = getCurrentYear();
    let month = getCurrentMonth();
    if (month === 1) {
        month = 12;
        year -= 1;
    } else {
        month -= 1;
    }
    clearCalender();
    renderCalendar(year, month);
}

function moveToNextMonth() {
    let year = getCurrentYear();
    let month = getCurrentMonth();
    if (month === 12) {
        month = 1;
        year += 1;
    } else {
        month += 1;
    }
    clearCalender();
    renderCalendar(year, month);
}

function appendYearDropDown(node) {
    for (let i = 0; i < 20; i++) {
        node.innerHTML += `
        <li><a class="dropdown-item" href="#">${yearOfToday - 10 + i}</a></li>
        `
    }
}

function appendModalYearDropDown(node) {
    node.innerHTML = "";
    node.innerHTML += '<option selected></option>';
    for (let i = 0; i < 20; i++) {
        node.innerHTML += `
        <option value="${getCurrentYear() - 10 + i}">${getCurrentYear() - 10 + i}</option>
        `
    }
    node.value = getCurrentYear();
}

function setModalInfo(year, month, date) {
    scheduleModal.querySelector('.year-dropdown').value = year;
    scheduleModal.querySelector('.month-dropdown').value = month;
    scheduleModal.querySelector('.date-dropdown').value = date;
}

function setModalEditInfo(dateid, year, month, date, dataId) {
    const scheduleData = getSchedulesFromLocalStorage();
    const targetData = scheduleData.find((data) => data.id === dateid);
    const scheduleDetail = targetData.scheduleList.find((schedule) => schedule.dataId === parseInt(dataId));
    scheduleModal.classList.add('in-edit');
    scheduleModal.querySelector('.modal-title').textContent = "Edit Schedule";
    scheduleModal.querySelector('.start-from').value = scheduleDetail.start_time;
    scheduleModal.querySelector('.end-at').value = scheduleDetail.end_time;
    scheduleModal.querySelector('#schedule-color-tag').value = scheduleDetail.color_tag;
    scheduleModal.querySelector('.schedule-title').value = scheduleDetail.title;
    scheduleModal.querySelector('#schedule-description').value = scheduleDetail.content;
    scheduleModal.querySelector('.delete_btn').classList.remove('d-none');
}


function resetModalInfo() {
    scheduleModal.classList.remove('in-edit');
    scheduleModal.querySelector('.modal-title').textContent = "Add New Schedule";
    scheduleModal.querySelector('.start-from').value = "";
    scheduleModal.querySelector('.end-at').value = "";
    scheduleModal.querySelector('#schedule-color-tag').value = "#0d6efd";
    scheduleModal.querySelector('.schedule-title').value = "";
    scheduleModal.querySelector('#schedule-description').value = "";
    scheduleModal.querySelector('.delete_btn').classList.add('d-none');
}

function appendModalDateDropDown(node, year, month) {
    node.innerHTML = "";
    node.innerHTML += '<option selected></option>';
    const days = daysOfMonth(year, month);
    for (let i = 1; i <= days; i++) {
        node.innerHTML += `
        <option value="${i}">${i}</option>
        `
    }
    node.value = 1;
}

yearDropdown.addEventListener('click', (e) => {
    e.preventDefault();
    clearCalender();
    renderCalendar(parseInt(e.target.textContent), getCurrentMonth());
});
monthDropdown.addEventListener('click', (e) => {
    e.preventDefault();
    clearCalender();
    renderCalendar(getCurrentYear(), e.target.textContent);
});

scheduleModalYearDropDown.addEventListener('click', () =>
    appendModalDateDropDown(scheduleModalDateDropDown, getModalYearValue(), getModalMonthValue()));

scheduleModalMonthDropDown.addEventListener('click', () =>
    appendModalDateDropDown(scheduleModalDateDropDown, getModalYearValue(), getModalMonthValue()));


function saveSchedulesToLocalStorage() {
    const scheduleData = getSchedulesFromLocalStorage();
    const year = getModalYearValue();
    const month = getModalMonthValue();
    const date = getModalDateValue();
    const id = dateToIdTransformer(year, month, date);
    const startTime = document.querySelector('.start-from').value;
    const endTime = document.querySelector('.end-at').value;
    const colorTag = document.querySelector('#schedule-color-tag').value;
    const timeStampAsDataId = Date.now();
    const title = document.querySelector('.schedule-title').value;
    const content = document.querySelector('#schedule-description').value;
    const dataObject = {
        dataId: timeStampAsDataId,
        start_time: startTime,
        end_time: endTime,
        color_tag: colorTag,
        title: title,
        content: content
    }
    const targetData = scheduleData.find((data) => data.id === id);
    const targetDataIndex = scheduleData.findIndex((data) => data.id === id);
    if (!targetData) {
        scheduleData.push({
            id: id,
            year: year,
            month: month,
            date: date,
            scheduleList: [dataObject]
        })
    } else {
        targetData.scheduleList.push(dataObject);
        scheduleData.splice(targetDataIndex, 1, targetData);
    }
    localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
    deleteEditedSchedule();
    clearCalender();
    renderCalendar(getCurrentYear(), getCurrentMonth());
    modalBootStrap.hide();
}

function deleteEditedSchedule() {
    if (scheduleModal.classList.contains('in-edit')) {
        removeScheduleFromLocalStorage(selectedDataId);
    }
}


function getSchedulesFromLocalStorage() {
    const scheduleData = localStorage.getItem('scheduleData');
    return scheduleData ? JSON.parse(scheduleData) : [];
}

function removeScheduleFromLocalStorage(dataId) {
    const scheduleData = getSchedulesFromLocalStorage();
    const id = dateToIdTransformer(selectedYear, selectedMonth, selectedDate);
    let targetDateSchedules = scheduleData.find((data) => data.id === id);
    const targetDateSchedulesIndex = scheduleData.findIndex((data) => data.id === id);
    const targetRemoveIndex = targetDateSchedules.scheduleList.findIndex((schedule) => schedule.dataId == dataId);
    targetDateSchedules.scheduleList.splice(targetRemoveIndex, 1);
    scheduleData[targetDateSchedulesIndex] = targetDateSchedules;
    localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
    clearCalender();
    renderCalendar(getCurrentYear(), getCurrentMonth());
}

function getCurrentYear() {
    return parseInt(document.querySelector('.calendar-header .year').textContent);
}
function getCurrentMonth() {
    const monthInText = document.querySelector('.calendar-header .month').textContent;
    return monthList.indexOf(monthInText) + 1;
}

function clearCalender() {
    document.querySelector('.dates').innerHTML = "";
}

function getModalYearValue() {
    return scheduleModalYearDropDown.value;
}

function getModalMonthValue() {
    return scheduleModalMonthDropDown.value;
}

function getModalDateValue() {
    return scheduleModalDateDropDown.value;
}

function dateToIdTransformer(year, month, date) {
    const paddedMonth = month.toString().length === 2 ? month.toString() : '0' + month.toString();
    const paddedDate = date.toString().length === 2 ? date.toString() : '0' + date.toString();
    return year.toString() + paddedMonth + paddedDate;
}

function setDateAttribute(dateTag, dateId, year, month, date) {
    dateTag.parentNode.setAttribute('dateId', dateId);
    dateTag.parentNode.setAttribute('year', year);
    dateTag.parentNode.setAttribute('month', month);
    dateTag.parentNode.setAttribute('date', date);
}

