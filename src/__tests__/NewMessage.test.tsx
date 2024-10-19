import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewMessage from "@/app/message/page";
import "@testing-library/jest-dom";

// Mock the necessary modules and hooks
jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: jest.fn((param) => {
      if (param === "senderId") return "123";
      if (param === "ownerId") return "456";
      return null;
    }),
  }),
}));

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    emit: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("NewMessage Component", () => {
  it("renders correctly", () => {
    render(<NewMessage />);
    expect(screen.getByText("Chat with the owner")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type your message here...")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("allows typing a message", async () => {
    render(<NewMessage />);
    const textarea = screen.getByPlaceholderText("Type your message here...");
    await userEvent.type(textarea, "Hello, owner!");
    expect(textarea).toHaveValue("Hello, owner!");
  });

  it("clears the message after sending", async () => {
    render(<NewMessage />);
    const textarea = screen.getByPlaceholderText("Type your message here...");
    const sendButton = screen.getByRole("button", { name: "Send" });

    await userEvent.type(textarea, "Test message");
    await userEvent.click(sendButton);

    expect(textarea).toHaveValue("");
  });
});
