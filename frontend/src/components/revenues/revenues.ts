import {HttpService} from "../../services/http-service";
import config from "../../config/config";
import {ErrorResponseType} from "../../types/error-response.type";
import {RevenueResponseType} from "../../types/revenue-type/revenue-response.type";

export class Revenue {
  private cardBoxElement: HTMLElement | null;
  private modalElement: HTMLElement | null;
  private modalBtnRemoveElement: HTMLButtonElement | null;
  private modalBtnCancelElement: HTMLButtonElement | null;

  constructor() {
    this.cardBoxElement = document.querySelector('.card-box');
    this.modalElement = document.getElementById('modal');
    this.modalBtnRemoveElement = document.getElementById('btnRemove') as HTMLButtonElement;
    this.modalBtnCancelElement = document.getElementById('btnCancel') as HTMLButtonElement;

    this.showCardRevenues().then();
  }

  //Отрисовка карточек
  private async showCardRevenues(): Promise<void> {
    try {
      const result: RevenueResponseType[] | ErrorResponseType = await HttpService.request(config.host + '/categories/income');
      if (Array.isArray(result)) {
        result.forEach((category: RevenueResponseType) => {
          let cardElement: HTMLElement = document.createElement("div");
          cardElement.classList.add("card", "p-1");
          cardElement.setAttribute("data-id", (category.id).toString());
          cardElement.innerHTML = `
          <div class="card-body flex-grow-1">
            <h4 class="card-title mb-3">${category.title}</h4>
            <div class="action d-flex flex-column flex-sm-row gap-2">
              <a href="#/revenue-edit?id=${category.id}" class="btn btn-primary">Редактировать</a>
              <button id="deleteCategory" class="btn btn-danger delete-category">Удалить</button>
            </div>
          </div>`;

          //Взаимодействие с модальным окном
          const deleteBtn: HTMLButtonElement | null = cardElement.querySelector('.delete-category');
          (deleteBtn as HTMLButtonElement).addEventListener('click', (): void => {
            (this.modalElement as HTMLElement).classList.add('open');

            (this.modalBtnRemoveElement as HTMLButtonElement).onclick = (): void => {
              this.deleteCardRevenue(category.id, cardElement);
              (this.modalElement as HTMLElement).classList.remove('open');
            }

            (this.modalBtnCancelElement as HTMLButtonElement).onclick = (): void => {
              (this.modalElement as HTMLElement).classList.remove('open');
            }
          });
          (this.cardBoxElement as HTMLElement).appendChild(cardElement);
        });

        let addCategoryElement: HTMLAnchorElement = document.createElement("a");
        addCategoryElement.href = "#/revenue-add";
        addCategoryElement.classList.add("btn", "btn-add-revenue", "border", "border-1");
        addCategoryElement.innerHTML = `<img src="images/svg/plus-mini-1523-svgrepo-com.svg" alt="plus" width="15px" height="15px">`;
        (this.cardBoxElement as HTMLElement).appendChild(addCategoryElement);
      }
    } catch (e) {
      throw new Error("Возникла ошибка при получении категории доходов " + e);
    }
  }

  //Запрос на удаление категории
  private async deleteCardRevenue(id: number, cardElement: HTMLElement): Promise<void> {
    try {
      const result: ErrorResponseType = await HttpService.request(config.host + '/categories/income/' + id, 'DELETE');
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