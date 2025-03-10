import {UrlUtils} from "../../utils/url-utils";
import {CommonUtils} from "../../utils/common-utils";
import {HttpService} from "../../services/http-service";
import config from "../../config/config";
import {CategoryType} from "../../types/category.type";
import {CategoryResponseType} from "../../types/category-response.type";
import {ErrorResponseType} from "../../types/error-response.type";

export class AllFinanceAdd {
  private selectTypeElement: HTMLSelectElement | null;
  private selectCategoryElement: HTMLSelectElement | null;
  readonly inputAmountElement: HTMLInputElement | null;
  readonly inputDateElement: HTMLInputElement | null;
  private inputCommentElement: HTMLInputElement | null;
  private btnCategoryAddElement: HTMLButtonElement | null;
  private btnCategoryAddBackElement: HTMLButtonElement | null;

  constructor() {
    this.selectTypeElement = document.getElementById("selectType") as HTMLSelectElement;
    this.selectCategoryElement = document.getElementById("selectCategory") as HTMLSelectElement;
    this.inputAmountElement = document.getElementById("inputAmount") as HTMLInputElement;
    this.inputDateElement = document.getElementById("inputDate") as HTMLInputElement;
    this.inputCommentElement = document.getElementById("inputComment") as HTMLInputElement;
    this.btnCategoryAddElement = document.getElementById("categoryAdd") as HTMLButtonElement;
    console.log(this.btnCategoryAddElement)
    this.btnCategoryAddBackElement = document.getElementById("categoryAddBack") as HTMLButtonElement;
    const type: string = UrlUtils.getUrlParams('type');
    if (!type) {
      window.location.href = '#/all-finance';
      return;
    }

    this.selectedType(type);
    this.getCategoryOption(type).then();
    this.btnCategoryAddElement.addEventListener('click', this.createCategory.bind(this));
    this.btnCategoryAddBackElement.addEventListener('click', (): void => {
      window.location.href = '#/all-finance';
    });
  }

  //Блокировка option если выбран тот или иной тип операции
  private selectedType(type: string): void {
    (this.selectTypeElement as HTMLSelectElement).querySelectorAll('option').forEach((element: HTMLOptionElement) => {
      if (type === element.value) {
        element.selected = true;
        element.removeAttribute('disabled');
      } else {
        element.setAttribute('disabled', 'disabled');
      }
    });
  }

  //Отрисовка select категорий по типу операции
  async getCategoryOption(type: string): Promise<void> {
    const options: CategoryType[] = await CommonUtils.getOperationCategory(type);
    if (options.length === 0) {
      console.error('Нет доступных категорий для указанного типа');
      return;
    }

    for (let i = 0; i < options.length; i++) {
      const option: HTMLOptionElement = document.createElement("option");
      option.value = options[i].title;
      option.innerText = options[i].title;
      option.setAttribute("data-id", (options[i].id).toString());
      (this.selectCategoryElement as HTMLSelectElement).appendChild(option);
    }
  }

  //Валидация полей
  private validateForm(): boolean {
    let isValid: boolean = true;

    if (this.inputAmountElement) {
      if (this.inputAmountElement.value.trim()) {
        this.inputAmountElement.classList.remove('is-invalid');
      } else {
        this.inputAmountElement.classList.add('is-invalid');
        isValid = false;
      }
    }

    if (this.inputDateElement) {
      if (this.inputDateElement.value.trim() && this.inputDateElement.value.match(/[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])/)) {
        this.inputDateElement.classList.remove('is-invalid');
      } else {
        this.inputDateElement.classList.add('is-invalid');
        isValid = false;
      }
    }
    return isValid;
  }

  //Получение id из атрибута выбранного option для категорий
  private getOptionCategoryId(): string | null {
    const selectedOption: HTMLOptionElement | null = (this.selectCategoryElement as HTMLSelectElement).querySelector<HTMLOptionElement>(`option[value="${(this.selectCategoryElement as HTMLSelectElement).value}"]`);
    return selectedOption ? selectedOption.getAttribute('data-id') : null;
  }

  //Запрос на создание операции
  private async createCategory(): Promise<void> {
    if (this.validateForm()) {
      const categoryId: number = +(this.getOptionCategoryId() as string);
      try {
        const result: CategoryResponseType | ErrorResponseType = await HttpService.request(config.host + '/operations', 'POST', {
          type: (this.selectTypeElement as HTMLSelectElement).value,
          amount: +(this.inputAmountElement as HTMLInputElement).value,
          date: (this.inputDateElement as HTMLInputElement).value,
          comment: (this.inputCommentElement as HTMLInputElement).value,
          category_id: categoryId
        });
        if ((result as CategoryResponseType) && !(result as ErrorResponseType).error) {
          window.location.href = '#/all-finance';
        } else if (result as ErrorResponseType) {
          window.location.href = '#/main';
        }
      } catch (e) {
        console.error(`Ошибка создания категории: ${(this.selectTypeElement as HTMLSelectElement).textContent}, ${e}`);
      }
    }
  }
}