"use client";

import { useState, useEffect } from "react";
import { accountService } from "@/services/account-service";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
  senderIban?: string;
  recipientIban?: string;
};

type AccountStatementProps = {
  selectedAccount: {
    iban: string;
    balance: number;
  };
};

export function AccountStatements({ selectedAccount }: AccountStatementProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccountStatement = async () => {
      try {
        const response = await accountService.getAccountStatement(
          selectedAccount.iban
        );
        setTransactions(response.data.transactions);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch account statement");
      }
    };

    if (selectedAccount.iban) fetchAccountStatement();
  }, [selectedAccount]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Account Statement</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b">
                <td className="p-3">
                  {new Date(transaction.createdAt).toLocaleString()}
                </td>
                <td className="p-3 capitalize">{transaction.type}</td>
                <td
                  className={`p-3 text-right ${
                    transaction.type === "deposit" ||
                    transaction.type === "transfer_received"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "deposit" ||
                  transaction.type === "transfer_received"
                    ? "+ "
                    : "- "}
                  {transaction.amount.toFixed(2)}
                </td>
                <td className="p-3 text-right">
                  {transaction.balanceAfter.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
