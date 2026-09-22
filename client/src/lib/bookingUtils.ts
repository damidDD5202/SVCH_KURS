import type { BookingItem } from "../components/bookings/BookingCard";

export function isBookingPast(booking: Pick<BookingItem, "endAt">) {
  return new Date(booking.endAt).getTime() < Date.now();
}

export type BookingDisplayStatus = "confirmed" | "cancelled" | "completed";

export function getBookingDisplayStatus(booking: BookingItem): BookingDisplayStatus {
  if (booking.status === "CANCELLED") return "cancelled";
  if (isBookingPast(booking)) return "completed";
  return "confirmed";
}

export function canCancelBooking(booking: BookingItem) {
  return booking.status === "CONFIRMED" && !isBookingPast(booking);
}
