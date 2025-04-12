export class Client {
    constructor(
      public id: number,
      public displayName: string,
      public email: string,
      public phone: string,
      public reference?: string,
      public status?: string,
      public balance?: number,
      public createdAt?: string,
      public updatedAt?: string
    ) {}
  
    static fromJson(json: any): Client {
      return new Client(
        json.id,
        json.displayName || json.fullname,
        json.email,
        json.phone,
        json.reference,
        json.status,
        json.balance,
        json.createdAt,
        json.updatedAt
      );
    }
  }