import moment from 'moment';
import { TripManager } from './TripManager.js';
import { DateInput } from './DateInput.js';
import { CalendarPopup } from './CalendarPopup.js';

// Установка локали для русского языка
moment.locale('ru');

class CalendarWidget {
  constructor() {
    this.tripManager = new TripManager();

    this.initializeElements();
    this.initializeComponents();
    this.bindEvents();
    this.updateUI();
  }

  initializeElements() {
    this.roundtripCheckbox = document.getElementById('roundtrip');
    this.departureInput = document.getElementById('departure-date');
    this.returnInput = document.getElementById('return-date');
    this.departureCalendar = document.getElementById('departure-calendar');
    this.returnCalendar = document.getElementById('return-calendar');
    this.returnContainer = document.getElementById('return-date-container');

    // Скрыть календарь "обратно" если чекбокс не отмечен
    if (!this.roundtripCheckbox.checked) {
      this.returnContainer.style.display = 'none';
    }
  }

  initializeComponents() {
    // Инициализация компонентов ввода дат
    this.departureDateInput = new DateInput(
      this.departureInput,
      'departure',
      this.tripManager,
      (type) => this.showCalendar(type)
    );

    this.returnDateInput = new DateInput(
      this.returnInput,
      'return',
      this.tripManager,
      (type) => this.showCalendar(type)
    );

    // Инициализация календарных попапов
    this.departureCalendarPopup = new CalendarPopup(
      this.departureCalendar,
      'departure',
      this.tripManager,
      (date, type) => this.handleDateSelection(date, type)
    );

    this.returnCalendarPopup = new CalendarPopup(
      this.returnCalendar,
      'return',
      this.tripManager,
      (date, type) => this.handleDateSelection(date, type)
    );
  }

  bindEvents() {
    // События для чекбокса "туда-обратно"
    this.roundtripCheckbox.addEventListener('change', () => {
      this.tripManager.setRoundtripStatus(this.roundtripCheckbox.checked);
      this.returnContainer.style.display = this.tripManager.getRoundtripStatus()
        ? 'block'
        : 'none';

      this.updateUI();
    });

    // Закрытие календарей при клике вне их области
    document.addEventListener('click', (e) => {
      if (
        !e.target.closest('.calendar-popup') &&
        !e.target.closest('.date-input')
      ) {
        this.hideAllCalendars();
      }
    });
  }

  showCalendar(type) {
    this.hideAllCalendars();

    if (type === 'departure') {
      const date = this.tripManager.getDepartureDate() || moment();
      this.departureCalendarPopup.show(date);
    } else if (type === 'return' && this.tripManager.getRoundtripStatus()) {
      const date =
        this.tripManager.getReturnDate() ||
        (this.tripManager.getDepartureDate()
          ? this.tripManager.getDepartureDate().clone()
          : moment());
      this.returnCalendarPopup.show(date);
    }
  }

  hideAllCalendars() {
    this.departureCalendarPopup.hide();
    this.returnCalendarPopup.hide();
  }

  handleDateSelection(selectedDate, type) {
    if (type === 'departure') {
      this.tripManager.setDepartureDate(selectedDate);
    } else if (type === 'return') {
      this.tripManager.setReturnDate(selectedDate);
    }

    this.hideAllCalendars();
    this.updateUI();
  }

  updateUI() {
    // Обновляем отображение дат
    this.departureDateInput.updateDisplay();
    this.returnDateInput.updateDisplay();

    // Если дата отправления не установлена, скрываем календарь возврата
    if (
      !this.tripManager.getDepartureDate() &&
      this.tripManager.getRoundtripStatus()
    ) {
      this.returnDateInput.updateDisplay();
    }
  }
}

// Инициализация виджета календаря при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new CalendarWidget();
});
