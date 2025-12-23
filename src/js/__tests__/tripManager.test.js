import moment from 'moment';
import { TripManager } from '../TripManager.js';

// Установка локали для русского языка
moment.locale('ru');

describe('TripManager', () => {
  let tripManager;

  beforeEach(() => {
    tripManager = new TripManager();
  });

  describe('constructor', () => {
    test('должен инициализировать свойства по умолчанию', () => {
      expect(tripManager.departureDate).toBeNull();
      expect(tripManager.returnDate).toBeNull();
      expect(tripManager.isRoundtrip).toBe(true);
    });
  });

  describe('setDepartureDate', () => {
    test('должен установить дату выезда', () => {
      const date = moment('2023-06-15');
      tripManager.setDepartureDate(date);

      expect(tripManager.getDepartureDate().isSame(date, 'day')).toBe(true);
    });

    test('должен установить null если передан null', () => {
      tripManager.setDepartureDate(null);

      expect(tripManager.getDepartureDate()).toBeNull();
    });

    test('должен скорректировать дату возврата если она раньше даты выезда', () => {
      const departureDate = moment('2023-06-15');
      const returnDate = moment('2023-06-10');

      tripManager.setReturnDate(returnDate);
      tripManager.setDepartureDate(departureDate);

      expect(tripManager.getReturnDate().isSame(departureDate, 'day')).toBe(
        true
      );
    });

    test('должен создать копию даты вместо прямой ссылки', () => {
      const originalDate = moment('2023-06-15');
      tripManager.setDepartureDate(originalDate);

      // Изменяем оригинальную дату
      originalDate.add(1, 'day');

      expect(
        tripManager.getDepartureDate().isSame(moment('2023-06-15'), 'day')
      ).toBe(true);
    });
  });

  describe('setReturnDate', () => {
    test('должен установить дату возврата при односторонней поездке', () => {
      const returnDate = moment('2023-06-20');
      tripManager.setRoundtripStatus(false); // Односторонняя поездка

      tripManager.setReturnDate(returnDate);

      expect(tripManager.getReturnDate()).toBeNull();
    });

    test('должен установить дату возврата при туда-обратно', () => {
      const returnDate = moment('2023-06-20');
      tripManager.setRoundtripStatus(true); // Туда-обратно

      tripManager.setReturnDate(returnDate);

      expect(tripManager.getReturnDate().isSame(returnDate, 'day')).toBe(true);
    });

    test('должен скорректировать дату возврата если она раньше даты выезда', () => {
      const departureDate = moment('2023-06-15');
      const returnDate = moment('2023-06-10');

      tripManager.setDepartureDate(departureDate);
      tripManager.setReturnDate(returnDate);

      expect(tripManager.getReturnDate().isSame(departureDate, 'day')).toBe(
        true
      );
    });

    test('должен установить null если передан null', () => {
      tripManager.setReturnDate(null);

      expect(tripManager.getReturnDate()).toBeNull();
    });

    test('должен создать копию даты вместо прямой ссылки', () => {
      const originalDate = moment('2023-06-20');
      tripManager.setReturnDate(originalDate);

      // Изменяем оригинальную дату
      originalDate.add(1, 'day');

      expect(
        tripManager.getReturnDate().isSame(moment('2023-06-20'), 'day')
      ).toBe(true);
    });
  });

  describe('getRoundtripStatus', () => {
    test('должен вернуть текущий статус поездки', () => {
      expect(tripManager.getRoundtripStatus()).toBe(true);

      tripManager.setRoundtripStatus(false);
      expect(tripManager.getRoundtripStatus()).toBe(false);
    });
  });

  describe('setRoundtripStatus', () => {
    test('должен изменить статус поездки', () => {
      tripManager.setRoundtripStatus(false);
      expect(tripManager.isRoundtrip).toBe(false);
    });

    test('должен сбросить дату возврата при отключении режима туда-обратно', () => {
      const returnDate = moment('2023-06-20');
      tripManager.setReturnDate(returnDate);
      expect(tripManager.getReturnDate()).not.toBeNull();

      tripManager.setRoundtripStatus(false);
      expect(tripManager.getReturnDate()).toBeNull();
    });

    test('не должен сбросить дату возврата при включении режима туда-обратно', () => {
      tripManager.setRoundtripStatus(false);
      const returnDate = moment('2023-06-20');
      tripManager.setReturnDate(returnDate);
      expect(tripManager.getReturnDate()).toBeNull(); // Должна быть null из-за предыдущего отключения

      tripManager.setRoundtripStatus(true);
      expect(tripManager.getReturnDate()).toBeNull(); // Дата не должна быть восстановлена
    });
  });

  describe('getDepartureDate', () => {
    test('должен вернуть дату выезда', () => {
      const date = moment('2023-06-15');
      tripManager.setDepartureDate(date);

      expect(tripManager.getDepartureDate().isSame(date, 'day')).toBe(true);
    });

    test('должен вернуть null если дата выезда не установлена', () => {
      expect(tripManager.getDepartureDate()).toBeNull();
    });
  });

  describe('getReturnDate', () => {
    test('должен вернуть дату возврата', () => {
      const date = moment('2023-06-20');
      tripManager.setReturnDate(date);

      expect(tripManager.getReturnDate().isSame(date, 'day')).toBe(true);
    });

    test('должен вернуть null если дата возврата не установлена', () => {
      expect(tripManager.getReturnDate()).toBeNull();
    });
  });

  describe('isDateValid', () => {
    test('должен вернуть false для даты в прошлом', () => {
      const pastDate = moment().subtract(1, 'day');
      expect(tripManager.isDateValid(pastDate, 'departure')).toBe(false);
    });

    test('должен вернуть true для текущей даты', () => {
      const today = moment();
      expect(tripManager.isDateValid(today, 'departure')).toBe(true);
    });

    test('должен вернуть true для будущей даты', () => {
      const futureDate = moment().add(1, 'day');
      expect(tripManager.isDateValid(futureDate, 'departure')).toBe(true);
    });

    test('для типа \'return\' должен вернуть false если дата возврата раньше даты выезда', () => {
      const departureDate = moment().add(2, 'day');
      const returnDate = moment().add(1, 'day');

      tripManager.setDepartureDate(departureDate);
      expect(tripManager.isDateValid(returnDate, 'return')).toBe(false);
    });

    test('для типа \'return\' должен вернуть true если дата возврата не раньше даты выезда', () => {
      const departureDate = moment().add(1, 'day');
      const returnDate = moment().add(2, 'day');

      tripManager.setDepartureDate(departureDate);
      expect(tripManager.isDateValid(returnDate, 'return')).toBe(true);
    });

    test('для типа \'return\' должен вернуть true если дата возврата совпадает с датой выезда', () => {
      const departureDate = moment().add(1, 'day');
      const returnDate = moment().add(1, 'day');

      tripManager.setDepartureDate(departureDate);
      expect(tripManager.isDateValid(returnDate, 'return')).toBe(true);
    });

    test('для типа \'return\' должен вернуть true если дата выезда не установлена', () => {
      const returnDate = moment().add(1, 'day');
      expect(tripManager.isDateValid(returnDate, 'return')).toBe(true);
    });

    test('для типа \'departure\' не должен учитывать дату возврата', () => {
      const departureDate = moment().add(1, 'day');
      const returnDate = moment().add(2, 'day');

      tripManager.setReturnDate(returnDate);
      expect(tripManager.isDateValid(departureDate, 'departure')).toBe(true);
    });
  });
});
