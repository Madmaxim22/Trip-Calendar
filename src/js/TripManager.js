import moment from 'moment';

/**
 * Класс для управления логикой поездки (туда/обратно)
 */
export class TripManager {
  constructor() {
    this.departureDate = null;
    this.returnDate = null;
    this.isRoundtrip = true;
  }

  /**
   * Установить дату выезда
   * @param {moment.Moment} date - Дата выезда
   */
  setDepartureDate(date) {
    this.departureDate = date ? date.clone() : null;

    // Если дата возврата установлена и она раньше даты отправления, скорректировать
    if (
      this.returnDate &&
      this.returnDate.isBefore(this.departureDate, 'day')
    ) {
      this.returnDate = this.departureDate.clone();
    }
  }

  /**
   * Установить дату возврата
   * @param {moment.Moment} date - Дата возврата
   */
  setReturnDate(date) {
    if (!this.isRoundtrip) return;

    if (
      date &&
      this.departureDate &&
      date.isBefore(this.departureDate, 'day')
    ) {
      this.returnDate = this.departureDate.clone();
    } else {
      this.returnDate = date ? date.clone() : null;
    }
  }

  /**
   * Проверить, является ли поездка туда-обратно
   * @returns {boolean} - true если поездка туда-обратно
   */
  getRoundtripStatus() {
    return this.isRoundtrip;
  }

  /**
   * Установить статус поездки (туда-обратно или нет)
   * @param {boolean} status - статус поездки
   */
  setRoundtripStatus(status) {
    this.isRoundtrip = status;

    // Если отключаем режим туда-обратно, сбрасываем дату возврата
    if (!status) {
      this.returnDate = null;
    }
  }

  /**
   * Получить дату выезда
   * @returns {moment.Moment|null} - Дата выезда
   */
  getDepartureDate() {
    return this.departureDate;
  }

  /**
   * Получить дату возврата
   * @returns {moment.Moment|null} - Дата возврата
   */
  getReturnDate() {
    return this.returnDate;
  }

  /**
   * Проверить, является ли дата валидной для выбора
   * @param {moment.Moment} date - Дата для проверки
   * @param {string} type - Тип календаря ('departure' или 'return')
   * @returns {boolean} - true если дата валидна
   */
  isDateValid(date, type) {
    const today = moment();

    // Дата не должна быть в прошлом
    if (date.isBefore(today, 'day')) {
      return false;
    }

    // Для даты возврата не должна быть раньше даты выезда
    if (
      type === 'return' &&
      this.departureDate &&
      date.isBefore(this.departureDate, 'day')
    ) {
      return false;
    }

    return true;
  }
}
