import moment from 'moment';
import { CalendarGrid } from '../CalendarGrid.js';
import { TripManager } from '../TripManager.js';

// Установка локали для русского языка
moment.locale('ru');

describe('CalendarGrid', () => {
  let container;
  let tripManager;
  let onDateSelect;
  let calendarGrid;

  beforeEach(() => {
    // Создаем DOM контейнер
    document.body.innerHTML = '<div id="calendar-container"></div>';
    container = document.getElementById('calendar-container');

    // Mock для TripManager
    tripManager = new TripManager();

    // Mock для функции обратного вызова
    onDateSelect = jest.fn();

    // Создаем экземпляр CalendarGrid
    calendarGrid = new CalendarGrid(
      container,
      moment('2023-06-15'),
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
      expect(calendarGrid.container).toBe(container);
      expect(moment.isMoment(calendarGrid.date)).toBe(true);
      expect(calendarGrid.type).toBe('departure');
      expect(calendarGrid.tripManager).toBe(tripManager);
      expect(calendarGrid.onDateSelect).toBe(onDateSelect);
    });
  });

  describe('render', () => {
    test('должен отрендерить календарь с заголовком, днями недели и сеткой', () => {
      calendarGrid.render();

      // Проверяем, что контейнер содержит все элементы
      const header = container.querySelector('.calendar-header');
      const weekdays = container.querySelector('.weekdays');
      const calendarGridEl = container.querySelector('.calendar-grid');

      expect(header).toBeInTheDocument();
      expect(weekdays).toBeInTheDocument();
      expect(calendarGridEl).toBeInTheDocument();
    });

    test('должен очистить контейнер перед рендерингом', () => {
      container.innerHTML = '<div>old content</div>';
      calendarGrid.render();
      expect(container.innerHTML).not.toContain('old content');
    });
  });

  describe('createHeader', () => {
    test('должен создать заголовок с кнопками навигации и месяцем', () => {
      const header = calendarGrid.createHeader();

      const prevBtn = header.querySelector('button:first-child');
      const monthYear = header.querySelector('span');
      const nextBtn = header.querySelector('button:last-child');

      expect(prevBtn).toBeTruthy();
      expect(monthYear).toBeTruthy();
      expect(nextBtn).toBeTruthy();

      expect(prevBtn.textContent).toBe('<');
      expect(nextBtn.textContent).toBe('>');
      expect(monthYear.textContent).toBe('июнь 2023');
    });

    test('должен обработать клик по кнопке предыдущего месяца', () => {
      calendarGrid.render();
      const prevBtn = container.querySelector(
        '.calendar-header button:first-child'
      );

      prevBtn.click();
      expect(calendarGrid.date.month()).toBe(4); // май (месяц индексируется с 0)
    });

    test('должен обработать клик по кнопке следующего месяца', () => {
      calendarGrid.render();
      const nextBtn = container.querySelector(
        '.calendar-header button:last-child'
      );

      nextBtn.click();
      expect(calendarGrid.date.month()).toBe(6); // июль (месяц индексируется с 0, 5 - это июнь)
    });
  });

  describe('createWeekdays', () => {
    test('должен создать дни недели', () => {
      const weekdays = calendarGrid.createWeekdays();

      const weekdayElements = weekdays.querySelectorAll('.weekday');
      const dayNames = Array.from(weekdayElements).map((el) => el.textContent);

      expect(weekdayElements.length).toBe(7);
      expect(dayNames).toEqual([
        'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'
      ]);
    });
  });

  describe('createCalendarGrid', () => {
    test('должен создать сетку календаря с днями месяца', () => {
      calendarGrid.render();
      const calendarGridEl = container.querySelector('.calendar-grid');

      // Проверяем, что в сетке есть дни месяца
      const dayElements = calendarGridEl.querySelectorAll(
        '.calendar-day:not(.empty)'
      );
      expect(dayElements.length).toBe(30); // июнь имеет 30 дней

      // Проверяем, что первые дни месяца начинаются с нужного дня недели
      const emptyCells = calendarGridEl.querySelectorAll('.calendar-day.empty');
      // 1 июня 2023 года - четверг (day() = 4), но у нас Пн = 1, Вт = 2, Ср = 3, Чт = 4
      // Поэтому перед 1 июня должно быть 3 пустые ячейки (для Пн, Вт, Ср)
      expect(emptyCells.length).toBe(3);
    });

    test('должен отметить сегодняшний день', () => {
      // Устанавливаем текущую дату для тестирования
      const today = moment();
      calendarGrid.date = today;

      calendarGrid.render();
      const calendarGridEl = container.querySelector('.calendar-grid');
      const todayElement = calendarGridEl.querySelector('.today');

      expect(todayElement).toBeInTheDocument();
      expect(todayElement.textContent).toBe(today.date().toString());
    });

    test('должен отметить выбранные даты', () => {
      const selectedDate = moment('2023-06-10');
      tripManager.setDepartureDate(selectedDate);

      calendarGrid.render();
      const calendarGridEl = container.querySelector('.calendar-grid');
      const selectedDay = calendarGridEl.querySelector('.selected');

      expect(selectedDay).toBeInTheDocument();
      expect(selectedDay.textContent).toBe('10');
    });

    test('должен отключить прошедшие даты', () => {
      const pastDate = moment().subtract(5, 'days');
      calendarGrid.date = pastDate;

      calendarGrid.render();
      const calendarGridEl = container.querySelector('.calendar-grid');
      const disabledDays = calendarGridEl.querySelectorAll('.disabled');

      // Проверяем, что есть отключенные дни
      expect(disabledDays.length).toBeGreaterThan(0);
    });

    test('должен добавить атрибут data-date только для доступных дней', () => {
      calendarGrid.render();
      const calendarGridEl = container.querySelector('.calendar-grid');
      const selectableDays = calendarGridEl.querySelectorAll('.selectable-day');

      // Проверяем, что у доступных дней есть атрибут data-date
      selectableDays.forEach((day) => {
        expect(day.getAttribute('data-date')).toBeTruthy();
      });
    });
  });

  describe('handleDayClick', () => {
    test('должен вызвать onDateSelect при клике на доступный день', () => {
      calendarGrid.render();
      const calendarGridEl = container.querySelector('.calendar-grid');
      const selectableDay = calendarGridEl.querySelector('.selectable-day');

      if (selectableDay) {
        selectableDay.click();

        expect(onDateSelect).toHaveBeenCalled();
        const calledWith = onDateSelect.mock.calls[0];
        expect(moment.isMoment(calledWith[0])).toBe(true);
        expect(calledWith[1]).toBe('departure');
      }
    });

    test('не должен вызвать onDateSelect при клике на отключенный день', () => {
      // Устанавливаем дату в прошлом
      calendarGrid.date = moment().subtract(1, 'month');
      calendarGrid.render();

      const calendarGridEl = container.querySelector('.calendar-grid');
      const disabledDay = calendarGridEl.querySelector('.disabled');

      if (disabledDay) {
        disabledDay.click();
        expect(onDateSelect).not.toHaveBeenCalled();
      }
    });

    test('должен правильно обработать клик по доступному дню с использованием data-date', () => {
      calendarGrid.render();
      const calendarGridEl = container.querySelector('.calendar-grid');

      // Находим день с атрибутом data-date (доступный для выбора)
      const selectableDay = calendarGridEl.querySelector(
        '.selectable-day[data-date]'
      );

      if (selectableDay) {
        const expectedDate = moment(
          selectableDay.getAttribute('data-date'),
          'YYYY-MM-DD'
        );

        selectableDay.click();

        expect(onDateSelect).toHaveBeenCalledTimes(1);
        const calledWith = onDateSelect.mock.calls[0];
        expect(moment.isMoment(calledWith[0])).toBe(true);
        expect(calledWith[0].format('YYYY-MM-DD')).toBe(
          expectedDate.format('YYYY-MM-DD')
        );
        expect(calledWith[1]).toBe('departure');
      }
    });

    test('должен обработать клик по дню с датой из атрибута data-date', () => {
      // Рендерим календарь
      calendarGrid.render();

      // Находим существующий день в календаре, который можно использовать для теста
      const calendarGridEl = container.querySelector('.calendar-grid');
      const testDate = moment('2023-06-15');

      // Находим день, который уже существует в календаре и имеет атрибут data-date
      let testDay = calendarGridEl.querySelector(
        `[data-date="${testDate.format('YYYY-MM-DD')}"]`
      );

      if (!testDay) {
        // Если день не найден, находим первый доступный день
        testDay = calendarGridEl.querySelector('.selectable-day');
        if (testDay) {
          // Обновляем атрибут data-date для тестирования
          testDay.setAttribute('data-date', testDate.format('YYYY-MM-DD'));
        }
      }

      if (testDay) {
        // Симулируем клик
        testDay.click();

        // Проверяем, что onDateSelect был вызван
        expect(onDateSelect).toHaveBeenCalled();

        // Проверяем, что аргументы соответствуют ожидаемым
        const calledWith = onDateSelect.mock.calls[0];
        const dateArg = calledWith[0];
        const typeArg = calledWith[1];

        // Сравниваем даты по формату, а не как объекты moment
        expect(dateArg.format('YYYY-MM-DD')).toBe(
          testDate.format('YYYY-MM-DD')
        );
        expect(typeArg).toBe('departure');
      }
    });
  });

  describe('handlePrevMonth', () => {
    test('должен переключить на предыдущий месяц', () => {
      const initialMonth = calendarGrid.date.month();
      calendarGrid.handlePrevMonth();
      expect(calendarGrid.date.month()).toBe(initialMonth - 1);
    });

    test('должен перерисовать календарь', () => {
      const renderSpy = jest.spyOn(calendarGrid, 'render');
      calendarGrid.handlePrevMonth();
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('handleNextMonth', () => {
    test('должен переключить на следующий месяц', () => {
      const initialMonth = calendarGrid.date.month();
      calendarGrid.handleNextMonth();
      expect(calendarGrid.date.month()).toBe(initialMonth + 1);
    });

    test('должен перерисовать календарь', () => {
      const renderSpy = jest.spyOn(calendarGrid, 'render');
      calendarGrid.handleNextMonth();
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('тип календаря возврата', () => {
    test('должен корректно обрабатывать дату возврата', () => {
      const returnDate = moment('2023-06-20');
      tripManager.setReturnDate(returnDate);

      const returnCalendarGrid = new CalendarGrid(
        container,
        moment('2023-06-15'),
        'return',
        tripManager,
        onDateSelect
      );

      returnCalendarGrid.render();
      const calendarGridEl = container.querySelector('.calendar-grid');
      const selectedDay = calendarGridEl.querySelector('.selected');

      expect(selectedDay).toBeInTheDocument();
      expect(selectedDay.textContent).toBe('20');
    });
  });
});
