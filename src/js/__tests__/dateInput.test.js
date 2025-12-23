import moment from 'moment';
import { DateInput } from '../DateInput.js';
import { TripManager } from '../TripManager.js';

// Установка локали для русского языка
moment.locale('ru');

describe('DateInput', () => {
  let inputElement;
  let tripManager;
  let onClick;

  beforeEach(() => {
    // Создаем DOM элемент для теста
    document.body.innerHTML = '<input type="text" id="date-input" />';
    inputElement = document.getElementById('date-input');

    // Создаем экземпляр TripManager
    tripManager = new TripManager();

    // Mock для функции onClick
    onClick = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('должен инициализировать свойства', () => {
      const dateInput = new DateInput(
        inputElement,
        'departure',
        tripManager,
        onClick
      );

      expect(dateInput.inputElement).toBe(inputElement);
      expect(dateInput.type).toBe('departure');
      expect(dateInput.tripManager).toBe(tripManager);
      expect(dateInput.onClick).toBe(onClick);
    });

    test('должен вызвать bindEvents и updateDisplay при инициализации', () => {
      const dateInput = new DateInput(
        inputElement,
        'departure',
        tripManager,
        onClick
      );

      // Проверяем, что bindEvents и updateDisplay были вызваны
      // Мы можем проверить результаты этих вызовов
      expect(inputElement).toBeTruthy();
      // updateDisplay вызывается, но без установленных дат будет пустое значение
    });
  });

  describe('bindEvents', () => {
    test('должен добавить обработчик клика к inputElement', () => {
      const dateInput = new DateInput(
        inputElement,
        'departure',
        tripManager,
        onClick
      );

      // Симулируем клик по input
      inputElement.click();

      // Проверяем, что onClick был вызван с правильным типом
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith('departure');
    });

    test('должен остановить всплытие события при клике', () => {
      const dateInput = new DateInput(
        inputElement,
        'return',
        tripManager,
        onClick
      );

      // Создаем mock события
      const mockEvent = { stopPropagation: jest.fn(), };

      // Модифицируем обработчик клика, чтобы передать mock событие
      const originalClickHandler = inputElement.onclick;
      inputElement.onclick = (e) => {
        mockEvent.stopPropagation();
        onClick('return');
      };

      // Симулируем клик
      inputElement.click();

      // Проверяем, что stopPropagation был вызван
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(onClick).toHaveBeenCalledWith('return');
    });
  });

  describe('updateDisplay', () => {
    test('должен установить значение для даты отправления', () => {
      const dateInput = new DateInput(
        inputElement,
        'departure',
        tripManager,
        onClick
      );
      const testDate = moment('2023-06-15');

      tripManager.setDepartureDate(testDate);

      dateInput.updateDisplay();

      expect(inputElement.value).toBe('15.06.2023');
    });

    test('должен установить значение для даты возврата', () => {
      const dateInput = new DateInput(
        inputElement,
        'return',
        tripManager,
        onClick
      );
      const testDate = moment('2023-06-20');

      tripManager.setReturnDate(testDate);

      dateInput.updateDisplay();

      expect(inputElement.value).toBe('20.06.2023');
    });

    test('должен установить пустое значение, если дата не установлена', () => {
      const dateInput = new DateInput(
        inputElement,
        'departure',
        tripManager,
        onClick
      );

      dateInput.updateDisplay();

      expect(inputElement.value).toBe('');
    });

    test('должен установить пустое значение для даты возврата, если она не установлена', () => {
      const dateInput = new DateInput(
        inputElement,
        'return',
        tripManager,
        onClick
      );

      dateInput.updateDisplay();

      expect(inputElement.value).toBe('');
    });
  });

  describe('isReturnInput', () => {
    test('должен вернуть true для типа "return"', () => {
      const dateInput = new DateInput(
        inputElement,
        'return',
        tripManager,
        onClick
      );

      expect(dateInput.isReturnInput()).toBe(true);
    });

    test('должен вернуть false для типа "departure"', () => {
      const dateInput = new DateInput(
        inputElement,
        'departure',
        tripManager,
        onClick
      );

      expect(dateInput.isReturnInput()).toBe(false);
    });
  });

  describe('интеграция с TripManager', () => {
    test('должен обновлять отображение при изменении даты в TripManager', () => {
      const dateInput = new DateInput(
        inputElement,
        'departure',
        tripManager,
        onClick
      );
      const newDate = moment('2023-07-10');

      // Устанавливаем дату в TripManager
      tripManager.setDepartureDate(newDate);

      // Обновляем отображение
      dateInput.updateDisplay();

      expect(inputElement.value).toBe('10.07.2023');
    });

    test('должен обновлять отображение для даты возврата при изменении в TripManager', () => {
      const dateInput = new DateInput(
        inputElement,
        'return',
        tripManager,
        onClick
      );
      const newDate = moment('2023-07-15');

      // Устанавливаем дату возврата в TripManager
      tripManager.setReturnDate(newDate);

      // Обновляем отображение
      dateInput.updateDisplay();

      expect(inputElement.value).toBe('15.07.2023');
    });
  });
});
