import { api } from "./api";

export const accountService = {
  async getAccounts() {
    return await api.get("/account");
  },

  async createAccount(iban: string) {
    return await api.post("/account/create", { iban });
  },

  async deposit(iban: string, amount: number) {
    return await api.post("/account/deposit", { iban, amount });
  },

  async withdraw(iban: string, amount: number) {
    return await api.post("/account/withdraw", { iban, amount });
  },

  async transfer(fromIban: string, toIban: string, amount: number) {
    return await api.post("/account/transfer", {
      fromIban,
      toIban,
      amount,
    });
  },

  async getAccountStatement(iban: string) {
    return await api.get(`/account/statement?iban=${iban}`);
  },
};
