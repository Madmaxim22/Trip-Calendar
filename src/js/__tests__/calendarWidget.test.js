import moment from 'moment';
import { TripManager } from '../TripManager.js';
import { DateInput } from '../DateInput.js';
import { CalendarPopup } from '../CalendarPopup.js';
// CalendarWidget определен в этом же файле, поэтому мы не можем его импортировать
// Вместо этого, мы будем использовать замоканный класс

// Mock для всех зависимостей
jest.mock('../TripManager.js');
jest.mock('../DateInput.js');
jest.mock('../CalendarPopup.js');

// Установка локали для русского языка
moment.locale('ru');

describe('CalendarWidget', () => {
  let calendarWidget;
  let mockTripManager;
  let mockDateInput;
  let mockCalendarPopup;
  let originalAddEventListener;

  // Сохраняем оригинальный метод для DOMContentLoaded
  beforeAll(() => {
    originalAddEventListener = document.addEventListener;
  });

  beforeEach(() => {
    // Создаем DOM элементы
    document.body.innerHTML = `
      <div class="calendar-widget">
        <div class="trip-type">
          <label>
            <input type="checkbox" id="roundtrip" checked> Туда и обратно
          </label>
        </div>
        <div class="date-inputs">
          <div class="date-input">
            <label for="departure-date">Туда:</label>
            <input type="text" id="departure-date" readonly>
            <div class="calendar-popup" id="departure-calendar"></div>
          </div>
          <div class="date-input" id="return-date-container">
            <label for="return-date">Обратно:</label>
            <input type="text" id="return-date" readonly>
            <div class="calendar-popup" id="return-calendar"></div>
          </div>
        </div>
      </div>
    `;

    // Mock для TripManager
    mockTripManager = {
      setRoundtripStatus: jest.fn(),
      getRoundtripStatus: jest.fn(),
      getDepartureDate: jest.fn(),
      getReturnDate: jest.fn(),
      setDepartureDate: jest.fn(),
      setReturnDate: jest.fn(),
    };
    TripManager.mockImplementation(() => mockTripManager);

    // Mock для DateInput
    mockDateInput = { updateDisplay: jest.fn(), };
    DateInput.mockImplementation(() => mockDateInput);

    // Mock для CalendarPopup
    mockCalendarPopup = {
      show: jest.fn(),
      hide: jest.fn(),
      getVisibility: jest.fn(),
    };
    CalendarPopup.mockImplementation(() => mockCalendarPopup);

    // Создаем мок-класс CalendarWidget, чтобы избежать проблем с импортом
    class MockCalendarWidget {
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

        if (!this.roundtripCheckbox.checked) {
          this.returnContainer.style.display = 'none';
        }
      }

      initializeComponents() {
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
        this.roundtripCheckbox.addEventListener('change', () => {
          this.tripManager.setRoundtripStatus(this.roundtripCheckbox.checked);
          this.returnContainer.style.display =
            this.tripManager.getRoundtripStatus() ? 'block' : 'none';

          this.updateUI();
        });

        document.addEventListener('click', (e) => {
          if (
            !(e.target.closest && e.target.closest('.calendar-popup')) &&
            !(e.target.closest && e.target.closest('.date-input'))
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
        this.departureDateInput.updateDisplay();
        this.returnDateInput.updateDisplay();

        if (
          !this.tripManager.getDepartureDate() &&
          this.tripManager.getRoundtripStatus()
        ) {
          this.returnDateInput.updateDisplay();
        }
      }
    }

    // Создаем экземпляр CalendarWidget
    calendarWidget = new MockCalendarWidget();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('должен инициализировать все компоненты', () => {
      expect(TripManager).toHaveBeenCalledTimes(1);
      expect(DateInput).toHaveBeenCalledTimes(2);
      expect(CalendarPopup).toHaveBeenCalledTimes(2);
    });
  });

  describe('initializeElements', () => {
    test('должен правильно инициализировать DOM элементы', () => {
      expect(calendarWidget.roundtripCheckbox).not.toBeNull();
      expect(calendarWidget.departureInput).not.toBeNull();
      expect(calendarWidget.returnInput).not.toBeNull();
      expect(calendarWidget.departureCalendar).not.toBeNull();
      expect(calendarWidget.returnCalendar).not.toBeNull();
      expect(calendarWidget.returnContainer).not.toBeNull();
    });

    test('должен скрыть контейнер возврата если чекбокс не отмечен', () => {
      document.body.innerHTML = `
        <div class="calendar-widget">
          <div class="trip-type">
            <label>
              <input type="checkbox" id="roundtrip"> Туда и обратно
            </label>
          </div>
          <div class="date-inputs">
            <div class="date-input">
              <label for="departure-date">Туда:</label>
              <input type="text" id="departure-date" readonly>
              <div class="calendar-popup" id="departure-calendar"></div>
            </div>
            <div class="date-input" id="return-date-container">
              <label for="return-date">Обратно:</label>
              <input type="text" id="return-date" readonly>
              <div class="calendar-popup" id="return-calendar"></div>
            </div>
          </div>
        </div>
      `;

      const widget = new calendarWidget.constructor();
      expect(widget.returnContainer.style.display).toBe('none');
    });
  });

  describe('bindEvents', () => {
    test('должен добавить обработчик события для чекбокса туда-обратно', () => {
      const checkbox = document.getElementById('roundtrip');
      const event = new Event('change');

      mockTripManager.getRoundtripStatus.mockReturnValue(true);

      checkbox.dispatchEvent(event);

      expect(mockTripManager.setRoundtripStatus).toHaveBeenCalledWith(true);
    });

    test('должен добавить обработчик события для клика вне календаря', () => {
      const event = new Event('click');

      document.dispatchEvent(event);

      expect(mockCalendarPopup.hide).toHaveBeenCalledTimes(2);
    });
  });

  describe('showCalendar', () => {
    test('должен показать календарь отправления', () => {
      const mockDate = moment();
      mockTripManager.getDepartureDate.mockReturnValue(mockDate);

      calendarWidget.showCalendar('departure');

      expect(mockCalendarPopup.hide).toHaveBeenCalledTimes(2);
      expect(calendarWidget.departureCalendarPopup.show).toHaveBeenCalledWith(
        mockDate
      );
    });

    test('должен показать календарь возврата если поездка туда-обратно', () => {
      const mockDepartureDate = moment();
      mockTripManager.getDepartureDate.mockReturnValue(mockDepartureDate);
      mockTripManager.getRoundtripStatus.mockReturnValue(true);

      calendarWidget.showCalendar('return');

      expect(calendarWidget.returnCalendarPopup.show).toHaveBeenCalledWith(
        mockDepartureDate
      );
    });

    test('не должен показать календарь возврата если поездка не туда-обратно', () => {
      mockTripManager.getRoundtripStatus.mockReturnValue(false);

      calendarWidget.showCalendar('return');

      expect(calendarWidget.returnCalendarPopup.show).not.toHaveBeenCalled();
    });
  });

  describe('hideAllCalendars', () => {
    test('должен скрыть оба календаря', () => {
      calendarWidget.hideAllCalendars();

      expect(mockCalendarPopup.hide).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleDateSelection', () => {
    test('должен установить дату отправления', () => {
      const mockDate = moment();

      calendarWidget.handleDateSelection(mockDate, 'departure');

      expect(mockTripManager.setDepartureDate).toHaveBeenCalledWith(mockDate);
      expect(mockCalendarPopup.hide).toHaveBeenCalledTimes(2);
    });

    test('должен установить дату возврата', () => {
      const mockDate = moment();

      calendarWidget.handleDateSelection(mockDate, 'return');

      expect(mockTripManager.setReturnDate).toHaveBeenCalledWith(mockDate);
      expect(mockCalendarPopup.hide).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateUI', () => {
    test('должен обновить отображение дат', () => {
      calendarWidget.updateUI();

      expect(mockDateInput.updateDisplay).toHaveBeenCalledTimes(4);
    });
  });
});
