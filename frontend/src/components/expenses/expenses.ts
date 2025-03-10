import {HttpService} from "../../services/http-service";
import config from "../../config/config";
import {ErrorResponseType} from "../../types/error-response.type";
import {ExpenseResponseType} from "../../types/expense-type/expense-response.type";

export class Expenses {
  private cardBoxElement: HTMLElement | null;
  private modalElement: HTMLElement | null = null;
  private modalBtnRemoveElement: HTMLButtonElement | null;
  private modalBtnCancelElement: HTMLButtonElement | null;

  constructor() {
    this.cardBoxElement = document.querySelector('.card-box');
    this.modalElement = document.getElementById('modal');
    this.modalBtnRemoveElement = document.getElementById('btnRemove') as HTMLButtonElement;
    this.modalBtnCancelElement = document.getElementById('btnCancel') as HTMLButtonElement;

    this.showCardExpenses().then();
  }

  //Отрисовка карточек
  private async showCardExpenses(): Promise<void> {
    try {
      const result: ExpenseResponseType[] | ErrorResponseType = await HttpService.request(config.host + '/categories/expense');
      if (Array.isArray(result)) {
        result.forEach((category: ExpenseResponseType) => {
          let cardElement: HTMLElement = document.createElement("div");
          cardElement.classList.add("card", "p-1");
          cardElement.innerHTML = `
          <div class="card-body flex-grow-1">
            <h4 class="card-title mb-3">${category.title}</h4>
            <div class="action d-flex flex-column flex-sm-row gap-2">
              <a href="#/expense-edit?id=${category.id}" class="btn btn-primary">Редактировать</a>
              <button id="deleteCategory" class="btn btn-danger delete-category">Удалить</button>
            </div>
          </div>`;

          //Взаимодействие с модальным окном
          const deleteBtn: HTMLButtonElement | null = cardElement.querySelector('.delete-category');
          (deleteBtn as HTMLButtonElement).addEventListener('click', (): void => {
            (this.modalElement as HTMLElement).classList.add('open');

            (this.modalBtnRemoveElement as HTMLButtonElement).onclick = (): void => {
              this.deleteCardExpense(category.id, cardElement);
              (this.modalElement as HTMLElement).classList.remove('open');
            }

            (this.modalBtnCancelElement as HTMLButtonElement).onclick = (): void => {
              (this.modalElement as HTMLElement).classList.remove('open');
            }

          });
          (this.cardBoxElement as HTMLElement).appendChild(cardElement);
        });

        let addCategoryElement: HTMLAnchorElement = document.createElement("a");
        addCategoryElement.href = "#/expense-add";
        addCategoryElement.classList.add("btn", "btn-add-revenue", "border", "border-1");
        addCategoryElement.innerHTML = `<img src="images/svg/plus-mini-1523-svgrepo-com.svg" alt="plus" width="15px" height="15px">`;
        (this.cardBoxElement as HTMLElement).appendChild(addCategoryElement);
      } else if (result.error) {
        console.error(result.message);
      }
    } catch (e) {
      console.error("Возникла ошибка при получении категории доходов " + e);
    }
  }

  //Удаление карточки
  private async deleteCardExpense(id: number, cardElement: HTMLElement): Promise<void> {
    try {
      const result: ErrorResponseType = await HttpService.request(config.host + '/categories/expense/' + id, 'DELETE');
      if (result.error === false) {
        cardElement.remove();
      } else if (result.error === true) {
        console.error(result.message);
        return;
      }
    } catch (e) {
      console.error("Ошибка удаления категории " + e);
    }
  }
}