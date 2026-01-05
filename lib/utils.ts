import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currencyCode: string = "NGN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function calculateNights(checkIn: Date, checkOut: Date) {
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function calculateTaxInclusivePrice(basePrice: number, taxRate: number) {
  return basePrice + (basePrice * (taxRate / 100))
}

export function calculateTaxFromTotal(totalPrice: number, taxRate: number) {
  return totalPrice * (taxRate / (100 + taxRate))
}

export function calculateBaseFromTotal(totalPrice: number, taxRate: number) {
  return totalPrice / (1 + (taxRate / 100))
}
