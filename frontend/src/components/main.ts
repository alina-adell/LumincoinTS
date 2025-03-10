import config from "../config/config";
import {HttpService} from "../services/http-service";
import {Chart} from "chart.js/auto";
import {CategoryResponseType} from "../types/category-response.type";
import {ErrorResponseType} from "../types/error-response.type";

export class Main {
  private btnPeriodElement: NodeListOf<HTMLElement>;
  readonly inputFromDate: HTMLInputElement | null;
  readonly inputToDate: HTMLInputElement | null;
  readonly chartOneCanvas: HTMLCanvasElement;
  readonly chartTwoCanvas: HTMLCanvasElement;
  private chartOne: Chart<"pie", number[], string> | null = null;
  private chartTwo: Chart<"pie", number[], string> | null = null;
  private arrayCategoryRevenue: string[] = [];
  private arrayAmountCategoryRevenue: number[] = [];
  private arrayCategoryExpense: string[] = [];
  private arrayAmountCategoryExpense: number[] = [];

  constructor() {
    this.btnPeriodElement = document.querySelectorAll('.btn-main');
    this.inputFromDate = document.getElementById('inputFromDate') as HTMLInputElement;
    this.inputToDate = document.getElementById('inputToDate') as HTMLInputElement;
    this.chartOneCanvas = document.getElementById('revenuesChart') as HTMLCanvasElement;
    this.chartTwoCanvas = document.getElementById('expensesChart') as HTMLCanvasElement;
    this.getPeriodData('').then();
    this.btnEventListener();
  }

  //Событие клика по кнопкам фильтров
  private btnEventListener(): void {
    this.btnPeriodElement.forEach((btn: HTMLElement) => {
      btn.addEventListener('click', (e: MouseEvent) => {
        const period: string | null = (e.target as HTMLElement).getAttribute('data-period');
        //Сброс ошибок валидации
        this.resetValidation();
        if (period === "interval") {
          if (!this.validateForm()) {
            e.preventDefault();
            return;
          }
        }
        //Обнуление данных в массивах
        this.arrayCategoryRevenue = [];
        this.arrayAmountCategoryRevenue = [];
        this.arrayCategoryExpense = [];
        this.arrayAmountCategoryExpense = [];
        this.getPeriodData(period as string).then();
      });
    });
  }

  //Валидация полей
  private validateForm(): boolean {
    let isValid: boolean = true;

    if (this.inputFromDate) {
      if (this.inputFromDate.value) {
        this.inputFromDate.classList.remove('is-invalid');
      } else {
        this.inputFromDate.classList.add('is-invalid');
        isValid = false;
      }
    }

    if (this.inputToDate) {
      if (this.inputToDate.value) {
        this.inputToDate.classList.remove('is-invalid');
      } else {
        this.inputToDate.classList.add('is-invalid');
        isValid = false;
      }
    }
    return isValid;
  }

  //Сброс валидационных сообщений
  private resetValidation(): void {
    (this.inputFromDate as HTMLInputElement).classList.remove('is-invalid');
    (this.inputToDate as HTMLInputElement).classList.remove('is-invalid');
  }

  //Получение данных по кнопкам фильтров
  private async getPeriodData(period: string): Promise<void> {
    let url: string;
    try {
      if (period === "interval") {
        url = `${config.host}/operations?period=interval&dateFrom=${(this.inputFromDate as HTMLInputElement).value}&dateTo=${(this.inputToDate as HTMLInputElement).value}`
      } else if (period) {
        url = `${config.host}/operations?period=${period}`
      } else {
        url = `${config.host}/operations`
      }
      const result: CategoryResponseType[] | ErrorResponseType = await HttpService.request(url);
      if (Array.isArray(result)) {
        this.getArrayData(result);
        //Отрисовка графиков после получения данных
        this.renderChart();
      } else if (result.error) {
        console.error(result.message);
      }
    } catch (e) {
      console.error("Ошибка при запросе данных", e);
    }
  }

  //Фильтрация полученных данных и запись их в массивы для графиков
  private getArrayData(data: CategoryResponseType[]): void {
    const revenueData: CategoryResponseType[] = data.filter((item: CategoryResponseType) => item.type === "income");
    this.arrayCategoryRevenue = revenueData.map((item: CategoryResponseType) => item.category);
    this.arrayAmountCategoryRevenue = revenueData.map((item: CategoryResponseType) => item.amount);

    const expenseData: CategoryResponseType[] = data.filter((item: CategoryResponseType) => item.type === "expense");
    this.arrayCategoryExpense = expenseData.map((item: CategoryResponseType) => item.category);
    this.arrayAmountCategoryExpense = expenseData.map((item: CategoryResponseType) => item.amount);
  }

  //Отрисовка графиков
  private renderChart(): void {
    if (this.chartOne) {
      this.chartOne.destroy();
    }

    //Если данных нет, то устанавливаем дефолтные данные
    const labelsRevenue: string[] = this.arrayCategoryRevenue.length ? this.arrayCategoryRevenue : ['Нет данных'];
    const dataRevenue: number[] = this.arrayAmountCategoryRevenue.length ? this.arrayAmountCategoryRevenue : [1];

    this.chartOne = new Chart(this.chartOneCanvas, {
      type: 'pie',
      data: {
        labels: labelsRevenue,
        datasets: [{
          label: 'Сумма',
          data: dataRevenue,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        layout: {
          padding: {
            bottom: 5
          }
        },
        plugins: {
          legend: {
            position: 'top',
          }
        },
        radius: '90%'
      }
    });

    if (this.chartTwo) {
      this.chartTwo.destroy();
    }

    const labelsExpense = this.arrayCategoryExpense.length ? this.arrayCategoryExpense : ['Нет данных'];
    const dataExpense = this.arrayAmountCategoryExpense.length ? this.arrayAmountCategoryExpense : [1];

    this.chartTwo = new Chart(this.chartTwoCanvas, {
      type: 'pie',
      data: {
        labels: labelsExpense,
        datasets: [{
          label: 'Сумма',
          data: dataExpense,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        layout: {
          padding: {
            bottom: 5
          }
        },
        plugins: {
          legend: {
            position: 'top',
          }
        },
        radius: '90%'
      }
    });
  }
}