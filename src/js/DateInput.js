import moment from 'moment';

/**
 * Класс для управления полем ввода даты
 */
export class DateInput {
  /**
   *
   * @param {HTMLElement} inputElement - Элемент поля ввода
   * @param {string} type - Тип поля ('departure' или 'return')
   * @param {TripManager} tripManager - Менеджер поездки
   * @param {function} onClick - Функция для вызова при клике на поле
   */
  constructor(inputElement, type, tripManager, onClick) {
    this.inputElement = inputElement;
    this.type = type;
    this.tripManager = tripManager;
    this.onClick = onClick;

    this.bindEvents();
    this.updateDisplay();
  }

  /**
   * Привязать события
   */
  bindEvents() {
    this.inputElement.addEventListener('click', (e) => {
      // stopPropagation предотвращения всплытия клика на родительском элементе,
      // который вызывает закрытие элемента
      e.stopPropagation();
      this.onClick(this.type);
    });
  }

  /**
   * Обновить отображение даты
   */
  updateDisplay() {
    if (this.type === 'departure') {
      const date = this.tripManager.getDepartureDate();
      this.inputElement.value = date ? date.format('DD.MM.YYYY') : '';
    } else if (this.type === 'return') {
      const date = this.tripManager.getReturnDate();
      this.inputElement.value = date ? date.format('DD.MM.YYYY') : '';
    }
  }

  /**
   * Проверить, является ли поле ввода для даты возврата
   * @returns {boolean} - true если поле для даты возврата
   */
  isReturnInput() {
    return this.type === 'return';
  }
}
