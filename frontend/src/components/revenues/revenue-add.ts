import {HttpService} from "../../services/http-service";
import config from "../../config/config";
import {MenuLinkUtils} from "../../utils/menu-link-utils";
import {ErrorResponseType} from "../../types/error-response.type";
import {CategoryType} from "../../types/category.type";

export class RevenueAdd {
  readonly inputNameCategoryElement: HTMLInputElement | null;
  private btnCategoryAddElement: HTMLButtonElement | null;
  private btnCategoryAddBackElement: HTMLButtonElement | null;

  constructor() {
    this.inputNameCategoryElement = document.getElementById('inputCategoryName') as HTMLInputElement;
    this.btnCategoryAddElement = document.getElementById('categoryAdd') as HTMLButtonElement;
    this.btnCategoryAddBackElement = document.getElementById('categoryAddBack') as HTMLButtonElement;

    this.btnCategoryAddElement.addEventListener('click', this.addCategory.bind(this));
    this.btnCategoryAddBackElement.addEventListener('click', (): void => {
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

  //Запрос на добавление категории
  private async addCategory(): Promise<void> {
    if (this.validateForm()) {
      try {
        const result: CategoryType | ErrorResponseType = await HttpService.request(config.host + '/categories/income', 'POST', {title: (this.inputNameCategoryElement as HTMLInputElement).value});
        if (result && !(result as ErrorResponseType).error) {
          window.location.href = '#/revenues';
        } else if ((result as ErrorResponseType).error) {
          console.error((result as ErrorResponseType).message);
        }
      } catch (e) {
        console.error("Ошибка при создании категории " + e);
      }
    }
  }
}