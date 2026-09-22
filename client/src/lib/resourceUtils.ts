import { coverDesk, coverMeeting, coverEvent } from "../assets/images";
import { translate } from "./i18n";

export type ResourceItem = {
  id: string;
  name: string;
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  location: { id: string; name: string; city: string; address: string };
  type: { code: string; name: string };
};

/** Фото по номеру: covers/desk-n1.png, meeting-n2.png, event-n3.png */
const deskPhotos = import.meta.glob<string>("../assets/images/covers/desk-n*.png", {
  eager: true,
  import: "default",
});
const meetingPhotos = import.meta.glob<string>("../assets/images/covers/meeting-n*.png", {
  eager: true,
  import: "default",
});
const eventPhotos = import.meta.glob<string>("../assets/images/covers/event-n*.png", {
  eager: true,
  import: "default",
});

function photoFromGlob(globMap: Record<string, string>, prefix: string, num: number) {
  return globMap[`../assets/images/covers/${prefix}-n${num}.png`];
}

function resourceNumber(name: string, typeCode: string): number | null {
  const patterns: Record<string, RegExp> = {
    DESK: /рабочее\s+место\s*№\s*(\d+)/i,
    MEETING: /переговорная\s*№\s*(\d+)/i,
    EVENT: /зал\s+мероприятий\s*№\s*(\d+)/i,
  };
  const m = name.match(patterns[typeCode] ?? /№\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

export function typeCodeLabel(code: string) {
  switch (code) {
    case "DESK":
      return translate("resourceType.desk");
    case "MEETING":
      return translate("resourceType.meeting");
    case "EVENT":
      return translate("resourceType.event");
    default:
      return code;
  }
}

export function typeCodeFilterLabel(code: string) {
  switch (code) {
    case "DESK":
      return translate("resourceType.desks");
    case "MEETING":
      return translate("resourceType.meetings");
    case "EVENT":
      return translate("resourceType.events");
    default:
      return code;
  }
}

export function typeCodeToRu(code: string) {
  return typeCodeLabel(code, "ru");
}

export function photoForResource(typeCode: string, resourceName?: string) {
  if (resourceName) {
    const num = resourceNumber(resourceName, typeCode);
    if (num) {
      if (typeCode === "DESK") {
        const photo = photoFromGlob(deskPhotos, "desk", num);
        if (photo) return photo;
      }
      if (typeCode === "MEETING") {
        const photo = photoFromGlob(meetingPhotos, "meeting", num);
        if (photo) return photo;
      }
      if (typeCode === "EVENT") {
        const photo = photoFromGlob(eventPhotos, "event", num);
        if (photo) return photo;
      }
    }
  }

  if (typeCode === "DESK") return coverDesk;
  if (typeCode === "MEETING") return coverMeeting;
  return coverEvent;
}

export function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
