import moment from 'moment';
import { CalendarGrid } from './CalendarGrid.js';

/**
 * Класс для управления календарным попапом
 */
export class CalendarPopup {
  /**
   *
   * @param {HTMLElement} element - Элемент попапа календаря
   * @param {string} type - Тип календаря ('departure' или 'return')
   * @param {TripManager} tripManager - Менеджер поездки
   * @param {function} onDateSelect - Функция для вызова при выборе даты
   */
  constructor(element, type, tripManager, onDateSelect) {
    this.element = element;
    this.type = type;
    this.tripManager = tripManager;
    this.onDateSelect = onDateSelect;
    this.isVisible = false;
  }

  /**
   * Показать календарь
   * @param {moment.Moment} currentDate - Текущая дата для отображения
   */
  show(currentDate) {
    // Если это календарь возврата и дата не раньше даты отправления, используем дату отправления
    let dateToShow = currentDate || moment();
    if (this.type === 'return' && this.tripManager.getDepartureDate()) {
      if (dateToShow.isBefore(this.tripManager.getDepartureDate(), 'day')) {
        dateToShow = this.tripManager.getDepartureDate().clone();
      }
    }

    this.render(dateToShow);
    this.element.style.display = 'block';
    this.isVisible = true;
  }

  /**
   * Скрыть календарь
   */
  hide() {
    this.element.style.display = 'none';
    this.isVisible = false;
  }

  /**
   * Отрисовать календарь
   * @param {moment.Moment} date - Дата для отображения
   */
  render(date) {
    const calendarGrid = new CalendarGrid(
      this.element,
      date,
      this.type,
      this.tripManager,
      this.onDateSelect
    );
    calendarGrid.render();
  }

  /**
   * Проверить, виден ли календарь
   * @returns {boolean} - true если календарь виден
   */
  getVisibility() {
    return this.isVisible;
  }
}
