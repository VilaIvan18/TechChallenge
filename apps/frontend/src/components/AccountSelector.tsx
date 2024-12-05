"use client";

import { useState, useEffect } from "react";
import { accountService } from "@/services/account-service";
import { AxiosError } from "axios";

type Account = {
  id: string;
  iban: string;
  balance: number;
};

type AccountSelectorProps = {
  onSelectAccount: (account: Account) => void;
};

export function AccountSelector({ onSelectAccount }: AccountSelectorProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [newIban, setNewIban] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, [onSelectAccount]);

  const fetchAccounts = async () => {
    try {
      const response = await accountService.getAccounts();
      setAccounts(response.data);

      // Select first account by default
      if (response.data.length > 0) {
        const firstAccount = response.data[0];
        setSelectedAccount(firstAccount);
        onSelectAccount(firstAccount);
      }
    } catch (err) {
      setError("Failed to fetch accounts");
    }
  };

  const handleCreateAccount = async () => {
    if (!newIban) {
      setError("Please enter an IBAN");
      return;
    }

    try {
      await accountService.createAccount(newIban);
      fetchAccounts();
      setNewIban("");
      setError("");
    } catch (err) {
      const errorMessage = (
        (err as AxiosError)?.response?.data as { message: string }
      ).message;
      if (errorMessage) {
        setError(errorMessage);
      } else {
        setError("Failed to create account");
      }
    }
  };

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    onSelectAccount(account);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">My Accounts</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="space-y-2 mb-4">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => handleAccountSelect(account)}
            className={`w-full p-3 text-left rounded ${
              selectedAccount?.id === account.id
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <div className="flex justify-between">
              <span>{account.iban}</span>
              <span className="font-bold">€{account.balance.toFixed(2)}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Enter new IBAN"
          value={newIban}
          onChange={(e) => setNewIban(e.target.value)}
          className="flex-grow p-2 border rounded"
        />
        <button
          onClick={handleCreateAccount}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Account
        </button>
      </div>
    </div>
  );
}
