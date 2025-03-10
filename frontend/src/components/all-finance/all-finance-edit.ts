import {HttpService} from "../../services/http-service";
import config from "../../config/config";
import {CommonUtils} from "../../utils/common-utils";
import {UrlUtils} from "../../utils/url-utils";
import {CategoryType} from "../../types/category.type";
import {ErrorResponseType} from "../../types/error-response.type";
import {CategoryResponseType} from "../../types/category-response.type";

export class AllFinanceEdit {
  private selectTypeElement: HTMLSelectElement | null;
  private selectCategoryElement: HTMLSelectElement | null;
  readonly inputAmountElement: HTMLInputElement | null;
  readonly inputDateElement: HTMLInputElement | null;
  private inputCommentElement: HTMLInputElement | null;
  private btnCategorySaveElement: HTMLButtonElement | null;
  private btnCategorySaveBackElement: HTMLButtonElement | null;

  constructor() {
    this.selectTypeElement = document.getElementById('selectType') as HTMLSelectElement;
    this.selectCategoryElement = document.getElementById('selectCategory') as HTMLSelectElement;
    this.inputAmountElement = document.getElementById('inputAmount') as HTMLInputElement;
    this.inputDateElement = document.getElementById('inputDate') as HTMLInputElement;
    this.inputCommentElement = document.getElementById('inputComment') as HTMLInputElement;
    this.btnCategorySaveElement = document.getElementById('categorySave') as HTMLButtonElement;
    this.btnCategorySaveBackElement = document.getElementById('categorySaveBack') as HTMLButtonElement;
    const id: string = UrlUtils.getUrlParams('id');
    if (!id) {
      window.location.href = '#/all-finance';
      return;
    }

    this.getCategory(id).then();
    this.btnCategorySaveElement.addEventListener('click', this.updateCategory.bind(this, id));
    this.btnCategorySaveBackElement.addEventListener('click', (): void => {
      window.location.href = '#/all-finance';
    });

    this.selectTypeElement.addEventListener('change', (): void => {
      this.updateCategoryOptions().then();
    });
  }

  //Получение категорий для select
  private async getCategoryOption(type: string): Promise<void> {
    const options: CategoryType[] = await CommonUtils.getOperationCategory(type);
    (this.selectCategoryElement as HTMLSelectElement).innerHTML = '';
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

  //Получение выбранной категории по id
  private async getCategory(id: string): Promise<void> {
    try {
      const result: CategoryResponseType | ErrorResponseType = await HttpService.request(config.host + '/operations/' + id);
      if (result && !(result as ErrorResponseType).error) {
        (this.selectTypeElement as HTMLSelectElement).querySelectorAll('option').forEach((element: HTMLOptionElement) => {
          if ((result as CategoryResponseType).type === element.value) {
            element.selected = true;
          }
        });
        await this.getCategoryOption((result as CategoryResponseType).type);
        (this.selectCategoryElement as HTMLSelectElement).querySelectorAll('option').forEach((element: HTMLOptionElement) => {
          if ((result as CategoryResponseType).category === element.value) {
            element.selected = true;
          }
        });
        (this.inputAmountElement as HTMLInputElement).value = ((result as CategoryResponseType).amount).toString();
        (this.inputDateElement as HTMLInputElement).value = (result as CategoryResponseType).date;
        (this.inputCommentElement as HTMLInputElement).value = (result as CategoryResponseType).comment;
      }
    } catch (e) {
      throw new Error("Ошибка получения категории " + e);
    }
  }

  //Если изменён тип, то меняем категории в select
  private async updateCategoryOptions(): Promise<void> {
    const selectedCategoryType: string = (this.selectTypeElement as HTMLSelectElement).value;
    if (selectedCategoryType) {
      await this.getCategoryOption(selectedCategoryType);
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

  //Запрос на обновление операции
  private async updateCategory(id: string): Promise<void> {
    if (this.validateForm()) {
      try {
        const categoryId: number = +(this.getOptionCategoryId() as string);

        const result: CategoryResponseType | ErrorResponseType = await HttpService.request(config.host + '/operations/' + id, 'PUT', {
          type: (this.selectTypeElement as HTMLSelectElement).value,
          amount: +(this.inputAmountElement as HTMLInputElement).value,
          date: (this.inputDateElement as HTMLInputElement).value,
          comment: (this.inputCommentElement as HTMLInputElement).value,
          category_id: categoryId,
        });
        if ((result as CategoryResponseType) && !(result as ErrorResponseType).error) {
          window.location.href = '#/all-finance';
        } else if (result as ErrorResponseType) {
          window.location.href = '#/main';
        }
      } catch (e) {
        console.error("Ошибка получения категории " + e);
      }
    }
  }
}