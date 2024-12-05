"use client";

import { useState } from "react";
import { accountService } from "@/services/account-service";
import { AxiosError } from "axios";

type AccountOperationsProps = {
  account: {
    iban: string;
    balance: number;
  };
  onUpdateBalance: (newBalance: number) => void;
};

export function AccountOperations({
  account,
  onUpdateBalance,
}: AccountOperationsProps) {
  const [activeTab, setActiveTab] = useState<
    "deposit" | "withdraw" | "transfer"
  >("deposit");
  const [amount, setAmount] = useState("");
  const [toIban, setToIban] = useState("");
  const [error, setError] = useState("");

  const handleOperation = async () => {
    try {
      const numAmount = parseFloat(amount);

      switch (activeTab) {
        case "deposit":
          const depositResponse = await accountService.deposit(
            account.iban,
            numAmount
          );
          onUpdateBalance(depositResponse.data.newBalance);
          break;
        case "withdraw":
          const withdrawResponse = await accountService.withdraw(
            account.iban,
            numAmount
          );
          onUpdateBalance(withdrawResponse.data.newBalance);
          break;
        case "transfer":
          const transferResponse = await accountService.transfer(
            account.iban,
            toIban,
            numAmount
          );
          onUpdateBalance(transferResponse.data.senderUpdatedBalance);
          break;
      }

      setAmount("");
      setToIban("");
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

  const renderOperationForm = () => {
    switch (activeTab) {
      case "deposit":
      case "withdraw":
        return (
          <>
            <input
              type="number"
              placeholder={`Enter amount to ${activeTab}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              min="0"
              step="0.01"
            />
            <button
              onClick={handleOperation}
              className={`w-full p-2 rounded ${
                activeTab === "deposit"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </button>
          </>
        );
      case "transfer":
        return (
          <>
            <input
              type="text"
              placeholder="Recipient IBAN"
              value={toIban}
              onChange={(e) => setToIban(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="number"
              placeholder="Enter transfer amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              min="0"
              step="0.01"
            />
            <button
              onClick={handleOperation}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Transfer
            </button>
          </>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between mb-4">
        <span className="text-xl font-semibold text-gray-900">
          Current Balance
        </span>
        <span className="text-2xl font-bold text-green-600">
          €{account.balance.toFixed(2)}
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="flex mb-4">
        {(["deposit", "withdraw", "transfer"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 p-2 capitalize ${
              activeTab === tab
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {renderOperationForm()}
    </div>
  );
}
