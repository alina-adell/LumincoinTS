import {HttpService} from "../../services/http-service";
import config from "../../config/config";
import {UrlUtils} from "../../utils/url-utils";
import {MenuLinkUtils} from "../../utils/menu-link-utils";
import {CategoryType} from "../../types/category.type";
import {ErrorResponseType} from "../../types/error-response.type";

export class RevenueEdit {
  readonly inputNameCategoryElement: HTMLInputElement | null;
  private categorySaveElement: HTMLButtonElement | null;
  private categorySaveBackElement: HTMLButtonElement | null;

  constructor() {
    this.inputNameCategoryElement = document.getElementById('inputCategoryName') as HTMLInputElement;
    this.categorySaveElement = document.getElementById('categorySave') as HTMLButtonElement;
    this.categorySaveBackElement = document.getElementById('categorySaveBack') as HTMLButtonElement;
    const id: string = UrlUtils.getUrlParams('id');
    if (!id) {
      window.location.href = '#/revenues';
    }

    this.getCategory(id).then();
    this.categorySaveElement.addEventListener('click', this.updateCategory.bind(this, id));
    this.categorySaveBackElement.addEventListener('click', (): void => {
      window.location.href = '#/revenues';
    });
    this.activeLink();
  }

  //Активация пунктов меню
  private activeLink(): void {
    const details: NodeListOf<HTMLDetailsElement> = document.querySelectorAll("details");
    const link: NodeListOf<HTMLElement> = document.querySelectorAll('.link-sidebar');
    MenuLinkUtils.activeLink(details, link, '#/revenues');
  }

  //Получение выбранной категории по id
  private async getCategory(id: string): Promise<void> {
    try {
      const result: CategoryType | ErrorResponseType = await HttpService.request(config.host + '/categories/income/' + id, 'GET');
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
        const result: CategoryType | ErrorResponseType = await HttpService.request(config.host + '/categories/income/' + id, 'PUT', {title: (this.inputNameCategoryElement as HTMLInputElement).value});
        if (result && !(result as ErrorResponseType).error) {
          window.location.href = '#/revenues';
        } else if ((result as ErrorResponseType).error) {
          console.error((result as ErrorResponseType).message);
        }
      } catch (e) {
        throw new Error("Ошибка получения категории " + e);
      }
    }
  }
}