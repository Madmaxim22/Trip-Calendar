import moment from 'moment';

/**
 * Класс для отображения сетки календаря
 */
export class CalendarGrid {
  /**
   *
   * @param {HTMLElement} container - Контейнер для сетки календаря
   * @param {moment.Moment} date - Дата для отображения месяца
   * @param {string} type - Тип календаря ('departure' или 'return')
   * @param {TripManager} tripManager - Менеджер поездки
   * @param {function} onDateSelect - Функция для вызова при выборе даты
   */
  constructor(container, date, type, tripManager, onDateSelect) {
    this.container = container;
    this.date = date;
    this.type = type;
    this.tripManager = tripManager;
    this.onDateSelect = onDateSelect;
  }

  /**
   * Отрисовать сетку календаря
   */
  render() {
    this.container.innerHTML = '';

    const today = moment();
    const monthStart = moment(this.date).startOf('month');
    const monthEnd = moment(this.date).endOf('month');

    // Заголовок календаря с навигацией по месяцам
    const header = this.createHeader();

    // Дни недели
    const weekdays = this.createWeekdays();

    // Создание сетки календаря
    const calendarGrid = this.createCalendarGrid();

    this.container.append(header);
    this.container.append(weekdays);
    this.container.append(calendarGrid);
  }

  /**
   * Создать заголовок календаря
   * @returns {HTMLElement} - Элемент заголовка
   */
  createHeader() {
    const header = document.createElement('div');
    header.className = 'calendar-header';

    const prevMonthBtn = document.createElement('button');
    prevMonthBtn.innerHTML = '<';
    prevMonthBtn.addEventListener('click', (e) => {
      // stopPropagation предотвращения всплытия клика на родительском элементе,
      // который вызывает закрытие элемента
      e.stopPropagation();
      this.handlePrevMonth();
    });

    const monthYear = document.createElement('span');
    monthYear.textContent = `${moment(this.date).format('MMMM YYYY')}`;

    const nextMonthBtn = document.createElement('button');
    nextMonthBtn.innerHTML = '>';
    nextMonthBtn.addEventListener('click', (e) => {
      // stopPropagation предотвращения всплытия клика на родительском элементе,
      // который вызывает закрытие элемента
      e.stopPropagation();
      this.handleNextMonth();
    });

    header.append(prevMonthBtn);
    header.append(monthYear);
    header.append(nextMonthBtn);

    return header;
  }

  /**
   * Создать элементы дней недели
   * @returns {HTMLElement} - Элемент с днями недели
   */
  createWeekdays() {
    const weekdays = document.createElement('div');
    weekdays.className = 'weekdays';
    [
      'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'
    ].forEach((day) => {
      const dayEl = document.createElement('div');
      dayEl.className = 'weekday';
      dayEl.textContent = day;
      weekdays.append(dayEl);
    });

    return weekdays;
  }

  /**
   * Создать сетку календаря
   * @returns {HTMLElement} - Элемент сетки календаря
   */
  createCalendarGrid() {
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';

    const monthStart = moment(this.date).startOf('month');
    const monthEnd = moment(this.date).endOf('month');
    const today = moment();

    // Добавление пустых ячеек для дней до начала месяца
    const firstDayOfWeek = monthStart.day() === 0 ? 7 : monthStart.day(); // Воскресенье = 0, но мы хотим его в конец
    for (let i = 1; i < firstDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day empty';
      calendarGrid.append(emptyCell);
    }

    // Добавление дней месяца
    for (
      let day = moment(monthStart);
      day.isSame(monthEnd, 'month');
      day.add(1, 'day')
    ) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.textContent = day.date();

      // Проверка, является ли день сегодняшним
      if (day.isSame(today, 'day')) {
        dayEl.classList.add('today');
      }

      // Проверка, является ли день датой поездки
      if (
        this.type === 'departure' &&
        this.tripManager.getDepartureDate() &&
        day.isSame(this.tripManager.getDepartureDate(), 'day')
      ) {
        dayEl.classList.add('selected');
      } else if (
        this.type === 'return' &&
        this.tripManager.getReturnDate() &&
        day.isSame(this.tripManager.getReturnDate(), 'day')
      ) {
        dayEl.classList.add('selected');
      }

      // Проверка, является ли день в прошлом (неактивный)
      if (!this.tripManager.isDateValid(day, this.type)) {
        dayEl.classList.add('disabled');
      }

      // Добавляем дату в атрибут для последующего делегирования событий
      if (!dayEl.classList.contains('disabled')) {
        dayEl.setAttribute('data-date', day.format('YYYY-MM-DD'));
        dayEl.classList.add('selectable-day');
      }

      calendarGrid.append(dayEl);
    }

    // Добавляем обработчик клика на сетку календаря для делегирования событий
    calendarGrid.addEventListener('click', (e) => {
      this.handleDayClick(e);
    });

    return calendarGrid;
  }

  /**
   * Обработать клик по дню
   * @param {Event} e - Событие клика
   */
  handleDayClick(e) {
    if (e.target.classList.contains('selectable-day')) {
      const selectedDate = moment(
        e.target.getAttribute('data-date'),
        'YYYY-MM-DD'
      );

      this.onDateSelect(selectedDate, this.type);
    }
  }

  /**
   * Обработать клик по кнопке предыдущего месяца
   */
  handlePrevMonth() {
    const newDate = moment(this.date).subtract(1, 'month');
    this.date = newDate;
    this.render();
  }

  /**
   * Обработать клик по кнопке следующего месяца
   */
  handleNextMonth() {
    const newDate = moment(this.date).add(1, 'month');
    this.date = newDate;
    this.render();
  }
}
