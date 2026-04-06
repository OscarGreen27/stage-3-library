//Class for validating query parameters
export default class QueryValidator {
  constructor() {}

  public pageCheck(page: any): number {
    if (typeof page === "string" && !isNaN(Number(page))) {
      return Number(page);
    }
    return 0;
  }

  public adminLimitCheck(adminLimit: any): number {
    if (typeof adminLimit === "string" && !isNaN(Number(adminLimit))) {
      return Number(adminLimit);
    }
    return 5;
  }

  public offsetCheck(offset: any): number {
    if (!isNaN(Number(offset))) {
      return Number(offset);
    } else {
      return 0;
    }
  }

  public userLimitCheck(limit: any): number {
    if (typeof limit === "number" && !isNaN(Number(limit))) {
      return limit;
    } else {
      return 18;
    }
  }
}
