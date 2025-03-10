import {HttpService} from "../../services/http-service";
import config from "../../config/config";
import {UrlUtils} from "../../utils/url-utils";
import {MenuLinkUtils} from "../../utils/menu-link-utils";
import {ErrorResponseType} from "../../types/error-response.type";
import {CategoryType} from "../../types/category.type";

export class ExpenseEdit {
  private inputNameCategoryElement: HTMLInputElement | null;
  private categorySaveElement: HTMLButtonElement | null;
  private categorySaveBackElement: HTMLButtonElement | null;

  constructor() {
    this.inputNameCategoryElement = document.getElementById('inputCategoryName') as HTMLInputElement;
    this.categorySaveElement = document.getElementById('categorySave') as HTMLButtonElement;
    this.categorySaveBackElement = document.getElementById('categorySaveBack') as HTMLButtonElement;
    const id: string = UrlUtils.getUrlParams('id');
    if (!id) {
      window.location.href = '#/expenses';
    }

    this.getCategory(id).then();
    this.categorySaveElement.addEventListener('click', this.updateCategory.bind(this, id));
    this.categorySaveBackElement.addEventListener('click', (): void => {
      window.location.href = '#/expenses';
    });
    this.activeLink();
  }

  //Активация пунктов меню
  private activeLink(): void {
    const details: NodeListOf<HTMLElement> = document.querySelectorAll("details");
    const link: NodeListOf<HTMLElement> = document.querySelectorAll('.link-sidebar');
    MenuLinkUtils.activeLink(details, link, '#/expenses');
  }

  //Получение выбранной категории по id
  async getCategory(id: string): Promise<void> {
    try {
      const result: CategoryType | ErrorResponseType = await HttpService.request(config.host + '/categories/expense/' + id);
      if (result && !(result as ErrorResponseType).error) {
        (this.inputNameCategoryElement as HTMLInputElement).value = (result as CategoryType).title;
      } else if((result as ErrorResponseType).error) {
        console.error((result as ErrorResponseType).message);
      }
    } catch (e) {
      console.error("Ошибка получения категории " + e);
    }
  }

  //Валидация полей
  private validateForm(): boolean {
    let isValid: boolean = true;

    if (this.inputNameCategoryElement) {
      if (this.inputNameCategoryElement.value.trim()) {
        this.inputNameCategoryElement.classList.remove('is-invalid');
      } else {
        this.inputNameCategoryElement.classList.add('is-invalid');
        isValid = false;
      }
    }
    return isValid;
  }

  //Запрос на обновление категории
  private async updateCategory(id: string): Promise<void> {
    if (this.validateForm()) {
      try {
        const result: CategoryType | ErrorResponseType = await HttpService.request(config.host + '/categories/expense/' + id, 'PUT', {title: (this.inputNameCategoryElement as HTMLInputElement).value});
        if (result && !(result as ErrorResponseType).error) {
          window.location.href = '#/expenses';
        } else if ((result as ErrorResponseType).error) {
          console.error((result as ErrorResponseType).message);
        }
      } catch (e) {
        console.error("Ошибка получения категории " + e);
      }
    }
  }
}