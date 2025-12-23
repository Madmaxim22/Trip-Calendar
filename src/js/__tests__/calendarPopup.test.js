import moment from 'moment';
import { CalendarPopup } from '../CalendarPopup.js';
import { CalendarGrid } from '../CalendarGrid.js';
import { TripManager } from '../TripManager.js';

// Установка локали для русского языка
moment.locale('ru');

describe('CalendarPopup', () => {
  let container;
  let tripManager;
  let onDateSelect;
  let calendarPopup;

  beforeEach(() => {
    // Создаем DOM контейнер
    document.body.innerHTML = '<div id="calendar-popup"></div>';
    container = document.getElementById('calendar-popup');

    // Mock для TripManager
    tripManager = new TripManager();

    // Mock для функции обратного вызова
    onDateSelect = jest.fn();

    // Создаем экземпляр CalendarPopup
    calendarPopup = new CalendarPopup(
      container,
      'departure',
      tripManager,
      onDateSelect
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('должен инициализировать свойства', () => {
      expect(calendarPopup.element).toBe(container);
      expect(calendarPopup.type).toBe('departure');
      expect(calendarPopup.tripManager).toBe(tripManager);
      expect(calendarPopup.onDateSelect).toBe(onDateSelect);
      expect(calendarPopup.isVisible).toBe(false);
    });
  });

  describe('show', () => {
    test('должен отобразить календарь и установить isVisible в true', () => {
      calendarPopup.show();

      expect(container.style.display).toBe('block');
      expect(calendarPopup.isVisible).toBe(true);
    });

    test('должен использовать текущую дату, если currentDate не передана', () => {
      const renderSpy = jest.spyOn(calendarPopup, 'render');

      calendarPopup.show();

      // Проверяем, что render был вызван с моментом времени, близким к текущему
      expect(renderSpy).toHaveBeenCalledWith(expect.any(moment));
      // Проверяем, что переданная дата близка к текущей (в пределах 1 секунды)
      const calledWith = renderSpy.mock.calls[0][0];
      expect(moment().diff(calledWith, 'seconds')).toBeLessThan(2);
    });

    test('должен использовать переданную дату, если она указана', () => {
      const customDate = moment('2023-06-15');
      const renderSpy = jest.spyOn(calendarPopup, 'render');

      calendarPopup.show(customDate);

      expect(renderSpy).toHaveBeenCalledWith(customDate);
    });

    test('для календаря возврата должен использовать дату отправления, если переданная дата раньше', () => {
      const departureDate = moment('2023-06-15');
      tripManager.setDepartureDate(departureDate);

      const returnPopup = new CalendarPopup(
        container,
        'return',
        tripManager,
        onDateSelect
      );

      const pastDate = moment('2023-06-10');
      const renderSpy = jest.spyOn(returnPopup, 'render');

      returnPopup.show(pastDate);

      expect(renderSpy).toHaveBeenCalledWith(departureDate);
    });

    test('для календаря возврата должен использовать переданную дату, если она не раньше даты отправления', () => {
      const departureDate = moment('2023-06-15');
      tripManager.setDepartureDate(departureDate);

      const returnPopup = new CalendarPopup(
        container,
        'return',
        tripManager,
        onDateSelect
      );

      const validReturnDate = moment('2023-06-20');
      const renderSpy = jest.spyOn(returnPopup, 'render');

      returnPopup.show(validReturnDate);

      expect(renderSpy).toHaveBeenCalledWith(validReturnDate);
    });
  });

  describe('hide', () => {
    test('должен скрыть календарь и установить isVisible в false', () => {
      // Сначала показываем календарь
      calendarPopup.show();

      expect(container.style.display).toBe('block');
      expect(calendarPopup.isVisible).toBe(true);

      // Затем скрываем
      calendarPopup.hide();

      expect(container.style.display).toBe('none');
      expect(calendarPopup.isVisible).toBe(false);
    });
  });

  describe('render', () => {
    test('должен создать экземпляр CalendarGrid с правильными параметрами', () => {
      const mockDate = moment('2023-06-15');

      // Мокаем конструктор CalendarGrid
      const calendarGridSpy = jest
        .spyOn(CalendarGrid.prototype, 'render')
        .mockImplementation(() => {});

      calendarPopup.render(mockDate);

      // Проверяем, что CalendarGrid был создан с правильными параметрами
      expect(CalendarGrid.prototype.render).toHaveBeenCalled();

      // Восстанавливаем мок
      CalendarGrid.prototype.render.mockRestore();
    });
  });

  describe('getVisibility', () => {
    test('должен вернуть текущее состояние видимости', () => {
      expect(calendarPopup.getVisibility()).toBe(false);

      calendarPopup.show();
      expect(calendarPopup.getVisibility()).toBe(true);

      calendarPopup.hide();
      expect(calendarPopup.getVisibility()).toBe(false);
    });
  });
});
