import config from "../config/config";
import {HttpService} from "../services/http-service";
import {CategoryType} from "../types/category.type";
import {ErrorResponseType} from "../types/error-response.type";

export class CommonUtils {
  public static getOperationsType(operationType: string): string {
    let type: string;
    switch (operationType) {
      case config.operationsType.expense:
        type = `<span class="text-danger">расход</span>`;
        break;
      case config.operationsType.income:
        type = `<span class="text-success">доход</span>`;
        break;
        default:
          type = `<span class="text-dark">-</span>`;
    }
    return type;
  }

  public static async getOperationCategory(type: string): Promise<CategoryType[]> {
    let url: string;
    if (type === "expense") {
      url = `${config.host}/categories/expense`;
    } else {
      url = `${config.host}/categories/income`;
    }
    try {
      const result: CategoryType[] | ErrorResponseType = await HttpService.request(url);
      if (Array.isArray(result)) {
        return result;
      } else if (result.error) {
        console.error("Ошибка получения категорий", result.message);
        throw new Error(result.message);
      }
    } catch (e) {
      console.error("Ошибка выполнения запроса", e);
    }
    return [];
  }
}